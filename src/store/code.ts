import {create} from 'zustand';
import {extractFunctionParams} from '@/lib/code/code-parse';

export type DynamicParam = {key: string; label: string; type: string};

type CodeState = {
	codeByNodeId: Record<string, string>;
	dynamicParamsByNodeId: Record<string, DynamicParam[]>;
	setCode: (nodeId: string, code: string) => void;
	getCode: (nodeId: string) => string;
	getDynamicParams: (nodeId: string) => DynamicParam[];
	setMany: (entries: Array<{nodeId: string; code: string}>) => void;
};

export const useCodeStore = create<CodeState>((set, get) => ({
	codeByNodeId: {},
	dynamicParamsByNodeId: {},
	setCode: (nodeId, code) => {
		const parsed = extractFunctionParams(code);
		const dynamicParams: DynamicParam[] = parsed.ok
			? parsed.params.map((p) => ({key: p.key, label: p.key, type: p.type}))
			: [];
		set((s) => ({
			codeByNodeId: {...s.codeByNodeId, [nodeId]: code},
			dynamicParamsByNodeId: {
				...s.dynamicParamsByNodeId,
				[nodeId]: dynamicParams,
			},
		}));
	},
	getCode: (nodeId) => get().codeByNodeId[nodeId] ?? '',
	getDynamicParams: (nodeId) => get().dynamicParamsByNodeId[nodeId] ?? [],
	setMany: (entries) => {
		const updates: Record<string, string> = {};
		const dyn: Record<string, DynamicParam[]> = {};
		for (const {nodeId, code} of entries) {
			updates[nodeId] = code;
			const parsed = extractFunctionParams(code);
			dyn[nodeId] = parsed.ok
				? parsed.params.map((p) => ({key: p.key, label: p.key, type: p.type}))
				: [];
		}
		set((s) => ({
			codeByNodeId: {...s.codeByNodeId, ...updates},
			dynamicParamsByNodeId: {...s.dynamicParamsByNodeId, ...dyn},
		}));
	},
}));
