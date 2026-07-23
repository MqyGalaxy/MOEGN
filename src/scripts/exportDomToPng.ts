import { toBlob } from 'html-to-image';
import { domToBlob } from 'modern-screenshot';

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

const renderAppleWebKitBlob = async (
	root: HTMLElement,
	options: ExportOptions,
) => {
	const {
		width,
		height,
		pixelRatio = 1,
		backgroundColor,
		style,
	} = options;

	return domToBlob(root, {
		width,
		height,
		scale: Math.max(1, pixelRatio),
		backgroundColor: backgroundColor ?? null,
		style: style ?? null,
		type: 'image/png',
		drawImageInterval: 150,
		features: {
			copyScrollbar: false,
			fixSvgXmlDecode: true,
			removeAbnormalAttributes: true,
			removeControlCharacter: true,
			restoreScrollPosition: false,
		},
		fetch: {
			requestInit: { cache: 'force-cache' },
			bypassingCache: false,
		},
	});
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
		await inlineImages(clone);
		await waitForFrame();
		await waitForFrame();

		if (appleWebKit) {
			return await renderAppleWebKitBlob(clone, options);
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
