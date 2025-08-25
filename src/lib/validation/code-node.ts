// Minimal static validation for Code Node source.
// Requirements (PI-3 scope):
// - Non-empty string
// - Contains `export function node` declaration
// - Has balanced parentheses and braces (naive check)

export type CodeValidationResult = {
	ok: boolean;
	message?: string;
};

export function validateCodeNodeSource(source: string): CodeValidationResult {
	if (!source || source.trim().length === 0) {
		return {ok: false, message: 'Code cannot be empty'};
	}
	const normalized = source.replace(/\s+/g, ' ');
	if (!/export\s+function\s+node\s*\(/.test(normalized)) {
		return {ok: false, message: 'Must export a function named "node"'};
	}
	// Very naive balance check
	const paren = balanceCount(source, '(', ')');
	if (paren !== 0) {
		return {ok: false, message: 'Unbalanced parentheses'};
	}
	const brace = balanceCount(source, '{', '}');
	if (brace !== 0) {
		return {ok: false, message: 'Unbalanced braces'};
	}
	return {ok: true};
}

function balanceCount(text: string, open: string, close: string): number {
	let count = 0;
	for (const ch of text) {
		if (ch === open) count++;
		else if (ch === close) count--;
	}
	return count;
}
