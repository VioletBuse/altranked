import { Env } from '@api/index.ts';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '@api/db/schema.ts';

export const database = (env: Env) => {
	return drizzle(env.DB, { schema });
};
