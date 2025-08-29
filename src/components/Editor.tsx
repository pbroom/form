import {
	ResizablePanelGroup,
	ResizablePanel,
	ResizableHandle,
} from '@/components/ui/resizable';
import Viewport from '@/components/Viewport';
import PropertiesPanel from '@/components/PropertiesPanel';
import CodeViewPanel from '@/components/CodeViewPanel';
import NodeGraphEditorV2 from '@/components/NodeGraphEditor';
import type {ViewGraphState} from '@/components/Viewport';
import {useMemo} from 'react';

export default function Editor() {
	// Minimal IR state placeholder; wire real state later
	const viewState = useMemo(
		() =>
			({
				irModule: {meta: {}, tree: {}, graph: {nodes: [], edges: []}},
			} as unknown as ViewGraphState),
		[]
	);

	return (
		<ResizablePanelGroup direction='horizontal' className='h-full w-full'>
			{/* Left side: vertical split with viewport (top) and editor (bottom) */}
			<ResizablePanel defaultSize={60} minSize={40} className='relative'>
				<ResizablePanelGroup direction='vertical' className='h-full w-full'>
					{/* Top: Viewport */}
					<ResizablePanel
						defaultSize={50}
						minSize={30}
						className='border-b border-border'
					>
						<Viewport state={viewState} />
					</ResizablePanel>
					<ResizableHandle />
					{/* Bottom: Node editor */}
					<ResizablePanel defaultSize={50} minSize={30}>
						<NodeGraphEditorV2 />
					</ResizablePanel>
				</ResizablePanelGroup>
			</ResizablePanel>
			<ResizableHandle />
			{/* Right side: full-height Code View (left) + Properties (right) */}
			<ResizablePanel
				defaultSize={40}
				minSize={30}
				className='border-l border-border bg-background overflow-hidden'
			>
				<ResizablePanelGroup direction='horizontal' className='h-full w-full'>
					<ResizablePanel
						defaultSize={60}
						minSize={20}
						className='overflow-auto'
					>
						<CodeViewPanel node={null} value={''} />
					</ResizablePanel>
					<ResizableHandle />
					<ResizablePanel
						defaultSize={40}
						minSize={40}
						className='overflow-auto'
					>
						<PropertiesPanel
							node={null}
							onParamChange={() => {}}
							onLabelChange={() => {}}
							validationErrors={[]}
						/>
					</ResizablePanel>
				</ResizablePanelGroup>
			</ResizablePanel>
		</ResizablePanelGroup>
	);
}
