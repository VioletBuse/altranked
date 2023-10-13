import { t } from '@api/trpc.ts';
import { authRouter } from '@api/routers/auth.ts';
import { gamesRouter } from '@api/routers/games.ts';
import { usersRouter } from '@api/routers/users.ts';
import { anonRouter } from '@api/routers/anon.ts';

export const appRouter = t.router({
	auth: authRouter,
	anon: anonRouter,
	users: usersRouter,
	games: gamesRouter,
});

export type AppRouter = typeof appRouter;
