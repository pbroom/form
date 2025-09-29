import {useEffect} from 'react';

type ViteUpdate =
	| {updates?: Array<{path?: string; acceptedPath?: string}>}
	| undefined;

export function useViteCssHmr(onCssChange: () => void) {
	useEffect(() => {
		const hot =
			(typeof import.meta !== 'undefined' &&
				(
					import.meta as unknown as {
						hot?: {
							on?: (e: string, cb: (payload: ViteUpdate) => void) => void;
							off?: (e: string, cb: (payload: ViteUpdate) => void) => void;
						};
					}
				).hot) ||
			undefined;
		if (!hot) return;
		const shouldRefresh = (payload: ViteUpdate): boolean => {
			const updates = payload?.updates || [];
			return updates.some((u) => {
				const p = (u.path || u.acceptedPath || '').toString();
				return p.endsWith('.css');
			});
		};
		const refresh = (payload: ViteUpdate) => {
			if (!shouldRefresh(payload)) return;
			setTimeout(() => onCssChange(), 0);
		};
		hot.on?.('vite:beforeUpdate', refresh);
		hot.on?.('vite:afterUpdate', refresh);
		return () => {
			hot.off?.('vite:beforeUpdate', refresh);
			hot.off?.('vite:afterUpdate', refresh);
		};
	}, [onCssChange]);
}
