import { toBlob, toSvg } from 'html-to-image';

type ExportOptions = {
	width: number;
	height: number;
	pixelRatio?: number;
	backgroundColor?: string;
	includeQueryParams?: boolean;
	skipAutoScale?: boolean;
	style?: Partial<CSSStyleDeclaration>;
};

const imageDataCache = new Map<string, Promise<string>>();

const delay = (duration: number) => new Promise<void>((resolve) => {
	window.setTimeout(resolve, duration);
});

const waitForFrame = () => new Promise<void>((resolve) => {
	requestAnimationFrame(() => resolve());
});

const isAppleWebKit = () => {
	const userAgent = navigator.userAgent;
	const isIOS = /iPad|iPhone|iPod/.test(userAgent)
		|| (/Macintosh/.test(userAgent) && navigator.maxTouchPoints > 1);
	const isDesktopSafari = /Safari/.test(userAgent)
		&& !/Chrome|Chromium|CriOS|Edg|OPR|Android/.test(userAgent);

	return isIOS || isDesktopSafari;
};

const blobToDataUrl = (blob: Blob) => new Promise<string>((resolve, reject) => {
	const reader = new FileReader();

	reader.addEventListener('load', () => resolve(String(reader.result)), { once: true });
	reader.addEventListener('error', () => reject(reader.error ?? new Error('Unable to read image data')), { once: true });
	reader.readAsDataURL(blob);
});

const fetchImageData = (source: string) => {
	if (source.startsWith('data:')) return Promise.resolve(source);

	const cached = imageDataCache.get(source);
	if (cached) return cached;

	const request = fetch(source, {
		cache: 'force-cache',
		credentials: new URL(source, location.href).origin === location.origin ? 'same-origin' : 'omit',
	}).then(async (response) => {
		if (!response.ok) throw new Error(`Unable to load export image: ${response.status}`);
		return blobToDataUrl(await response.blob());
	});

	imageDataCache.set(source, request);
	request.catch(() => imageDataCache.delete(source));
	return request;
};

const waitForImage = (image: HTMLImageElement) => new Promise<void>((resolve) => {
	if (image.complete && image.naturalWidth > 0) {
		resolve();
		return;
	}

	image.addEventListener('load', () => resolve(), { once: true });
	image.addEventListener('error', () => resolve(), { once: true });
});

const inlineImages = async (root: HTMLElement) => {
	const images = Array.from(root.querySelectorAll<HTMLImageElement>('img'));

	await Promise.all(images.map(async (image) => {
		image.loading = 'eager';
		image.decoding = 'sync';
		image.removeAttribute('srcset');
		image.removeAttribute('sizes');

		const source = image.currentSrc || image.src;
		if (!source) return;

		try {
			image.src = await fetchImageData(source);
			await waitForImage(image);
		} catch (error) {
			console.warn('MOEGN export could not inline an image; using its original URL.', source, error);
		}
	}));

	return images.length;
};

const loadSvgImage = (source: string, width: number, height: number) => new Promise<HTMLImageElement>((resolve, reject) => {
	const image = new Image();

	image.decoding = 'sync';
	image.width = width;
	image.height = height;
	image.style.position = 'fixed';
	image.style.left = '-100000px';
	image.style.top = '0';
	image.style.width = `${width}px`;
	image.style.height = `${height}px`;
	image.style.pointerEvents = 'none';
	image.addEventListener('load', () => resolve(image), { once: true });
	image.addEventListener('error', () => reject(new Error('Unable to decode export SVG')), { once: true });
	image.src = source;
	document.body.appendChild(image);
});

const canvasToBlob = (canvas: HTMLCanvasElement) => new Promise<Blob>((resolve, reject) => {
	canvas.toBlob((blob) => {
		if (blob) resolve(blob);
		else reject(new Error('Unable to encode export canvas'));
	}, 'image/png');
});

const renderAppleWebKitBlob = async (
	root: HTMLElement,
	options: ExportOptions,
	imageCount: number,
) => {
	const { width, height, pixelRatio = 1, backgroundColor, ...svgOptions } = options;
	const svgSource = await toSvg(root, {
		...svgOptions,
		backgroundColor,
		cacheBust: false,
		height,
		includeQueryParams: true,
		width,
	});
	const svgImage = await loadSvgImage(svgSource, width, height);

	try {
		try {
			await svgImage.decode();
		} catch {
			// WebKit can reject decode() for an SVG that still renders correctly.
		}

		await delay(Math.min(1400, 300 + imageCount * 120));

		const canvas = document.createElement('canvas');
		const ratio = Math.max(1, pixelRatio);
		canvas.width = Math.ceil(width * ratio);
		canvas.height = Math.ceil(height * ratio);

		const context = canvas.getContext('2d');
		if (!context) throw new Error('Canvas 2D is unavailable');

		context.setTransform(ratio, 0, 0, ratio, 0, 0);
		const attempts = Math.max(3, Math.min(10, imageCount + 1));

		for (let attempt = 0; attempt < attempts; attempt += 1) {
			context.clearRect(0, 0, width, height);
			if (backgroundColor && backgroundColor !== 'transparent' && backgroundColor !== '#00000000') {
				context.fillStyle = backgroundColor;
				context.fillRect(0, 0, width, height);
			}
			context.drawImage(svgImage, 0, 0, width, height);

			if (attempt < attempts - 1) await delay(120);
		}

		return await canvasToBlob(canvas);
	} finally {
		svgImage.remove();
	}
};

export const exportDomToPng = async (source: HTMLElement, options: ExportOptions) => {
	const { width, height } = options;
	const host = document.createElement('div');
	const clone = source.cloneNode(true) as HTMLElement;
	const appleWebKit = isAppleWebKit();

	host.style.position = 'fixed';
	host.style.left = '-100000px';
	host.style.top = '0';
	host.style.width = `${width}px`;
	host.style.height = `${height}px`;
	host.style.pointerEvents = 'none';
	host.style.zIndex = '-1';

	clone.classList.add('is-dom-exporting');
	if (appleWebKit) clone.classList.add('is-apple-webkit-export');
	Object.assign(clone.style, options.style ?? {}, {
		width: `${width}px`,
		transform: 'none',
		transformOrigin: 'top left',
	});

	host.appendChild(clone);
	document.body.appendChild(host);

	try {
		await document.fonts?.ready;
		const imageCount = await inlineImages(clone);
		await waitForFrame();
		await waitForFrame();

		if (appleWebKit) {
			return await renderAppleWebKitBlob(clone, options, imageCount);
		}

		const blob = await toBlob(clone, {
			...options,
			cacheBust: false,
			includeQueryParams: true,
		});

		if (!blob) throw new Error('DOM export failed');
		return blob;
	} finally {
		host.remove();
	}
};
