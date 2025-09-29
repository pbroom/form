export type NodeId = string;
export type EdgeId = string;

export type GraphParameterValue = number | string | boolean | null;

// Runtime IR – Template & Instance model (extensible; backward compatible)
export type PortType =
	| 'number'
	| 'string'
	| 'boolean'
	| 'color'
	| 'asset'
	| 'any';

export type TemplatePorts = {
	inputs: Array<{
		key: string;
		type: PortType;
		required?: boolean;
		variadic?: boolean;
	}>;
	outputs: Array<{
		key: string;
		type: PortType;
		defaultExport?: boolean;
	}>;
	exposure?: string[]; // for subgraph templates: which ports are exposed to parent
};

export type TemplateManifest = {
	name: string;
	kind: 'code' | 'subgraph';
	version: string; // semver
	tags?: string[];
	ports: TemplatePorts;
	uiHints?: Record<
		string,
		{
			min?: number;
			max?: number;
			step?: number;
			control?: 'slider' | 'select' | 'color' | 'checkbox' | 'text';
		}
	>;
	// kind-specific payloads
	code?: {source: string}; // when kind === 'code'
	subgraphRef?: {moduleName: string}; // when kind === 'subgraph'
};

export type TemplateAttachment = 'linked' | 'forked' | 'inline' | 'baked';

export type TemplateRef = {
	id: string; // template identifier (library-scoped or project-scoped)
	version: string; // semver
	attachment: TemplateAttachment;
	inlineManifest?: TemplateManifest; // present when attachment === 'inline'
	bakedArtifactRef?: string; // present when attachment === 'baked'
};

export type NodeHud = {
	kind: 'tags' | 'preview' | 'metric';
	config?: Record<string, unknown>;
};

export type GraphNode = {
	id: NodeId;
	typeKey: string;
	label?: string;
	params?: Record<string, GraphParameterValue>;
	// Optional runtime IR extensions for templates and presentation
	templateRef?: TemplateRef;
	hud?: NodeHud;
};

export type GraphEdge = {
	id: EdgeId;
	source: NodeId;
	target: NodeId;
	targetHandle?: string; // parameter key on target
};

export type GraphLayer = {
	nodes: GraphNode[];
	edges: GraphEdge[];
};

export type TreeLayer = {
	moduleName: string; // e.g., MainScene
	// Minimal placeholder for JSX scene description; refined later
	rootType: 'r3f';
};

export type MetaLayer = {
	schemaVersion: string;
	createdAt: string;
	updatedAt: string;
};

export type IRModule = {
	meta: MetaLayer;
	graph: GraphLayer;
	tree: TreeLayer;
};

export type Project = {
	schemaVersion: string;
	modules: IRModule[];
};
