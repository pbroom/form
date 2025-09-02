import {ConvexReactClient} from 'convex/react';

const url = import.meta.env.VITE_CONVEX_URL as string | undefined;

if (!url) {
	console.warn('[convex] VITE_CONVEX_URL is not set; Convex client disabled');
}

export const convex = url ? new ConvexReactClient(url) : undefined;
