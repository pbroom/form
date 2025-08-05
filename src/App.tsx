import {cn} from './lib/utils';
import {ThemeProvider} from '@/components/theme-provider';
import {ModeToggle} from '@/components/theme-toggle';
import NodeGraphEditor from '@/components/NodeGraphEditor';

function App() {
	return (
		<ThemeProvider>
			<div
				className={cn(
					'min-h-screen bg-background',
					'flex flex-col relative',
					'transition-colors duration-300'
				)}
				style={{height: '100vh'}}
			>
				<div className='absolute top-6 right-6 z-10'>
					<ModeToggle />
				</div>
				<div className='flex-1 relative' style={{height: 'calc(100vh - 0px)'}}>
					<NodeGraphEditor />
				</div>
			</div>
		</ThemeProvider>
	);
}

export default App;
