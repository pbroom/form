export type NodeId = string;
export type EdgeId = string;

export type GraphParameterValue = number | string | boolean | null;

export type GraphNode = {
	id: NodeId;
	typeKey: string;
	label?: string;
	params?: Record<string, GraphParameterValue>;
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
