import {z} from 'zod';

export const GraphParameterValueSchema = z.union([
	z.number(),
	z.string(),
	z.boolean(),
	z.null(),
]);

export const GraphNodeSchema = z.object({
	id: z.string().min(1),
	typeKey: z.string().min(1),
	label: z.string().optional(),
	params: z.record(GraphParameterValueSchema).optional(),
});

export const GraphEdgeSchema = z.object({
	id: z.string().min(1),
	source: z.string().min(1),
	target: z.string().min(1),
	targetHandle: z.string().optional(),
});

export const GraphLayerSchema = z.object({
	nodes: z.array(GraphNodeSchema),
	edges: z.array(GraphEdgeSchema),
});

export const TreeLayerSchema = z.object({
	moduleName: z.string().min(1),
	rootType: z.literal('r3f'),
});

export const MetaLayerSchema = z.object({
	schemaVersion: z.string().min(1),
	createdAt: z.string().min(1),
	updatedAt: z.string().min(1),
});

export const IRModuleSchema = z.object({
	meta: MetaLayerSchema,
	graph: GraphLayerSchema,
	tree: TreeLayerSchema,
});

export const ProjectSchema = z.object({
	schemaVersion: z.string().min(1),
	modules: z.array(IRModuleSchema),
});

export type Project = z.infer<typeof ProjectSchema>;
