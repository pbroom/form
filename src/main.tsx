import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import {ConvexProvider} from 'convex/react';
import {convex} from '@/lib/project/convexClient';

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		{convex ? (
			<ConvexProvider client={convex}>
				<App />
			</ConvexProvider>
		) : (
			<App />
		)}
	</StrictMode>
);
