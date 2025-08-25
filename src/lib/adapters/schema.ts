import {z} from 'zod';

export const AdapterParameterSchema = z.object({
	key: z.string().min(1),
	label: z.string().min(1),
	type: z.union([
		z.literal('number'),
		z.literal('color'),
		z.literal('string'),
		z.literal('boolean'),
	]),
	defaultValue: z.union([z.number(), z.string(), z.boolean()]).optional(),
	min: z.number().optional(),
	max: z.number().optional(),
	step: z.number().optional(),
});

export const AdapterNodeTemplateSchema = z.object({
	key: z.string().min(1),
	label: z.string().min(1),
	category: z.union([
		z.literal('scene'),
		z.literal('geometry'),
		z.literal('material'),
		z.literal('mesh'),
		z.literal('light'),
		z.literal('utility'),
	]),
	appearanceHint: z
		.union([
			z.literal('structure'),
			z.literal('material'),
			z.literal('light'),
			z.literal('utility'),
		])
		.optional(),
	parameters: z.array(AdapterParameterSchema).default([]),
});

export const AdapterRegistrySchema = z.object({
	name: z.string().min(1),
	version: z.string().min(1),
	nodes: z.array(AdapterNodeTemplateSchema),
});

export type AdapterRegistry = z.infer<typeof AdapterRegistrySchema>;
