import { z } from 'zod';
import { database } from '@api/lib/drizzle.ts';
import { anonAccounts, sessions, users } from '@api/db/schema.ts';
import { nanoid } from 'nanoid';
import { t } from '@api/trpc.ts';

export const anonRouter = t.router({
	newAccount: t.procedure
		.output(
			z.discriminatedUnion('type', [
				z.object({ type: z.literal('error'), error: z.string() }),
				z.object({ type: z.literal('success'), token: z.string() }),
			]),
		)
		.mutation(async ({ ctx: { env } }) => {
			try {
				const db = database(env);

				try {
					const newUser = await db
						.insert(users)
						.values({
							id: nanoid(),
							createdAt: Date.now(),
						})
						.returning()
						.get();

					await db.insert(anonAccounts).values({
						id: nanoid(),
						userId: newUser.id,
						createdAt: Date.now(),
					});

					const session = await db
						.insert(sessions)
						.values({
							id: nanoid(),
							type: 'anon',
							userId: newUser.id,
							createdAt: Date.now(),
						})
						.returning()
						.get();

					return { type: 'success' as const, token: session.id };
				} catch (err) {
					console.error(err);
					return {
						type: 'error' as const,
						error: 'Failed to create account.',
					};
				}
			} catch (err) {
				console.error(err);
				return {
					type: 'error' as const,
					error: 'Failed to create account.',
				};
			}
		}),
});
