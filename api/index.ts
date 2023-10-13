import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@api/routers';
import { Context } from '@api/trpc.ts';

export type Env = {
	DB: D1Database;
	WORKER_ENV: string;
	SECRET: string;
};

export type FetchContext = {
	waitUntil: (promise: Promise<unknown>) => void;
	passThroughOnException: () => void;
};

export default {
	fetch: async (req: Request, env: Env, ctx: FetchContext) => {
		return fetchRequestHandler({
			endpoint: '/api/trpc',
			req: req,
			router: appRouter,
			createContext: (opts): Context => ({
				session_id: opts.req.headers.get('session_id') ?? '',
				ctx: ctx,
				env: env,
			}),
		});
	},
};
