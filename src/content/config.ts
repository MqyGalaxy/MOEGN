import { defineCollection, z } from 'astro:content';

const stringList = z.union([z.string(), z.array(z.string())]).optional().default([]).transform((value) => (
	Array.isArray(value) ? value : [value]
));

const reviews = defineCollection({
	type: 'content',
	schema: z.object({
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

export const collections = { reviews };
