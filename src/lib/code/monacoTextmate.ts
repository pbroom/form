import type {Monaco} from '@monaco-editor/react';
import {Registry} from 'monaco-textmate';

export type GrammarSpec = {
	languageId: string;
	scopeName: string;
	path: string; // URL or relative path to the tmLanguage.json
	embeddedLanguages?: Record<string, number>;
};

type OnigLibLocal = {
	createOnigScanner: (patterns: Array<string>) => unknown;
	createOnigString: (s: string) => unknown;
};

export async function loadOnigasmWasm(
	onigWasmUrl: string
): Promise<OnigLibLocal> {
	const wasm = await fetch(onigWasmUrl).then((r) => r.arrayBuffer());
	const onig = await import('onigasm');
	await onig.loadWASM(wasm);
	return {
		createOnigScanner(patterns: Array<string>) {
			return new onig.OnigScanner(patterns);
		},
		createOnigString(s: string) {
			return new onig.OnigString(s);
		},
	};
}

type TMThemeSetting = {
	scope?: string | Array<string>;
	settings: {foreground?: string; fontStyle?: string};
};
export type TMTheme = {name: string; settings: Array<TMThemeSetting>};

export function buildTextMateThemeFromCss(
	getVar: (name: string) => string | null,
	scopesPrefix: string
): TMTheme {
	const theme: TMTheme = {name: 'App TM Theme', settings: []};
	// walk computed styles via CSSOM scanning similar to CodeView logic
	const collect = (prefix: string) => {
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
	};
	const vars = collect(scopesPrefix);
	const LANGS = new Set(['ts', 'tsx', 'js', 'jsx', 'glsl', 'c']);
	type Row = {
		scope: string;
		settings: {foreground?: string; fontStyle?: string};
		weight: number;
	};
	const rows: Array<Row> = [];
	for (const name of Object.keys(vars)) {
		const suffix = name.substring(scopesPrefix.length);
		if (suffix.endsWith('-font-style')) continue;
		const foreground = getVar(name);
		if (!foreground) continue;
		const fontStyle = getVar(`${name}-font-style`);
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
			settings: {foreground, fontStyle: fontStyle || undefined},
			weight,
		});
	}
	rows.sort((a, b) => b.weight - a.weight);
	for (const r of rows)
		theme.settings.push({scope: r.scope, settings: r.settings});
	return theme;
}

export type BundledGrammar = {
	languageId: string;
	scopeName: string;
	content: string;
};

export async function wireTextMate(
	monaco: Monaco,
	grammars: Array<GrammarSpec>,
	getVar: (name: string) => string | null,
	scopesPrefix: string,
	onigWasmUrl: string,
	bundled?: Array<BundledGrammar>
) {
	const onigLib = await loadOnigasmWasm(onigWasmUrl);
	const tmTheme = buildTextMateThemeFromCss(getVar, scopesPrefix);
	const bundledByScope = new Map<string, BundledGrammar>();
	for (const b of bundled ?? []) bundledByScope.set(b.scopeName, b);

	const registry = new Registry({
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		getGrammarDefinition: async (scopeName: string): Promise<any> => {
			const fromBundle = bundledByScope.get(scopeName);
			if (fromBundle) {
				return {format: 'json', content: fromBundle.content};
			}
			const spec = grammars.find((g) => g.scopeName === scopeName);
			if (!spec) {
				return {format: 'json', content: '{}'};
			}
			const content = await fetch(spec.path).then((r) => r.text());
			return {format: 'json', content};
		},
	});

	// If Registry supports theming, apply it
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	if (typeof (registry as any).setTheme === 'function') {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(registry as any).setTheme(tmTheme as any);
	}

	const grammarsMap = new Map<string, string>();
	for (const g of grammars) grammarsMap.set(g.languageId, g.scopeName);
	for (const b of bundled ?? []) grammarsMap.set(b.languageId, b.scopeName);

	const mtm = await import('monaco-textmate');
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const wire = (mtm as any).wireTmGrammars as (
		monacoNs: unknown,
		reg: unknown,
		map: Map<string, string>,
		onig: unknown
	) => Promise<void>;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	await wire(monaco as any, registry as any, grammarsMap, onigLib as any);

	return {tmTheme};
}
