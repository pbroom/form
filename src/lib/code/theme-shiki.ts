import type {ThemeRegistrationRaw} from 'shiki';

// Build a Shiki-compatible theme from CSS variables using the unified --mt- prefix.
// Hyphen names are converted to dot scopes. Language overrides use trailing -<lang>.

const LANGS = new Set(['ts', 'tsx', 'js', 'jsx', 'glsl', 'c']);

function rgbToHex(rgb: string): string | null {
	const m = rgb.match(/\d+(?:\.\d+)?/g);
	if (!m || m.length < 3) return null;
	const [r, g, b] = m.map((v) =>
		Math.max(0, Math.min(255, Math.round(Number(v))))
	) as [number, number, number];
	const toHex = (n: number) => n.toString(16).padStart(2, '0');
	return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function resolveCssVarColor(varName: string): string | null {
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

function collectCssVarValues(prefix: string): Record<string, string> {
	const result: Record<string, string> = {};
	for (const sheet of Array.from(document.styleSheets)) {
		let rules: CSSRuleList | null = null;
		try {
			rules = sheet.cssRules;
		} catch {
			continue;
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

export function buildShikiThemeFromCss(prefix = '--mt-'): ThemeRegistrationRaw {
	const vars = collectCssVarValues(prefix);
	type Row = {
		scope: string | string[];
		settings: {foreground?: string; fontStyle?: string};
		weight: number;
	};
	const rows: Array<Row> = [];
	for (const name of Object.keys(vars)) {
		const suffix = name.substring(prefix.length);
		if (suffix.endsWith('-font-style')) continue;
		const color = resolveCssVarColor(name);
		if (!color) continue;
		const font = resolveCssVarColor(`${name}-font-style`);
		const parts = suffix.split('-');
		let lang: string | null = null;
		const maybe = parts[parts.length - 1];
		if (LANGS.has(maybe)) {
			lang = maybe;
			parts.pop();
		}
		const scope = parts.join('.') + (lang ? `.${lang}` : '');
		const weight = parts.length + (lang ? 1 : 0);
		rows.push({
			scope,
			weight,
			settings: {foreground: color, fontStyle: font || undefined},
		});
	}
	rows.sort((a, b) => b.weight - a.weight);
	return {
		name: 'App Shiki Theme',
		colors: {},
		tokenColors: rows.map((r) => ({scope: r.scope, settings: r.settings})),
	} as ThemeRegistrationRaw;
}
