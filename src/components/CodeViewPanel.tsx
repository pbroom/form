import type {Node} from '@xyflow/react';
import {cn} from '@/lib/utils';
import type {NodeData} from '@/components/Node';
import CodeMirror from '@uiw/react-codemirror';
import {javascript} from '@codemirror/lang-javascript';

type CodeViewPanelProps = {
	node: Node<NodeData> | null;
	onChange?: (code: string) => void;
	validationMessage?: string | null;
	value?: string;
};

export default function CodeViewPanel({
	node,
	onChange,
	validationMessage,
	value,
}: CodeViewPanelProps) {
	const isCodeNode = node?.data?.typeKey === 'code';

	return (
		<div
			data-testid='code-view-panel'
			className={cn('h-full w-full bg-card/40 p-3 flex flex-col gap-2')}
		>
			<div className='text-xs font-medium text-foreground flex items-center justify-between'>
				<span>Code</span>
				{node ? (
					<span className='text-[10px] text-muted-foreground'>
						id: {node.id}
					</span>
				) : null}
			</div>
			{!isCodeNode ? (
				<div className='text-sm text-muted-foreground'>
					Select a Code node to edit its function.
				</div>
			) : (
				<div className='flex-1 overflow-hidden'>
					<CodeMirror
						data-testid='code-editor-textarea'
						value={value ?? ''}
						extensions={[javascript({typescript: true})]}
						height='100px'
						theme={'dark'}
						onChange={(val) => onChange?.(val)}
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
