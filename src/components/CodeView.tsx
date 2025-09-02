import type {Node} from '@xyflow/react';
import {cn} from '@/lib/utils';
import type {NodeData} from '@/components/Node';
import Editor from '@monaco-editor/react';
import {useTheme} from '@/hooks/use-theme';
import {Skeleton} from '@/components/ui/skeleton';

type CodeViewProps = {
	node: Node<NodeData> | null;
	onChange?: (code: string) => void;
	validationMessage?: string | null;
	value?: string;
	/** Optional explicit height in pixels (defaults to 240) */
	heightPx?: number;
};

export default function CodeView({
	node,
	onChange,
	validationMessage,
	value,
	heightPx,
}: CodeViewProps) {
	const isCodeNode = node?.data?.typeKey === 'code';
	const {theme} = useTheme();
	const isDark =
		theme === 'dark' ||
		(theme === 'system' &&
			typeof window !== 'undefined' &&
			'matchMedia' in window &&
			window.matchMedia('(prefers-color-scheme: dark)').matches);
	const monacoTheme = isDark ? 'vs-dark' : 'vs-light';

	const editorHeight = `${heightPx ?? 240}px`;

	return (
		<div
			data-testid='code-view'
			className={cn('h-full w-full flex flex-col gap-2')}
		>
			{!isCodeNode ? (
				<div className='text-sm text-muted-foreground'>
					Select a Code node to edit its function.
				</div>
			) : (
				<div className='flex-1 overflow-hidden'>
					<Editor
						data-testid='code-editor-textarea'
						value={value ?? ''}
						language='typescript'
						height={editorHeight}
						theme={monacoTheme}
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
							minimap: {enabled: false},
							fontSize: 12,
							scrollBeyondLastLine: false,
							wordWrap: 'on',
							automaticLayout: true,
						}}
						onChange={(val) => onChange?.(val ?? '')}
						className='rounded-sm overflow-hidden'
					/>
					{validationMessage ? (
						<div
							data-testid='code-editor-validation'
							className='mt-2 rounded-sm border border-red-500/30 bg-red-500/10 px-2 py-1 text-[11px] text-red-500'
						>
							{validationMessage}
						</div>
					) : null}
				</div>
			)}
		</div>
	);
}
