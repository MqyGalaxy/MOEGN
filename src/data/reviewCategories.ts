export interface ReviewCategory {
	slug: string;
	title: string;
	description: string;
	icon: 'calendar' | 'trophy' | 'anime' | 'game' | 'book' | 'music';
	tone: 'rose' | 'gold' | 'cyan' | 'violet' | 'green' | 'blue';
	featured?: boolean;
	match?: {
		proClass?: string;
		subCategor?: string;
		year?: number;
		month?: number;
	};
}

export interface ReviewCategoryCandidate {
	proClass: string;
	subCategor?: string | string[];
	subTag?: string | string[];
	publishedAt: Date;
}

export const reviewCategories: ReviewCategory[] = [
	{
		slug: '2025-july-anime',
		title: '2025七月新番',
		description: '夏季追番专题',
		icon: 'calendar',
		tone: 'rose',
		match: { subCategor: '2025-july-anime' },
	},
	{
		slug: '2026-july-anime',
		title: '2026七月新番',
		description: '夏季追番专题',
		icon: 'calendar',
		tone: 'rose',
		featured: true,
		match: { subCategor: '2026-july-anime' },
	},
	{
		slug: '2026-games',
		title: '2026年度游戏',
		description: '年度游戏记录',
		icon: 'trophy',
		tone: 'gold',
		featured: true,
		match: { subCategor: '2026-games' },
	},
	{
		slug: 'anime',
		title: '番剧',
		description: '动画与剧集评测',
		icon: 'anime',
		tone: 'cyan',
		match: { proClass: '番剧' },
	},
	{
		slug: 'game',
		title: '游戏',
		description: '主机、PC 与手游评测',
		icon: 'game',
		tone: 'violet',
		match: { proClass: '游戏' },
	},
	{
		slug: 'manga',
		title: '漫画',
		description: '漫画与读物评测',
		icon: 'book',
		tone: 'green',
		match: { proClass: '漫画' },
	},
	{
		slug: 'music',
		title: '音乐',
		description: '音乐与专辑评测',
		icon: 'music',
		tone: 'blue',
		match: { proClass: '音乐' },
	},
];

export const featuredReviewCategories = reviewCategories.filter((category) => category.featured);
export const standardReviewCategories = reviewCategories.filter((category) => !category.featured && !category.match?.subCategor);
export const subCategorReviewCategories = reviewCategories.filter((category) => Boolean(category.match?.subCategor));

export const getReviewCategoryHref = (slug: string) => `/reviews/category/${slug}/`;

export const matchesReviewCategory = (review: ReviewCategoryCandidate, category: ReviewCategory) => {
	if (!category.match) return true;

	if (category.match.proClass && review.proClass !== category.match.proClass) {
		return false;
	}

	if (category.match.subCategor) {
		const reviewSubCategorValues = [
			...(Array.isArray(review.subCategor) ? review.subCategor : [review.subCategor].filter((subCategor): subCategor is string => Boolean(subCategor))),
			...(Array.isArray(review.subTag) ? review.subTag : [review.subTag].filter((subTag): subTag is string => Boolean(subTag))),
		].map((subCategor) => subCategor.trim());
		const categorySubCategorAliases = [category.match.subCategor, category.slug, category.title]
			.map((subCategor) => subCategor.trim());

		if (!reviewSubCategorValues.some((subCategor) => categorySubCategorAliases.includes(subCategor))) {
			return false;
		}
	}

	if (category.match.year || category.match.month) {
		const publishedAt = new Date(review.publishedAt);

		if (category.match.year && publishedAt.getFullYear() !== category.match.year) {
			return false;
		}

		if (category.match.month && publishedAt.getMonth() + 1 !== category.match.month) {
			return false;
		}
	}

	return true;
};

export const getReviewSubCategorCategories = (review: ReviewCategoryCandidate) => (
	subCategorReviewCategories.filter((category) => matchesReviewCategory(review, category))
);
