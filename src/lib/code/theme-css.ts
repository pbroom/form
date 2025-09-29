// Utilities to build Monaco themes from CSS variables and handle scope rules.
// Kept framework-agnostic so they can be reused outside CodeView.

export type ThemeRule = {
	token: string;
	foreground?: string;
	fontStyle?: string;
	background?: string;
};

export type CssVarsConfigLike = {
	enabled: boolean;
	colorsPrefix: string;
	tokensPrefix: string; // expected '--mt-'
	textMate?: {enabled: boolean; scopesPrefix: string}; // expected '--mt-'
	colorsOverrides?: Record<string, string>;
	tokensOverrides?: Array<{token: string; var: string; fontStyleVar?: string}>;
};

export function rgbToHex(rgb: string): string | null {
	const m = rgb.match(/\d+(?:\.\d+)?/g);
	if (!m || m.length < 3) return null;
	const [r, g, b] = m.map((v) =>
		Math.max(0, Math.min(255, Math.round(Number(v))))
	) as [number, number, number];
	const toHex = (n: number) => n.toString(16).padStart(2, '0');
	return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function resolveCssVarColor(varName: string): string | null {
	if (typeof window === 'undefined' || !document?.body) return null;
	const el = document.createElement('div');
	el.style.display = 'none';
	el.style.backgroundColor = `var(${varName})`;
	document.body.appendChild(el);
	const color = window.getComputedStyle(el).backgroundColor;
	el.remove();
	if (!color) return null;
	return rgbToHex(color) ?? color;
}

export function collectCssVarValues(prefix: string): Record<string, string> {
	const result: Record<string, string> = {};
	if (typeof document === 'undefined') return result;
	for (const sheet of Array.from(document.styleSheets)) {
		let rules: CSSRuleList | null = null;
		try {
			rules = sheet.cssRules;
		} catch {
			continue; // cross-origin
		}
		if (!rules) continue;
		for (const rule of Array.from(rules)) {
			// @ts-expect-error narrow CSSOM
			const style: CSSStyleDeclaration | null = rule.style || null;
			if (!style) continue;
			for (let i = 0; i < style.length; i++) {
				const prop = style.item(i);
				if (prop.startsWith('--') && prop.startsWith(prefix)) {
					const val = style.getPropertyValue(prop).trim();
					if (val) result[prop] = val;
				}
			}
		}
	}
	return result;
}

// Build rules from --mt-<scope> and --mt-<scope>-<lang> with lang override priority
export function buildTokenRulesFromPrefix(
	prefix: string,
	languageIds: Set<string>
): Array<ThemeRule> {
	const vars = collectCssVarValues(prefix);
	const baseRules: Map<string, ThemeRule> = new Map();
	const langRules: Array<{lang: string; rule: ThemeRule}> = [];
	for (const varName of Object.keys(vars)) {
		const suffix = varName.substring(prefix.length); // e.g., punctuation-definition-block or punctuation-definition-block-tsx
		if (suffix.endsWith('-font-style')) continue;
		if (suffix.endsWith('-background')) continue;
		const segments = suffix.split('-');
		let lang: string | null = null;
		// detect trailing -<lang>
		const maybeLang = segments[segments.length - 1];
		if (languageIds.has(maybeLang)) {
			lang = maybeLang;
			segments.pop();
		}
		const token = segments.join('.');
		const color = resolveCssVarColor(varName);
		if (!color) continue;
		const fontStyleVar = `${varName}-font-style`;
		const fontStyle = vars[fontStyleVar] || null;
		const backgroundVar = `${varName}-background`;
		const background = resolveCssVarColor(backgroundVar) || undefined;
		const rule: ThemeRule = {
			token,
			foreground: color.replace('#', '').toUpperCase(),
			fontStyle: fontStyle || undefined,
			background: background
				? background.replace('#', '').toUpperCase()
				: undefined,
		};
		if (lang) langRules.push({lang, rule});
		else baseRules.set(token, rule);
	}
	// Apply language-specific rules as token.<lang> and override base
	const result: Array<ThemeRule> = Array.from(baseRules.values());
	for (const {lang, rule} of langRules) {
		result.push({...rule, token: `${rule.token}.${lang}`});
	}
	return result;
}

export function buildEditorColorsFromPrefix(
	prefix: string
): Record<string, string> {
	const vars = collectCssVarValues(prefix);
	const colors: Record<string, string> = {};
	for (const varName of Object.keys(vars)) {
		const suffix = varName.substring(prefix.length);
		const key = suffix.replace(/-/g, '.');
		const color = resolveCssVarColor(varName);
		if (color) colors[key] = color;
	}
	return colors;
}

export function buildTextMateScopeRulesFromPrefix(
	prefix: string
): Array<ThemeRule> {
	// For `--mt-` we build scope-style tokens too so TM can pick them up consistently
	return buildTokenRulesFromPrefix(prefix, new Set());
}

export function composeTheme(
	base: {colors?: Record<string, string>; rules?: Array<ThemeRule>},
	cfg: CssVarsConfigLike,
	buildRulesFromCssVarsFn: (
		getVar: (name: string) => string | null,
		mappings: Array<{token: string; var: string; fontStyleVar?: string}>
	) => Array<{token: string; foreground?: string; fontStyle?: string}>,
	languageIds: Set<string>
) {
	if (!cfg.enabled) return base;
	const colors: Record<string, string> = {
		...buildEditorColorsFromPrefix(cfg.colorsPrefix),
		...(base.colors || {}),
	};
	if (cfg.colorsOverrides) {
		for (const [monacoKey, cssVarName] of Object.entries(cfg.colorsOverrides)) {
			const resolved = resolveCssVarColor(cssVarName);
			if (resolved) colors[monacoKey] = resolved;
		}
	}
	let rules: Array<ThemeRule> = buildTokenRulesFromPrefix(
		cfg.tokensPrefix,
		languageIds
	);
	if (!rules.length && cfg.tokensOverrides) {
		rules = buildRulesFromCssVarsFn(
			resolveCssVarColor,
			cfg.tokensOverrides
		) as Array<ThemeRule>;
	}
	if (cfg.textMate?.enabled) {
		const tmRules = buildTextMateScopeRulesFromPrefix(
			cfg.textMate.scopesPrefix
		);
		rules = [...rules, ...tmRules];
	}
	return {...base, colors, rules};
}
