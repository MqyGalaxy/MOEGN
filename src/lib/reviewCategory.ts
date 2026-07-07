import { getCollection, type CollectionEntry } from 'astro:content';
import {
	matchesReviewCategory,
	type ReviewCategory,
} from '../data/reviewCategories';
import { getAwardSortRank, getSortedOtherTags } from '../data/reviewTags';

type ReviewEntry = CollectionEntry<'reviews'>;

export type CategoryReview = ReviewEntry['data'] & {
	href: string;
	isOutdated: boolean;
	otherTags: ReturnType<typeof getSortedOtherTags>;
};

const getWorkPath = (slug: string) => slug.split('/').slice(0, -1).join('/');

const getScoreValue = (score: string) => {
	const scoreValue = Number.parseFloat(score);

	return Number.isFinite(scoreValue) ? scoreValue : -Infinity;
};

const hasOngoingMarker = (review: CategoryReview) => (
	review.score.includes('🕶')
	|| review.scoreTag.includes('🕶')
	|| review.subCategor.some((subCategor) => subCategor.includes('🕶'))
	|| review.subTag.some((subTag) => subTag.includes('🕶'))
);

export const getCategoryReviews = async (category: ReviewCategory): Promise<CategoryReview[]> => {
	const reviewEntries = (await getCollection('reviews')).sort(
		(left, right) => right.data.publishedAt.valueOf() - left.data.publishedAt.valueOf(),
	);
	const latestReviewByWork = new Map<string, ReviewEntry>();

	for (const review of reviewEntries) {
		const workPath = getWorkPath(review.slug);
		const latestReview = latestReviewByWork.get(workPath);

		if (!latestReview || review.data.publishedAt.valueOf() > latestReview.data.publishedAt.valueOf()) {
			latestReviewByWork.set(workPath, review);
		}
	}

	return reviewEntries
		.filter((review) => matchesReviewCategory(review.data, category))
		.map((review) => {
			const latestReview = latestReviewByWork.get(getWorkPath(review.slug));
			const otherTags = getSortedOtherTags(review.data.otherTag);

			return {
				...review.data,
				href: `/reviews/${review.slug}/`,
				isOutdated: Boolean(latestReview && latestReview.slug !== review.slug),
				otherTags,
			};
		})
		.sort((left, right) => {
			if (category.slug === 'anime') {
				const ongoingSort = Number(hasOngoingMarker(left)) - Number(hasOngoingMarker(right));

				if (ongoingSort !== 0) return ongoingSort;
			}

			if (category.match?.subCategor) {
				const awardSort = getAwardSortRank(left.otherTags) - getAwardSortRank(right.otherTags);

				if (awardSort !== 0) return awardSort;

				const scoreSort = getScoreValue(right.score) - getScoreValue(left.score);

				if (scoreSort !== 0) return scoreSort;
			}

			return right.publishedAt.valueOf() - left.publishedAt.valueOf();
		});
};
