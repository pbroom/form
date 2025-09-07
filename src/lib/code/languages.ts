export type LanguageKey = 'ts' | 'tsx' | 'js' | 'jsx' | 'glsl' | 'c';

export type LanguageEntry = {
	key: LanguageKey;
	label: string;
	monacoLanguageId: string;
	tmScopeName: string;
	modelExtension: string;
	typescript?: {
		jsx: 'preserve' | 'react' | 'react-jsx' | 'react-jsxdev' | 'none';
	};
};

const REGISTRY: Record<LanguageKey, LanguageEntry> = {
	js: {
		key: 'js',
		label: 'JavaScript',
		monacoLanguageId: 'javascript',
		tmScopeName: 'source.js',
		modelExtension: '.js',
	},
	jsx: {
		key: 'jsx',
		label: 'JavaScript (JSX)',
		monacoLanguageId: 'javascript',
		tmScopeName: 'source.jsx',
		modelExtension: '.jsx',
	},
	ts: {
		key: 'ts',
		label: 'TypeScript',
		monacoLanguageId: 'typescript',
		tmScopeName: 'source.ts',
		modelExtension: '.ts',
		typescript: {jsx: 'none'},
	},
	tsx: {
		key: 'tsx',
		label: 'TypeScript (TSX)',
		monacoLanguageId: 'typescript',
		tmScopeName: 'source.tsx',
		modelExtension: '.tsx',
		typescript: {jsx: 'preserve'},
	},
	glsl: {
		key: 'glsl',
		label: 'GLSL',
		monacoLanguageId: 'glsl',
		tmScopeName: 'source.glsl',
		modelExtension: '.glsl',
	},
	c: {
		key: 'c',
		label: 'C',
		monacoLanguageId: 'c',
		tmScopeName: 'source.c',
		modelExtension: '.c',
	},
};

export function listLanguages(): Array<LanguageEntry> {
	return Object.values(REGISTRY);
}

export function getLanguage(key: LanguageKey): LanguageEntry {
	return REGISTRY[key];
}
