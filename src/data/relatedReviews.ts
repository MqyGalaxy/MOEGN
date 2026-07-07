export type RelatedReviewGroup = {
	id: string;
	title: string;
	works: string[];
};

export const relatedReviewGroups: RelatedReviewGroup[] = [
	{
		id: 'game-current-experience',
		title: '游戏体验关联',
		works: [
			'game/girls-frontline-2-exilium',
			'game/honkai-star-rail',
			'anime/mahou-shoujo-ni-akogarete',
		],
	},
];

export const getRelatedReviewWorkSlugs = (workSlug: string) => {
	const relatedWorks = relatedReviewGroups
		.filter((group) => group.works.includes(workSlug))
		.flatMap((group) => group.works)
		.filter((relatedWorkSlug) => relatedWorkSlug !== workSlug);

	return Array.from(new Set(relatedWorks));
};
