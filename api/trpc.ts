import { initTRPC } from '@trpc/server';
import { Env, FetchContext } from '@api/index.ts';

export type Context = {
	env: Env;
	ctx: FetchContext;
	session_id: string;
};

export const t = initTRPC.context<Context>().create();
