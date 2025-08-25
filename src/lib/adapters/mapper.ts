import type {AdapterRegistry} from '@/lib/adapters/schema';
import type {NodeTypeDefinition} from '@/lib/node-registry';

export function mapAdapterToNodeDefinitions(
	reg: AdapterRegistry
): Record<string, NodeTypeDefinition> {
	const out: Record<string, NodeTypeDefinition> = {};
	for (const n of reg.nodes) {
		out[n.key] = {
			key: n.key,
			label: n.label,
			category: n.category,
			appearanceHint: n.appearanceHint,
			parameters: n.parameters.map((p) => ({
				key: p.key,
				label: p.label,
				type: p.type,
				defaultValue: p.defaultValue ?? null,
				min: p.min,
				max: p.max,
				step: p.step,
			})),
		};
	}
	return out;
}
