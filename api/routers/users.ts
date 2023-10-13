import { z } from 'zod';
import { database } from '@api/lib/drizzle.ts';
import { altrankedAccounts, sessions, users } from '@api/db/schema.ts';
import { eq } from 'drizzle-orm';
import { t } from '@api/trpc.ts';

export const usersRouter = t.router({
	me: t.procedure
		.output(
			z.discriminatedUnion('type', [
				z.object({
					type: z.literal('error'),
					error: z.string(),
					code: z.string(),
				}),
				z.object({
					type: z.literal('success'),
					user: z.discriminatedUnion('type', [
						z.object({
							type: z.literal('anon'),
							id: z.string(),
							createdAt: z.number(),
						}),
						z.object({
							type: z.literal('altranked'),
							id: z.string(),
							username: z.string(),
							email: z.string(),
							createdAt: z.number(),
						}),
					]),
				}),
			]),
		)
		.query(async ({ ctx: { env, session_id } }) => {
			try {
				const db = database(env);
				const data = await db
					.select({
						userId: users.id,
						createdAt: users.createdAt,
						sessionType: sessions.type,
						altrankedAccUsername: altrankedAccounts.username,
						altrankedAccEmail: altrankedAccounts.email,
					})
					.from(users)
					.leftJoin(
						altrankedAccounts,
						eq(altrankedAccounts.userId, users.id),
					)
					.innerJoin(sessions, eq(sessions.userId, users.id))
					.where(eq(sessions.id, session_id))
					.get();

				// console.log(JSON.stringify(data, null, 2))

				if (!data) {
					return {
						type: 'error',
						error: 'Failed to get user.',
						code: 'NO_USER',
					};
				}

				if (data.sessionType === 'anon') {
					return {
						type: 'success',
						user: {
							type: 'anon',
							id: data.userId,
							createdAt: data.createdAt,
						},
					};
				} else if (
					data.sessionType === 'account' &&
					data.altrankedAccUsername &&
					data.altrankedAccEmail
				) {
					return {
						type: 'success',
						user: {
							type: 'altranked',
							id: data.userId,
							username: data.altrankedAccUsername,
							email: data.altrankedAccEmail,
							createdAt: data.createdAt,
						},
					};
				} else {
					return {
						type: 'error',
						error: 'Failed to get user.',
						code: 'NO_USER',
					};
				}
			} catch (err) {
				console.error(err);
				return {
					type: 'error' as const,
					error: 'Failed to get user.',
					code: 'INTERNAL_ERROR',
				};
			}
		}),
});
