import { createSWRProxyHooks } from '@trpc-swr/client';
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import { AppRouter } from '@api/routers';

export const client = createTRPCProxyClient<AppRouter>({
	links: [
		httpBatchLink({
			url: '/api/trpc',
			headers() {
				return {
					session_id: localStorage.getItem('session_id') ?? '',
				};
			},
		}),
	],
});

export const trpc = createSWRProxyHooks<AppRouter>({
	links: [
		httpBatchLink({
			url: '/api/trpc',
			headers() {
				return {
					session_id: localStorage.getItem('session_id') ?? '',
				};
			},
		}),
	],
});
