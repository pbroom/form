import {z} from 'zod';

export const GraphParameterValueSchema = z.union([
	z.number(),
	z.string(),
	z.boolean(),
	z.null(),
]);

// PI-3: Code Node schema
const CodeSocketTypeSchema = z.union([
	z.literal('number'),
	z.literal('string'),
	z.literal('boolean'),
	z.literal('color'),
]);

const CodeNodeUiHintSchema = z.object({
	min: z.number().optional(),
	max: z.number().optional(),
	step: z.number().optional(),
});

export const CodeNodeMetaSchema = z.object({
	version: z.string().min(1),
	inputs: z
		.array(
			z.object({
				key: z.string().min(1),
				type: CodeSocketTypeSchema,
				label: z.string().optional(),
			})
		)
		.default([]),
	output: z.object({type: CodeSocketTypeSchema}).optional(),
	uiHints: z.record(CodeNodeUiHintSchema).optional(),
});

const BaseGraphNodeSchema = z.object({
	id: z.string().min(1),
	typeKey: z.string().min(1),
	label: z.string().optional(),
	params: z.record(GraphParameterValueSchema).optional(),
});

const CodeGraphNodeSchema = BaseGraphNodeSchema.extend({
	typeKey: z.literal('code'),
	code: z.string().min(1),
	codeMeta: CodeNodeMetaSchema,
});

const NonCodeGraphNodeSchema = BaseGraphNodeSchema.strict().refine(
	(n) => (n as any).typeKey !== 'code',
	{
		message: 'Non-code nodes must not have typeKey=code or extra fields',
	}
);

export const GraphNodeSchema = z.union([
	CodeGraphNodeSchema,
	NonCodeGraphNodeSchema,
]);

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
