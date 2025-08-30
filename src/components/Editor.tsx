import {
	ResizablePanelGroup,
	ResizablePanel,
	ResizableHandle,
} from '@/components/ui/resizable';
import Viewport from '@/components/Viewport';
import PropertiesPanel from '@/components/PropertiesPanel';
import NodeGraphEditor from '@/components/NodeGraphEditor';
import type {ViewGraphState} from '@/components/Viewport';
import * as React from 'react';
import type {Node} from '@xyflow/react';
import type {NodeData} from '@/components/Node';
import {useCodeStore} from '@/store/code';
import {useDevtoolsStore} from '@/store/devtools';

const VIEW_STATE = {
	irModule: {meta: {}, tree: {}, graph: {nodes: [], edges: []}},
} as unknown as ViewGraphState;

export default function Editor() {
	// Minimal IR state placeholder; wire real state later
	const viewState = VIEW_STATE;

	const [selectedNode, setSelectedNode] = React.useState<Node<NodeData> | null>(
		null
	);
	const setMany = useCodeStore((s) => s.setMany);
	const toggleDev = useDevtoolsStore((s) => s.toggle);
	const devOn = useDevtoolsStore((s) => s.enabled);

	React.useEffect(() => {
		setMany([
			{
				nodeId: 'code-a',
				code: 'export function node(a: number) {\n  return a + 1\n}',
			},
			{
				nodeId: 'code-b',
				code: 'export function node(b: number) {\n  return b * 2\n}',
			},
			{
				nodeId: 'code-c',
				code: 'export function node(x: number, y: number) {\n  return x - y\n}',
			},
		]);
	}, [setMany]);

	return (
		<div className='h-full w-full relative'>
			<div className='absolute right-2 top-2 z-20 flex gap-2'>
				<button
					className='px-2 py-1 text-xs rounded border border-border bg-popover hover:bg-accent'
					onClick={toggleDev}
				>
					{devOn ? 'Hide DevTools' : 'Show DevTools'}
				</button>
			</div>
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
							<NodeGraphEditor onSelectNode={setSelectedNode} />
						</ResizablePanel>
					</ResizablePanelGroup>
				</ResizablePanel>
				<ResizableHandle />
				{/* Right side: stacked Code (in Properties) + Properties */}
				<ResizablePanel
					defaultSize={40}
					minSize={30}
					className='border-l border-border bg-background overflow-hidden'
				>
					<ResizablePanelGroup direction='vertical' className='h-full w-full'>
						<ResizablePanel
							defaultSize={50}
							minSize={40}
							className='overflow-auto'
						>
							<PropertiesPanel
								node={selectedNode}
								onParamChange={() => {}}
								onLabelChange={() => {}}
								validationErrors={[]}
							/>
						</ResizablePanel>
					</ResizablePanelGroup>
				</ResizablePanel>
			</ResizablePanelGroup>
		</div>
	);
}
