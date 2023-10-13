import { database } from '@api/lib/drizzle.ts';
import { sessions, users } from '@api/db/schema.ts';
import { eq } from 'drizzle-orm';
import { Env } from '@api/index.ts';

export const getUserId = (session_id: string, env: Env) => {
	const db = database(env);

	return db
		.select({ userId: users.id })
		.from(users)
		.where(
			eq(
				users.id,
				db
					.select({ userId: sessions.userId })
					.from(sessions)
					.where(eq(sessions.id, session_id)),
			),
		);
};
