import type {Node} from '@xyflow/react';
import {cn} from '@/lib/utils';
import type {NodeData} from '@/components/Node';
import Editor from '@monaco-editor/react';
import type {Monaco} from '@monaco-editor/react';
import type {editor as MonacoEditorNS} from 'monaco-editor';
import {useTheme} from '@/hooks/use-theme';
import {Skeleton} from '@/components/ui/skeleton';
import {
	useEditorPreferences,
	buildRulesFromCssVars,
} from '@/store/editorPreferences';
import {wireTextMate} from '@/lib/code/monacoTextmate';
import {getLanguage, listLanguages} from '@/lib/code/languages';
import {composeTheme} from '@/lib/code/theme-css';
import {useViteCssHmr} from '@/lib/hooks/useViteCssHmr';
import onigWasmUrl from '@/vendor/onigasm.wasm?url';
import {useEffect, useRef, useCallback, useMemo} from 'react';

type CodeViewProps = {
	node: Node<NodeData> | null;
	onChange?: (code: string) => void;
	validationMessage?: string | null;
	value?: string;
};

const languageIds = new Set([
	'js',
	'ts',
	'jsx',
	'tsx',
	'json',
	'css',
	'scss',
	'less',
	'html',
	'xml',
	'sql',
	'md',
	'markdown',
	'py',
	'python',
	'go',
	'java',
	'c',
	'cpp',
	'cs',
	'csharp',
	'rs',
	'rust',
	'lua',
	'yaml',
	'yml',
	'toml',
	'bash',
	'sh',
	'shell',
]);

