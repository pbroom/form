import {cn} from './lib/utils';
import {ThemeProvider} from '@/components/theme-provider';
import NodeGraphEditor from '@/components/NodeGraphEditor';
import AppMenubar from '@/components/AppMenubar';

function App() {
	return (
		<ThemeProvider>
			<div
				className={cn(
					'min-h-screen h-screen bg-background',
					'flex flex-col relative',
					'transition-colors duration-300'
				)}
			>
				<AppMenubar />
				<div className='flex-1 relative h-full'>
					<NodeGraphEditor />
				</div>
			</div>
		</ThemeProvider>
	);
}

export default App;
