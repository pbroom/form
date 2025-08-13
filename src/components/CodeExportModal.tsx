import {emitReactModule} from '@/lib/codegen/react/index';
import {Textarea} from '@/components/ui/textarea';
import type {IRModule} from '@/lib/ir/types';

export default function CodeExportModal({
	isOpen,
	onClose,
}: {
	isOpen: boolean;
	onClose: () => void;
}) {
	if (!isOpen) return null;

	const mod: IRModule = {
		meta: {
			schemaVersion: '1',
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		},
		graph: {nodes: [], edges: []},
		tree: {moduleName: 'MainScene', rootType: 'r3f'},
	};

	const tsx = emitReactModule(mod);

	return (
		<div className='fixed inset-0 z-50 flex items-start justify-center pt-24'>
			<div className='absolute inset-0 bg-black/40' onClick={onClose} />
			<div className='relative w-full max-w-3xl rounded-lg border border-border bg-card shadow-xl'>
				<div className='flex items-center justify-between p-3 border-b border-border'>
					<div className='text-sm font-medium'>Exported Code (React/R3F)</div>
					<button className='text-xs text-muted-foreground' onClick={onClose}>
						Close
					</button>
				</div>
				<div className='p-3'>
					<Textarea
						data-testid='code-export'
						className='w-full h-[420px] rounded-md bg-secondary p-3 text-xs font-mono'
						readOnly
						value={tsx}
					/>
				</div>
			</div>
		</div>
	);
}
