import { z } from 'zod';
import { database } from '@api/lib/drizzle.ts';
import { altrankedAccounts, games, sessions, users } from '@api/db/schema.ts';
import { and, eq, or } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { t } from '@api/trpc.ts';

export const authRouter = t.router({
	login: t.procedure
		.input(
			z.object({
				usernameOrEmail: z.string(),
				password: z.string(),
			}),
		)
		.output(
			z.discriminatedUnion('type', [
				z.object({ type: z.literal('error'), error: z.string() }),
				z.object({ type: z.literal('success'), token: z.string() }),
			]),
		)
		.mutation(async ({ input, ctx: { env, session_id } }) => {
			try {
				const db = database(env);

				const account = await db
					.select()
					.from(altrankedAccounts)
					.where(
						or(
							eq(
								altrankedAccounts.username,
								input.usernameOrEmail,
							),
							eq(altrankedAccounts.email, input.usernameOrEmail),
						),
					)
					.get();

				if (!account) {
					return {
						type: 'error',
						error: 'Invalid username or email',
					};
				}

				if (!bcrypt.compareSync(input.password, account.passwordHash)) {
					return { type: 'error', error: 'Invalid password' };
				}

				try {
					const session = await db
						.insert(sessions)
						.values({
							id: nanoid(),
							type: 'account',
							userId: account.userId,
							createdAt: Date.now(),
						})
						.returning()
						.get();

					try {
						const existingAnonUser = await db
							.select()
							.from(users)
							.where(
								eq(
									users.id,
									db
										.select({ id: sessions.userId })
										.from(sessions)
										.where(
											and(
												eq(sessions.id, session_id),
												eq(sessions.type, 'anon'),
											),
										),
								),
							)
							.get();

						if (existingAnonUser) {
							await db
								.update(sessions)
								.set({
									userId: account.userId,
									type: 'account',
								})
								.where(eq(sessions.userId, existingAnonUser.id))
								.run();
							await db
								.update(games)
								.set({
									userId: account.userId,
								})
								.where(eq(games.userId, existingAnonUser.id))
								.run();
						}
					} catch (err) {
						console.error(err);
						return {
							type: 'error' as const,
							error: 'Failed to migrate anonymous data to account.',
						};
					}

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
				return { type: 'error', error: 'Unknown error' };
			}
		}),
	register: t.procedure
		.input(
			z.object({
				email: z.string().email(),
				username: z.string().min(3).max(32),
				password: z.string().min(8).max(64),
			}),
		)
		.output(
			z.discriminatedUnion('type', [
				z.object({ type: z.literal('error'), error: z.string() }),
				z.object({ type: z.literal('success'), token: z.string() }),
			]),
		)
		.mutation(async ({ input, ctx: { env, session_id } }) => {
			try {
				const db = database(env);

				const existingAccount = await db
					.select()
					.from(altrankedAccounts)
					.where(
						or(
							eq(altrankedAccounts.email, input.email),
							eq(altrankedAccounts.username, input.username),
						),
					)
					.get();

				if (existingAccount) {
					return {
						type: 'error',
						error: 'An account with that email or username already exists',
					};
				}

				const passwordHash = await bcrypt.hash(input.password, 10);

				try {
					const newUser = await db
						.insert(users)
						.values({
							id: nanoid(),
							createdAt: Date.now(),
						})
						.returning()
						.get();

					await db
						.insert(altrankedAccounts)
						.values({
							id: nanoid(),
							email: input.email,
							username: input.username,
							passwordHash,
							userId: newUser.id,
							createdAt: Date.now(),
						})
						.returning()
						.get();

					const session = await db
						.insert(sessions)
						.values({
							id: nanoid(),
							type: 'account',
							userId: newUser.id,
							createdAt: Date.now(),
						})
						.returning()
						.get();

					try {
						const existingAnonUser = await db
							.select()
							.from(users)
							.where(
								eq(
									users.id,
									db
										.select({ id: sessions.userId })
										.from(sessions)
										.where(
											and(
												eq(sessions.id, session_id),
												eq(sessions.type, 'anon'),
											),
										),
								),
							)
							.get();

						if (existingAnonUser) {
							await db
								.update(sessions)
								.set({
									userId: newUser.id,
									type: 'account',
								})
								.where(eq(sessions.userId, existingAnonUser.id))
								.run();
							await db
								.update(games)
								.set({
									userId: newUser.id,
								})
								.where(eq(games.userId, existingAnonUser.id))
								.run();
						}
					} catch (err) {
						console.error(err);
						return {
							type: 'error' as const,
							error: 'Failed to migrate anonymous data to account.',
						};
					}

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
				return { type: 'error', error: 'Unknown error' };
			}
		}),
});
