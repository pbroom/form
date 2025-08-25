import {clsx, type ClassValue} from 'clsx';
import {twMerge} from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// Very minimal sandbox evaluator for Code Node (PI-3 scope only)
export function evaluateCodeNode(
	code: string,
	inputs: Record<string, unknown>
): {ok: true; value: unknown} | {ok: false; error: string} {
	try {
		// eslint-disable-next-line no-new-func
		const factory = new Function(
			`${code}; return typeof node === 'function' ? node : null;`
		);
		const impl = factory();
		if (typeof impl !== 'function') {
			return {ok: false, error: 'No exported function node found'};
		}
		const result = (impl as any)(...Object.values(inputs));
		return {ok: true, value: result};
	} catch (e: any) {
		return {ok: false, error: String(e?.message || e)};
	}
}