export default function CodeView({
	node,
	onChange,
	validationMessage,
	value,
}: CodeViewProps) {
	const isCodeNode = node?.data?.typeKey === 'code';
	const {theme} = useTheme();
	const {
		fontFamily,
		fontLigatures,
		fontSize,
		lightTheme,
		darkTheme,
		cssVars,
		currentLanguage,
		setCurrentLanguage,
	} = useEditorPreferences();
	const isDark =
		theme === 'dark' ||
		(theme === 'system' &&
			typeof window !== 'undefined' &&
			'matchMedia' in window &&
			window.matchMedia('(prefers-color-scheme: dark)').matches);
	const monacoTheme = isDark ? 'app-dark' : 'app-light';

	const monacoRef = useRef<Monaco | null>(null);
	const editorRef = useRef<
		import('monaco-editor').editor.IStandaloneCodeEditor | null
	>(null);
	const editorModelRef = useRef<
		import('monaco-editor').editor.ITextModel | null
	>(null);
	const stableUri = useMemo(
		() => `inmemory://code/${node?.id ?? 'singleton'}`,
		[node?.id]
	);

	const defineThemes = useCallback(
		(monaco: Monaco) => {
			monaco.editor.defineTheme(
				'app-light',
				composeTheme(
					lightTheme as unknown as MonacoEditorNS.IStandaloneThemeData,
					cssVars,
					buildRulesFromCssVars,
					languageIds
				) as MonacoEditorNS.IStandaloneThemeData
			);
			monaco.editor.defineTheme(
				'app-dark',
				composeTheme(
					darkTheme as unknown as MonacoEditorNS.IStandaloneThemeData,
					cssVars,
					buildRulesFromCssVars,
					languageIds
				) as MonacoEditorNS.IStandaloneThemeData
			);
		},
		[lightTheme, darkTheme, cssVars]
	);

	useEffect(() => {
		if (monacoRef.current) {
			defineThemes(monacoRef.current);
		}
	}, [defineThemes]);

	useViteCssHmr(() => {
		if (monacoRef.current) defineThemes(monacoRef.current);
	});

	useEffect(() => {
		if (!cssVars.textMate?.enabled) return;
		if (!monacoRef.current) return;
		const getVar = (name: string) => {
			const el = document.createElement('div');
			el.style.display = 'none';
			el.style.backgroundColor = `var(${name})`;
			document.body.appendChild(el);
			const color = window.getComputedStyle(el).backgroundColor;
			el.remove();
			if (!color) return null;
			const m = color.match(/\d+(?:\.\d+)?/g);
			if (!m || m.length < 3) return color;
			const toHex = (n: number) => n.toString(16).padStart(2, '0');
			const [r, g, b] = m.map((v) =>
				Math.max(0, Math.min(255, Math.round(Number(v))))
			) as [number, number, number];
			return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
		};
		// Fallback fetch list (served from public/grammars)
		const grammars: Array<{
			languageId: string;
			scopeName: string;
			path: string;
		}> = [
			{
				languageId: 'javascript',
				scopeName: 'source.js',
				path: '/grammars/JavaScript.tmLanguage.json',
			},
			{
				languageId: 'javascriptreact',
				scopeName: 'source.jsx',
				path: '/grammars/JavaScriptReact.tmLanguage.json',
			},
			{
				languageId: 'typescript',
				scopeName: 'source.ts',
				path: '/grammars/TypeScript.tmLanguage.json',
			},
			{
				languageId: 'typescriptreact',
				scopeName: 'source.tsx',
				path: '/grammars/TypeScriptReact.tmLanguage.json',
			},
			{
				languageId: 'glsl',
				scopeName: 'source.glsl',
				path: '/grammars/GLSL.tmLanguage.json',
			},
			{
				languageId: 'c',
				scopeName: 'source.c',
				path: '/grammars/C.tmLanguage.json',
			},
		];
		// Allow local extensions in src/grammars to override/extend (bundled)
		const modules = import.meta.glob('/src/grammars/*', {
			eager: true,
			query: '?raw',
			import: 'default',
		});
		const bundled: Array<{
			languageId: string;
			scopeName: string;
			content: string;
		}> = [];
		for (const [path, content] of Object.entries(modules)) {
			const name = path.split('/').pop() || '';
			if (name.includes('TypeScriptReact'))
				bundled.push({
					languageId: 'typescriptreact',
					scopeName: 'source.tsx',
					content: content as string,
				});
			else if (name.includes('TypeScript'))
				bundled.push({
					languageId: 'typescript',
					scopeName: 'source.ts',
					content: content as string,
				});
			else if (name.includes('JavaScriptReact'))
				bundled.push({
					languageId: 'javascriptreact',
					scopeName: 'source.jsx',
					content: content as string,
				});
			else if (name.includes('JavaScript'))
				bundled.push({
					languageId: 'javascript',
					scopeName: 'source.js',
					content: content as string,
				});
			else if (name.includes('GLSL'))
				bundled.push({
					languageId: 'glsl',
					scopeName: 'source.glsl',
					content: content as string,
				});
			else if (name.match(/^C\./))
				bundled.push({
					languageId: 'c',
					scopeName: 'source.c',
					content: content as string,
				});
		}
		wireTextMate(
			monacoRef.current,
			grammars,
			getVar,
			cssVars.textMate.scopesPrefix,
			onigWasmUrl,
			bundled
		).catch(() => {});
	}, [cssVars.textMate?.enabled, cssVars.textMate?.scopesPrefix]);

	useEffect(() => {
		if (!monacoRef.current) return;
		const monaco = monacoRef.current;
		const entry = getLanguage(currentLanguage);
		if (editorModelRef.current) {
			monaco.editor.setModelLanguage(
				editorModelRef.current,
				entry.monacoLanguageId
			);
			if (entry.monacoLanguageId === 'typescript') {
				monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
					jsx:
						entry.typescript?.jsx === 'preserve'
							? monaco.languages.typescript.JsxEmit.Preserve
							: monaco.languages.typescript.JsxEmit.None,
					allowJs: true,
				});
			}
		}
	}, [currentLanguage]);

	useEffect(() => {
		if (!monacoRef.current || editorModelRef.current == null) return;
		if (typeof value !== 'string') return;
		const current = editorModelRef.current.getValue();
		if (current !== value) {
			editorModelRef.current.setValue(value);
		}
	}, [value]);

	const editorDomObserverRef = useRef<MutationObserver | null>(null);

	const stripBracketHighlightClasses = useCallback((root: Element | null) => {
		if (!root) return;
		const walk = (el: Element) => {
			for (const cls of Array.from(el.classList)) {
				if (cls.startsWith('bracket-highlighting-')) el.classList.remove(cls);
			}
			for (const child of Array.from(el.children)) walk(child);
		};
		walk(root);
	}, []);

	useEffect(() => {
		return () => {
			if (editorDomObserverRef.current) {
				editorDomObserverRef.current.disconnect();
				editorDomObserverRef.current = null;
			}
		};
	}, []);

	return (
		<div
			data-testid='code-view'
			className={cn('h-full w-full flex flex-col gap-2')}
		>
			<div className='flex items-center gap-2'>
				<label className='text-xs text-muted-foreground'>Language</label>
				<select
					className='text-xs border bg-transparent'
					value={currentLanguage}
					aria-label='Select language'
					title='Select language'
					onChange={(e) =>
						setCurrentLanguage(
							e.target.value as 'ts' | 'tsx' | 'js' | 'jsx' | 'glsl' | 'c'
						)
					}
				>
					{listLanguages().map((l) => (
						<option key={l.key} value={l.key} className='bg-background'>
							{l.label}
						</option>
					))}
				</select>
			</div>
			{!isCodeNode ? (
				<div className='text-sm text-muted-foreground'>
					Select a Code node to edit its function.
				</div>
			) : (
				<div className='flex-1 overflow-hidden'>
					<Editor
						data-testid='code-editor-textarea'
						defaultLanguage='plaintext'
						height='640px'
						theme={monacoTheme}
						beforeMount={(monaco) => {
							defineThemes(monaco);
						}}
						onMount={(editor, monaco) => {
							monacoRef.current = monaco;
							editorRef.current = editor;
							// Ensure GLSL / C languages are registered if missing
							if (
								!monaco.languages.getLanguages().some((l) => l.id === 'glsl')
							) {
								monaco.languages.register({id: 'glsl'});
							}
							if (!monaco.languages.getLanguages().some((l) => l.id === 'c')) {
								monaco.languages.register({id: 'c'});
							}
							defineThemes(monaco);
							// Create or reuse a single model so content remains when language changes or remounts
							const uri = monaco.Uri.parse(stableUri);
							let model = monaco.editor.getModel(uri);
							if (!model) {
								model = monaco.editor.createModel(
									value ?? '',
									getLanguage(currentLanguage).monacoLanguageId,
									uri
								);
							}
							editorModelRef.current = model;
							editor.setModel(model);
							// Observe and strip Monaco's bracket-highlighting classes to let TM token colors win
							const domNode = editor.getDomNode();
							stripBracketHighlightClasses(domNode as Element);
							if (domNode) {
								const obs = new MutationObserver((mutations) => {
									for (const m of mutations) {
										if (
											m.type === 'attributes' &&
											m.target instanceof Element
										) {
											stripBracketHighlightClasses(m.target);
										} else if (m.type === 'childList') {
											for (const n of Array.from(m.addedNodes)) {
												if (n instanceof Element)
													stripBracketHighlightClasses(n);
											}
										}
									}
								});
								obs.observe(domNode, {
									subtree: true,
									childList: true,
									attributes: true,
									attributeFilter: ['class'],
								});
								editorDomObserverRef.current = obs;
							}
							// Initial TS config if needed
							if (
								getLanguage(currentLanguage).monacoLanguageId === 'typescript'
							) {
								monaco.languages.typescript.typescriptDefaults.setCompilerOptions(
									{
										jsx:
											getLanguage(currentLanguage).typescript?.jsx ===
											'preserve'
												? monaco.languages.typescript.JsxEmit.Preserve
												: monaco.languages.typescript.JsxEmit.None,
										allowJs: true,
									}
								);
							}
						}}
						loading={
							<div className='h-60 w-full flex flex-col gap-2'>
								<div className='flex items-center'>
									<Skeleton className='h-6 w-1/2' />
									<div className='w-1/2' />
								</div>
								<div className='flex items-center'>
									<div className='w-8' />
									<Skeleton className='h-6 w-full' />
								</div>
								<div className='flex items-center'>
									<div className='w-8' />
									<Skeleton className='h-6 w-full' />
								</div>
								<div className='flex items-center'>
									<div className='w-8' />
									<Skeleton className='h-6 w-full' />
								</div>
								<div className='flex items-center'>
									<Skeleton className='h-6 w-1/4' />
									<div className='w-3/4' />
								</div>
							</div>
						}
						options={{
							minimap: {enabled: true},
							fontFamily,
							fontLigatures,
							fontSize,
							scrollBeyondLastLine: true,
							wordWrap: 'on',
							automaticLayout: true,
							bracketPairColorization: {enabled: false},
							occurrencesHighlight: 'off',
							renderValidationDecorations: 'off',
							matchBrackets: 'never',
						}}
						onChange={(val) => onChange?.(val ?? '')}
						className='rounded-b-sm overflow-hidden'
					/>
					{validationMessage ? (
						<div
							data-testid='code-editor-validation'
							className='mt-2 rounded-b-sm border border-red-500/30 bg-red-500/10 px-2 py-1 text-[11px] text-red-500'
						>
							{validationMessage}
						</div>
					) : null}
				</div>
			)}
		</div>
	);
}
