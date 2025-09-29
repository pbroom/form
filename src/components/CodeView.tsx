import type {Node} from '@xyflow/react';
import {cn} from '@/lib/utils';
import type {NodeData} from '@/components/Node';
import {useTheme} from '@/hooks/use-theme';
import {useEditorPreferences} from '@/store/editorPreferences';
import {getLanguage, listLanguages} from '@/lib/code/languages';
import {useEffect, useRef} from 'react';
import {loadVendoredThemeAndGrammars} from '@/lib/code/shiki-vendor';

export default function CodeView({
	node,
	onChange,
	validationMessage,
	value,
}: {
	node: Node<NodeData> | null;
	onChange?: (v: string) => void;
	validationMessage?: string | null;
	value?: string;
}) {
	const isCodeNode = node?.data?.typeKey === 'code';
	const {theme} = useTheme();
	const {
		fontFamily,
		fontLigatures,
		fontSize,
		minimap,
		currentLanguage,
		setCurrentLanguage,
	} = useEditorPreferences();
	const isDark =
		theme === 'dark' ||
		(theme === 'system' &&
			typeof window !== 'undefined' &&
			'matchMedia' in window &&
			window.matchMedia('(prefers-color-scheme: dark)').matches);

	const stableUri = `inmemory://code/${node?.id ?? 'singleton'}`;

	const editorRef = useRef<
		import('monaco-editor').editor.IStandaloneCodeEditor | null
	>(null);
	const modelRef = useRef<import('monaco-editor').editor.ITextModel | null>(
		null
	);
	const containerRef = useRef<HTMLDivElement | null>(null);

	// Mount editor (React 19: async side-effects in useEffect)
	useEffect(() => {
		let disposed = false;
		(async () => {
			const {init} = await import('modern-monaco');
			const vendored = await loadVendoredThemeAndGrammars(isDark);
			const monaco = (await init({
				theme: vendored.theme,
				langs: vendored.langs,
				tmDownloadCDN: undefined,
			})) as unknown as typeof import('monaco-editor');
			if (disposed || !containerRef.current) return;

			const uri = monaco.Uri.parse(stableUri);
			let model = monaco.editor.getModel(uri);
			if (!model) {
				model = monaco.editor.createModel(
					value ?? '',
					getLanguage(currentLanguage).monacoLanguageId,
					uri
				);
			}
			modelRef.current = model;

			const editor = monaco.editor.create(containerRef.current, {
				model,
				minimap,
				fontFamily,
				fontLigatures,
				fontSize,
				automaticLayout: true,
				scrollBeyondLastLine: false,
				wordWrap: 'on',
			});
			editor.onDidChangeModelContent(() => onChange?.(editor.getValue()));
			editorRef.current = editor;
		})().catch(() => {});

		return () => {
			disposed = true;
			try {
				editorRef.current?.dispose();
			} catch {
				// no-op
			}
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Language switch
	useEffect(() => {
		(async () => {
			const {init} = await import('modern-monaco');
			const monaco =
				(await init()) as unknown as typeof import('monaco-editor');
			if (!modelRef.current) return;
			monaco.editor.setModelLanguage(
				modelRef.current,
				getLanguage(currentLanguage).monacoLanguageId
			);
		})();
	}, [currentLanguage]);

	// Value sync
	useEffect(() => {
		if (!modelRef.current || typeof value !== 'string') return;
		const current = modelRef.current.getValue();
		if (current !== value) modelRef.current.setValue(value);
	}, [value]);

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
				<div className='flex-1 overflow-hidden rounded-b-sm'>
					<div ref={containerRef} className='h-[640px] w-full' />
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

// TODOs (deferred):
// - CSS variable driven theming + TextMate scope mapping.
// - Shiki custom theme assembly and live CSS HMR.
// - Monaco overlays tuning (brackets/occurrences) once custom theming returns.
// - Preload additional grammars or local TM JSONs if needed.
