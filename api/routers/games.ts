import { z } from 'zod';
import { database } from '@api/lib/drizzle.ts';
import { games, sessions, users } from '@api/db/schema.ts';
import { and, desc, eq, lt, lte, or } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { t } from '@api/trpc.ts';
// import { interactRouter } from '@api/routers/interact.ts';
import { getUserId } from '@api/lib/getUserId.ts';
import { upgrades } from '@web/constants.ts';

const computeTotalScore = (
	score: number,
	upgrade1: number,
	upgrade2: number,
	upgrade3: number,
	upgrade4: number,
	upgrade5: number,
	upgrade6: number,
) => {
	let totalScore = score;

	if (upgrade1 > 0) {
		for (let i = 0; i < upgrade1; i++) {
			totalScore += Math.ceil(
				upgrades[1].initCost * Math.pow(upgrades[1].exp, i),
			);
		}
	}

	if (upgrade2 > 0) {
		for (let i = 0; i < upgrade2; i++) {
			totalScore += Math.ceil(
				upgrades[2].initCost * Math.pow(upgrades[2].exp, i),
			);
		}
	}

	if (upgrade3 > 0) {
		for (let i = 0; i < upgrade3; i++) {
			totalScore += Math.ceil(
				upgrades[3].initCost * Math.pow(upgrades[3].exp, i),
			);
		}
	}

	if (upgrade4 > 0) {
		for (let i = 0; i < upgrade4; i++) {
			totalScore += Math.ceil(
				upgrades[4].initCost * Math.pow(upgrades[4].exp, i),
			);
		}
	}

	if (upgrade5 > 0) {
		for (let i = 0; i < upgrade5; i++) {
			totalScore += Math.ceil(
				upgrades[5].initCost * Math.pow(upgrades[5].exp, i),
			);
		}
	}

	if (upgrade6 > 0) {
		for (let i = 0; i < upgrade6; i++) {
			totalScore += Math.ceil(
				upgrades[6].initCost * Math.pow(upgrades[6].exp, i),
			);
		}
	}

	return totalScore;
};

