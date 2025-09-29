import {useCallback, useEffect, useRef} from 'react';

export function useDebouncedCallback<TArgs extends unknown[]>(
	fn: (...args: TArgs) => void,
	delayMs: number
) {
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const clear = () => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
		}
	};

	const debounced = useCallback(
		(...args: TArgs) => {
			clear();
			timeoutRef.current = setTimeout(() => {
				fn(...args);
			}, delayMs);
		},
		[fn, delayMs]
	) as (...args: TArgs) => void;

	useEffect(() => clear, []);

	return debounced;
}
