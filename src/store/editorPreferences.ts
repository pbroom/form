import {create} from 'zustand';

export type MonacoMinimapOptions = {
	enabled: boolean;
	renderCharacters?: boolean;
	side?: 'left' | 'right';
	scale?: number;
};

export type MonacoThemeColors = {
	base: 'vs' | 'vs-dark';
	inherit: boolean;
	rules: Array<{token: string; foreground?: string; fontStyle?: string}>;
	colors: Record<string, string>;
};

type CssVarsConfig = {
	enabled: boolean;
	colorsPrefix: string; // e.g., "--monaco-editor-"
	tokensPrefix: string; // now unified TM/Monaco rules via "--mt-"
	textMate?: {
		enabled: boolean;
		scopesPrefix: string; // unified "--mt-"
	};
	colorsOverrides?: Record<string, string>;
	tokensOverrides?: Array<{token: string; var: string; fontStyleVar?: string}>;
};

type EditorPreferencesState = {
	fontFamily: string;
	fontLigatures: boolean;
	fontSize: number;
	minimap: MonacoMinimapOptions;
	lightTheme: MonacoThemeColors;
	darkTheme: MonacoThemeColors;
	cssVars: CssVarsConfig;
	currentLanguage: 'ts' | 'tsx' | 'js' | 'jsx' | 'glsl' | 'c';
	setFontFamily: (family: string) => void;
	setFontLigatures: (enabled: boolean) => void;
	setFontSize: (size: number) => void;
	setMinimap: (opts: Partial<MonacoMinimapOptions>) => void;
	setLightTheme: (theme: Partial<MonacoThemeColors>) => void;
	setDarkTheme: (theme: Partial<MonacoThemeColors>) => void;
	setCssVars: (patch: Partial<CssVarsConfig>) => void;
	setCurrentLanguage: (
		lang: 'ts' | 'tsx' | 'js' | 'jsx' | 'glsl' | 'c'
	) => void;
};

const defaultLight: MonacoThemeColors = {
	base: 'vs',
	inherit: true,
	rules: [],
	colors: {},
};

const defaultDark: MonacoThemeColors = {
	base: 'vs-dark',
	inherit: true,
	rules: [],
	colors: {},
};

export const useEditorPreferences = create<EditorPreferencesState>((set) => ({
	fontFamily:
		"'Input Mono', SFMono-Regular, Menlo, ui-monospace, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
	fontLigatures: true,
	fontSize: 12,
	minimap: {enabled: false, renderCharacters: false, side: 'right', scale: 1},
	lightTheme: defaultLight,
	darkTheme: defaultDark,
	cssVars: {
		enabled: true,
		colorsPrefix: '--monaco-editor-',
		tokensPrefix: '--mt-',
		textMate: {enabled: true, scopesPrefix: '--mt-'},
		colorsOverrides: undefined,
		tokensOverrides: undefined,
	},
	currentLanguage: 'tsx',
	setFontFamily: (family) => set({fontFamily: family}),
	setFontLigatures: (enabled) => set({fontLigatures: enabled}),
	setFontSize: (size) => set({fontSize: size}),
	setMinimap: (opts) => set((s) => ({minimap: {...s.minimap, ...opts}})),
	setLightTheme: (theme) =>
		set((s) => ({
			lightTheme: {
				...s.lightTheme,
				...theme,
				colors: {...s.lightTheme.colors, ...(theme.colors ?? {})},
				rules: theme.rules ? theme.rules : s.lightTheme.rules,
			},
		})),
	setDarkTheme: (theme) =>
		set((s) => ({
			darkTheme: {
				...s.darkTheme,
				...theme,
				colors: {...s.darkTheme.colors, ...(theme.colors ?? {})},
				rules: theme.rules ? theme.rules : s.darkTheme.rules,
			},
		})),
	setCssVars: (patch) => set((s) => ({cssVars: {...s.cssVars, ...patch}})),
	setCurrentLanguage: (lang) => set({currentLanguage: lang}),
}));

export function buildRulesFromCssVars(
	getVar: (name: string) => string | null,
	tokenMappings: Array<{token: string; var: string; fontStyleVar?: string}>
): Array<{token: string; foreground?: string; fontStyle?: string}> {
	const rules: Array<{token: string; foreground?: string; fontStyle?: string}> =
		[];
	for (const m of tokenMappings) {
		const color = getVar(m.var);
		const fontStyle = m.fontStyleVar ? getVar(m.fontStyleVar) : null;
		const rule: {token: string; foreground?: string; fontStyle?: string} = {
			token: m.token,
		};
		if (color) rule.foreground = color.replace('#', '').toUpperCase();
		if (fontStyle) rule.fontStyle = fontStyle;
		rules.push(rule);
	}
	return rules;
}
