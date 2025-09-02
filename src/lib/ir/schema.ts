import {z} from 'zod';

export const GraphParameterValueSchema = z.union([
	z.number(),
	z.string(),
	z.boolean(),
	z.null(),
]);

// Runtime IR – Template & Instance model
const PortTypeSchema = z.union([
	z.literal('number'),
	z.literal('string'),
	z.literal('boolean'),
	z.literal('color'),
	z.literal('asset'),
	z.literal('any'),
]);

const TemplatePortsSchema = z.object({
	inputs: z
		.array(
			z.object({
				key: z.string().min(1),
				type: PortTypeSchema,
				required: z.boolean().optional(),
				variadic: z.boolean().optional(),
			})
		)
		.default([]),
	outputs: z
		.array(
			z.object({
				key: z.string().min(1),
				type: PortTypeSchema,
				defaultExport: z.boolean().optional(),
			})
		)
		.default([]),
	exposure: z.array(z.string().min(1)).optional(),
});

const TemplateUiHintSchema = z.object({
	min: z.number().optional(),
	max: z.number().optional(),
	step: z.number().optional(),
	control: z
		.union([
			z.literal('slider'),
			z.literal('select'),
			z.literal('color'),
			z.literal('checkbox'),
			z.literal('text'),
		])
		.optional(),
});

export const TemplateManifestSchema = z.object({
	name: z.string().min(1),
	kind: z.union([z.literal('code'), z.literal('subgraph')]),
	version: z.string().min(1),
	tags: z.array(z.string()).optional(),
	ports: TemplatePortsSchema,
	uiHints: z.record(TemplateUiHintSchema).optional(),
	code: z.object({source: z.string().min(1)}).optional(),
	subgraphRef: z.object({moduleName: z.string().min(1)}).optional(),
});

const TemplateAttachmentSchema = z.union([
	z.literal('linked'),
	z.literal('forked'),
	z.literal('inline'),
	z.literal('baked'),
]);

export const TemplateRefSchema = z.object({
	id: z.string().min(1),
	version: z.string().min(1),
	attachment: TemplateAttachmentSchema,
	inlineManifest: TemplateManifestSchema.optional(),
	bakedArtifactRef: z.string().min(1).optional(),
});

export const NodeHudSchema = z.object({
	kind: z.union([z.literal('tags'), z.literal('preview'), z.literal('metric')]),
	config: z.record(z.unknown()).optional(),
});

// PI-3: Code Node schema (retained for backwards compatibility)
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
	// Runtime IR extensions
	templateRef: TemplateRefSchema.optional(),
	hud: NodeHudSchema.optional(),
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
