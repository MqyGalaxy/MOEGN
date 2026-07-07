export type ReviewTagTone = 'gold' | 'silver' | 'bronze';

export interface ReviewTagMeta {
	label: string;
	tone: ReviewTagTone;
	rank: number;
}

const normalizeReviewTags = (value?: string | string[]) => (
	(Array.isArray(value) ? value : [value])
		.filter((tag): tag is string => Boolean(tag))
		.map((tag) => tag.trim())
		.filter(Boolean)
);

export const getReviewTagMeta = (tag: string): ReviewTagMeta => {
	const explicitTone = tag.match(/^(gold|silver|bronze|金|银|铜)[:：](.+)$/i);
	const label = explicitTone ? explicitTone[2].trim() : tag;
	const explicitToneValue = explicitTone?.[1].toLowerCase();

	if (explicitToneValue === 'gold' || explicitToneValue === '金') {
		return { label, tone: 'gold', rank: 0 };
	}

	if (explicitToneValue === 'silver' || explicitToneValue === '银') {
		return { label, tone: 'silver', rank: 1 };
	}

	if (explicitToneValue === 'bronze' || explicitToneValue === '铜') {
		return { label, tone: 'bronze', rank: 2 };
	}

	if (/^(1st|no\.?1|第一|冠军)$/i.test(label) || label === '年度最佳游戏') {
		return { label, tone: 'gold', rank: 0 };
	}

	if (/^(2nd|第二|亚军)$/i.test(label)) {
		return { label, tone: 'silver', rank: 1 };
	}

	if (/^(3rd|第三|季军)$/i.test(label)) {
		return { label, tone: 'bronze', rank: 2 };
	}

	return { label, tone: 'silver', rank: 1 };
};

export const getSortedOtherTags = (value?: string | string[]) => (
	normalizeReviewTags(value)
		.map((tag, index) => ({ ...getReviewTagMeta(tag), index }))
		.sort((left, right) => left.rank - right.rank || left.index - right.index)
);

export const getAwardSortRank = (tags: ReviewTagMeta[]) => (
	tags.length ? Math.min(...tags.map((tag) => tag.rank)) : 999
);
