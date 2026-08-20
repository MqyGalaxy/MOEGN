export interface CollectionCategory {
	slug: string;
	title: string;
	englishTitle: string;
	description: string;
	index: string;
	tone: string;
	accent: string;
	softAccent: string;
	background: string;
	backgroundAlt: string;
	foreground: string;
	muted: string;
	signal: string;
	grid: string;
}

export interface CollectionCategoryCandidate {
	category: string;
}

export const collectionCategories: CollectionCategory[] = [
	{
		slug: 'display-pieces',
		title: '实体陈列',
		englishTitle: 'DISPLAY PIECES',
		description: '从亚克力、挂件到值得占据一格展示柜的角色周边。',
		index: '01',
		tone: 'champagne',
		accent: '#9d6c48',
		softAccent: '#f2dfcf',
		background: '#2b211d',
		backgroundAlt: '#6f4934',
		foreground: '#fffaf4',
		muted: '#d8c3b4',
		signal: '#ffba75',
		grid: '#cfa885',
	},
	{
		slug: 'digital-archive',
		title: '数字藏品',
		englishTitle: 'DIGITAL ARCHIVE',
		description: '不会落灰的收藏：限定立绘、纪念档案与虚拟纪念物。',
		index: '02',
		tone: 'violet',
		accent: '#795b9d',
		softAccent: '#e8def3',
		background: '#21182b',
		backgroundAlt: '#60477f',
		foreground: '#fcf8ff',
		muted: '#c9bbd8',
		signal: '#c995ff',
		grid: '#9c7ebd',
	},
	{
		slug: 'pocket-memories',
		title: '随身纪念',
		englishTitle: 'POCKET MEMORIES',
		description: '被带回日常的小物件，以及它们替某段时间保存的触感。',
		index: '03',
		tone: 'sage',
		accent: '#557d73',
		softAccent: '#dcebe5',
		background: '#1c2b29',
		backgroundAlt: '#426a62',
		foreground: '#f4fbf8',
		muted: '#b7cec7',
		signal: '#8ee0c9',
		grid: '#6f9e93',
	},
	{
		slug: 'citizen-collection',
		title: '公民收藏',
		englishTitle: 'CITIZEN COLLECTION',
		description: '向往浩瀚星海。',
		index: '04',
		tone: 'orbital',
		accent: '#28536d',
		softAccent: '#dbe9f3',
		background: '#06121c',
		backgroundAlt: '#123149',
		foreground: '#edf7fd',
		muted: '#8ea8ba',
		signal: '#58d5ff',
		grid: '#28536d',
	},
];

export const getCollectionCategoryHref = (slug: string) => `/collections/category/${slug}/`;

export const getCollectionCategory = (slug: string) => (
	collectionCategories.find((category) => category.slug === slug)
);

export const matchesCollectionCategory = (
	item: CollectionCategoryCandidate,
	category: CollectionCategory,
) => item.category === category.slug;