export const gamesRouter = t.router({
	// interact: interactRouter,
	create: t.procedure
		.input(
			z
				.object({
					name: z.string().optional(),
				})
				.nullish(),
		)
		.output(
			z.discriminatedUnion('type', [
				z.object({ type: z.literal('error'), error: z.string() }),
				z.object({
					type: z.literal('success'),
					data: z.object({
						id: z.string(),
						userId: z.string(),
						createdAt: z.number(),
						lastUpdatedAt: z.number(),
						name: z.string().nullable(),
						score: z.number(),
					}),
				}),
			]),
		)
		.mutation(async ({ input, ctx: { env, session_id } }) => {
			try {
				const db = database(env);

				const user = await db
					.select()
					.from(users)
					.where(
						eq(
							users.id,
							db
								.select({ userId: sessions.userId })
								.from(sessions)
								.where(eq(sessions.id, session_id)),
						),
					)
					.get();

				if (!user) {
					return {
						type: 'error',
						error: 'You must be logged in to create a game.',
					};
				}

				const game = await db
					.insert(games)
					.values({
						id: nanoid(),
						userId: user.id,
						score: 0,
						name: input?.name ?? null,
						createdAt: Date.now(),
						lastUpdatedAt: Date.now(),
					})
					.returning()
					.get();

				return {
					type: 'success',
					data: {
						id: game.id,
						userId: game.userId,
						name: game.name,
						createdAt: game.createdAt,
						lastUpdatedAt: game.lastUpdatedAt,
						score: game.score,
					},
				};
			} catch (err) {
				console.error(err);
				return { type: 'error', error: 'Failed to create game.' };
			}
		}),
	rename: t.procedure
		.input(
			z.object({
				id: z.string(),
				name: z.string(),
			}),
		)
		.output(
			z.discriminatedUnion('type', [
				z.object({ type: z.literal('error'), error: z.string() }),
				z.object({
					type: z.literal('success'),
					data: z.object({
						id: z.string(),
						userId: z.string(),
						createdAt: z.number(),
						lastUpdatedAt: z.number(),
						name: z.string().nullable(),
						score: z.number(),
					}),
				}),
			]),
		)
		.mutation(async ({ input: { id, name }, ctx: { env, session_id } }) => {
			try {
				const db = database(env);

				const game = await db
					.select()
					.from(games)
					.where(
						and(
							eq(games.id, id),
							eq(
								games.userId,
								db
									.select({ id: users.id })
									.from(users)
									.where(
										eq(
											users.id,
											db
												.select({
													userId: sessions.userId,
												})
												.from(sessions)
												.where(
													eq(sessions.id, session_id),
												),
										),
									),
							),
						),
					)
					.get();

				if (!game) {
					return { type: 'error', error: 'Game not found.' };
				}

				const newGame = await db
					.update(games)
					.set({ name })
					.where(eq(games.id, id))
					.returning()
					.get();

				return {
					type: 'success',
					data: {
						id: newGame.id,
						userId: newGame.userId,
						name: newGame.name,
						createdAt: newGame.createdAt,
						lastUpdatedAt: newGame.lastUpdatedAt,
						score: newGame.score,
					},
				};
			} catch (err) {
				console.error(err);
				return { type: 'error', error: 'Failed to rename game.' };
			}
		}),
	list: t.procedure
		.input(
			z.object({
				limit: z.number().optional(),
				cursor: z
					.string()
					.regex(/^[0-9]+:[0-9]+$/)
					.optional(),
			}),
		)
		.output(
			z.discriminatedUnion('type', [
				z.object({
					type: z.literal('success'),
					data: z.array(
						z.object({
							id: z.string(),
							userId: z.string(),
							name: z.string().nullable(),
							createdAt: z.number(),
							lastUpdatedAt: z.number(),
							score: z.number(),
							totalScore: z.number(),
						}),
					),
				}),
				z.object({ type: z.literal('error'), error: z.string() }),
			]),
		)
		.query(
			async ({ input: { limit, cursor }, ctx: { env, session_id } }) => {
				try {
					const db = database(env);

					const updatedCursor = cursor
						? parseInt(cursor.split(':')[0])
						: Date.now() + 1000;
					const createdCursor = cursor
						? parseInt(cursor.split(':')[1])
						: Date.now() + 1000;

					const data = await db
						.select()
						.from(games)
						.where(
							and(
								eq(
									games.userId,
									db
										.select({ id: users.id })
										.from(users)
										.where(
											eq(
												users.id,
												db
													.select({
														userId: sessions.userId,
													})
													.from(sessions)
													.where(
														eq(
															sessions.id,
															session_id,
														),
													),
											),
										),
								),
								or(
									lt(games.lastUpdatedAt, updatedCursor),
									and(
										lte(games.lastUpdatedAt, updatedCursor),
										lt(games.createdAt, createdCursor),
									),
								),
							),
						)
						.orderBy(
							desc(games.lastUpdatedAt),
							desc(games.createdAt),
						)
						.limit(limit ?? 50);

					const _gameData = data.map((game) => ({
						id: game.id,
						userId: game.userId,
						createdAt: game.createdAt,
						lastUpdatedAt: game.lastUpdatedAt,
						name: game.name,
						score: game.score,
						totalScore: computeTotalScore(
							game.score,
							game.upgrade1,
							game.upgrade2,
							game.upgrade3,
							game.upgrade4,
							game.upgrade5,
							game.upgrade6,
						),
					}));

					return { type: 'success', data: _gameData };
				} catch (err) {
					console.error(err);
					return { type: 'error', error: 'Failed to get games.' };
				}
			},
		),
	get: t.procedure
		.input(
			z.object({
				id: z.string(),
			}),
		)
		.output(
			z.discriminatedUnion('type', [
				z.object({
					type: z.literal('success'),
					data: z.object({
						id: z.string(),
						userId: z.string(),
						name: z.string().nullable(),
						createdAt: z.number(),
						lastUpdatedAt: z.number(),
						score: z.number(),
						upgrade1: z.number(),
						upgrade2: z.number(),
						upgrade3: z.number(),
						upgrade4: z.number(),
						upgrade5: z.number(),
						upgrade6: z.number(),
						totalScore: z.number(),
					}),
				}),
				z.object({ type: z.literal('error'), error: z.string() }),
			]),
		)
		.query(async ({ input: { id }, ctx: { env, session_id } }) => {
			const db = database(env);

			const game = await db
				.select()
				.from(games)
				.where(
					and(
						eq(games.id, id),
						eq(games.userId, getUserId(session_id, env)),
					),
				)
				.get();

			if (!game) {
				return { type: 'error', error: 'Game not found.' };
			}

			return {
				type: 'success',
				data: {
					id: game.id,
					userId: game.userId,
					name: game.name,
					createdAt: game.createdAt,
					lastUpdatedAt: game.lastUpdatedAt,
					score: game.score,
					upgrade1: game.upgrade1,
					upgrade2: game.upgrade2,
					upgrade3: game.upgrade3,
					upgrade4: game.upgrade4,
					upgrade5: game.upgrade5,
					upgrade6: game.upgrade6,
					totalScore: computeTotalScore(
						game.score,
						game.upgrade1,
						game.upgrade2,
						game.upgrade3,
						game.upgrade4,
						game.upgrade5,
						game.upgrade6,
					),
				},
			};
		}),
	update: t.procedure
		.input(
			z.object({
				id: z.string(),
				score: z.number(),
				upgrade1: z.number(),
				upgrade2: z.number(),
				upgrade3: z.number(),
				upgrade4: z.number(),
				upgrade5: z.number(),
				upgrade6: z.number(),
			}),
		)
		.output(
			z.discriminatedUnion('type', [
				z.object({
					type: z.literal('success'),
					data: z.object({
						id: z.string(),
						userId: z.string(),
						name: z.string().nullable(),
						createdAt: z.number(),
						lastUpdatedAt: z.number(),
						score: z.number(),
						upgrade1: z.number(),
						upgrade2: z.number(),
						upgrade3: z.number(),
						upgrade4: z.number(),
						upgrade5: z.number(),
						upgrade6: z.number(),
						totalScore: z.number(),
					}),
				}),
				z.object({
					type: z.literal('error'),
					error: z.string(),
					data: z
						.object({
							id: z.string(),
							userId: z.string(),
							name: z.string().nullable(),
							createdAt: z.number(),
							lastUpdatedAt: z.number(),
							score: z.number(),
							upgrade1: z.number(),
							upgrade2: z.number(),
							upgrade3: z.number(),
							upgrade4: z.number(),
							upgrade5: z.number(),
							upgrade6: z.number(),
							totalScore: z.number(),
						})
						.nullable(),
				}),
			]),
		)
		.mutation(
			async ({
				input: {
					id,
					score,
					upgrade1,
					upgrade2,
					upgrade3,
					upgrade4,
					upgrade5,
					upgrade6,
				},
				ctx: { env, session_id },
			}) => {
				const db = database(env);

				const game = await db
					.select()
					.from(games)
					.where(
						and(
							eq(games.id, id),
							eq(games.userId, getUserId(session_id, env)),
						),
					)
					.get();

				if (!game) {
					return {
						type: 'error',
						error: 'Game not found.',
						data: null,
					};
				}

				const oldGameTotalScore = computeTotalScore(
					game.score,
					game.upgrade1,
					game.upgrade2,
					game.upgrade3,
					game.upgrade4,
					game.upgrade5,
					game.upgrade6,
				);

				const newGameTotalScore = computeTotalScore(
					score,
					upgrade1,
					upgrade2,
					upgrade3,
					upgrade4,
					upgrade5,
					upgrade6,
				);

				if (newGameTotalScore < oldGameTotalScore) {
					console.log(
						'Old save. Reloading newest save.',
						oldGameTotalScore,
						newGameTotalScore,
					);
					return {
						type: 'error',
						error: 'Old save. Reloading newest save.',
						data: {
							id: game.id,
							userId: game.userId,
							name: game.name,
							createdAt: game.createdAt,
							lastUpdatedAt: game.lastUpdatedAt,
							score: game.score,
							upgrade1: game.upgrade1,
							upgrade2: game.upgrade2,
							upgrade3: game.upgrade3,
							upgrade4: game.upgrade4,
							upgrade5: game.upgrade5,
							upgrade6: game.upgrade6,
							totalScore: computeTotalScore(
								game.score,
								game.upgrade1,
								game.upgrade2,
								game.upgrade3,
								game.upgrade4,
								game.upgrade5,
								game.upgrade6,
							),
						},
					};
				}

				const newGame = await db
					.update(games)
					.set({
						score,
						upgrade1,
						upgrade2,
						upgrade3,
						upgrade4,
						upgrade5,
						upgrade6,
						lastUpdatedAt: Date.now(),
					})
					.where(eq(games.id, id))
					.returning()
					.get();

				return {
					type: 'success',
					data: {
						id: newGame.id,
						userId: newGame.userId,
						name: newGame.name,
						createdAt: newGame.createdAt,
						lastUpdatedAt: newGame.lastUpdatedAt,
						score: newGame.score,
						upgrade1: newGame.upgrade1,
						upgrade2: newGame.upgrade2,
						upgrade3: newGame.upgrade3,
						upgrade4: newGame.upgrade4,
						upgrade5: newGame.upgrade5,
						upgrade6: newGame.upgrade6,
						totalScore: computeTotalScore(
							newGame.score,
							newGame.upgrade1,
							newGame.upgrade2,
							newGame.upgrade3,
							newGame.upgrade4,
							newGame.upgrade5,
							newGame.upgrade6,
						),
					},
				};
			},
		),
});
