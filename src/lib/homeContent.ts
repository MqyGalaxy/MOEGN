type DatedReview = {
	slug: string;
	data: { disable?: boolean; publishedAt: Date };
};

type DatedCollection = {
	slug: string;
	data: { disable?: boolean; acquiredAt: Date; featured?: boolean };
};

/** The homepage introduces works; older reviews stay in the full archive. */
export function getHomepageReviews<T extends DatedReview>(entries: T[], limit = 6): T[] {
	const sorted = entries.filter((entry) => !entry.data.disable).sort((a, b) =>
		b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf() || a.slug.localeCompare(b.slug),
	);
	const works = new Set<string>();
	return sorted.filter((entry) => {
		const work = entry.slug.split('/').slice(0, -1).join('/');
		if (works.has(work)) return false;
		works.add(work);
		return true;
	}).slice(0, limit);
}

export function getHomepageCollections<T extends DatedCollection>(entries: T[], limit = 3): T[] {
	return entries.filter((entry) => !entry.data.disable).sort((a, b) =>
		Number(Boolean(b.data.featured)) - Number(Boolean(a.data.featured))
		|| b.data.acquiredAt.valueOf() - a.data.acquiredAt.valueOf()
		|| a.slug.localeCompare(b.slug),
	).slice(0, limit);
}
