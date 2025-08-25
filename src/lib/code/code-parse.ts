export type ExtractedParam = {
	key: string;
	type: 'number' | 'string' | 'boolean';
};

// Minimal parser for `export function node(a: number, b: string)` forms
export function extractFunctionParams(source: string):
	| {
			ok: true;
			params: ExtractedParam[];
	  }
	| {ok: false; error: string} {
	const match = /export\s+function\s+node\s*\(([^)]*)\)/.exec(source);
	if (!match) return {ok: false, error: 'No function signature found'};
	const list = match[1].trim();
	if (!list) return {ok: true, params: []};
	const parts = list
		.split(',')
		.map((s) => s.trim())
		.filter(Boolean);
	const params: ExtractedParam[] = [];
	for (const p of parts) {
		const m = /^(\w+)\s*:\s*(number|string|boolean)\s*(\[\])?$/.exec(p);
		if (!m) return {ok: false, error: `Unsupported param: ${p}`};
		const key = m[1];
		const type = m[2] as ExtractedParam['type'];
		params.push({key, type});
	}
	return {ok: true, params};
}
