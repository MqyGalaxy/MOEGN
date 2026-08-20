import { defineCollection, z } from 'astro:content';

const stringList = z.union([z.string(), z.array(z.string())]).optional().default([]).transform((value) => (
	Array.isArray(value) ? value : [value]
));

const reviews = defineCollection({
	type: 'content',
	schema: z.object({
		disable: z.boolean().optional().default(false),
		title: z.string(),
		subTitle: z.string(),
		score: z.string(),
		scoreTag: z.string(),
		summary: z.string(),
		proClass: z.string(),
		subCategor: stringList,
		subTag: stringList,
		otherTag: stringList,
		reviewType: z.string().optional().default('初评'),
		infoSummary: z.array(z.object({
			label: z.string(),
			value: z.string(),
		})).optional().default([]),
		previewVideo: z.string().optional(),
		previewVideoTitle: z.string().optional(),
		previewVideoCover: z.string().optional(),
		previewImages: z.array(z.string()).optional().default([]),
		imgSrc: z.string().url(),
		publishedAt: z.coerce.date(),
		buttonText: z.string().optional().default('查看详情'),
		blogHref: z.string().url().optional(),
		thirdPartyLinks: z.array(z.object({
			label: z.string(),
			href: z.string().url(),
		})).optional().default([]),
	}),
});

const collectionItems = defineCollection({
	type: 'content',
	schema: z.object({
		disable: z.boolean().optional().default(false),
		title: z.string(),
		subTitle: z.string(),
		summary: z.string(),
		category: z.string(),
		itemType: z.enum(['virtual', 'physical']),
		tags: z.array(z.string()).optional().default([]),
		imageKey: z.string(),
		acquiredAt: z.coerce.date(),
		maker: z.string().optional(),
		edition: z.string().optional(),
		featured: z.boolean().optional().default(false),
		presentation: z.enum(['default', 'product']).optional().default('default'),
		specs: z.array(z.object({
			label: z.string(),
			value: z.string(),
			unit: z.string().optional(),
		})).optional().default([]),
		gallery: z.array(z.object({
			src: z.string(),
			alt: z.string(),
			caption: z.string().optional(),
		})).optional().default([]),
		modules: z.array(z.object({
			kicker: z.string(),
			title: z.string(),
			summary: z.string(),
			image: z.string().optional(),
		})).optional().default([]),
		sourceLinks: z.array(z.object({
			label: z.string(),
			href: z.string().url(),
		})).optional().default([]),
		legalNotice: z.string().optional(),
		heroMedia: z.object({
			type: z.enum(['image', 'video']),
			src: z.string(),
			poster: z.string().optional(),
			position: z.string().optional().default('center'),
		}).optional(),
	}),
});

export const collections = { reviews, collections: collectionItems };
