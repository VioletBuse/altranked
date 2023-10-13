import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
	id: text('id').notNull().primaryKey(),
	createdAt: integer('created_at').notNull(),
});

export const anonAccounts = sqliteTable('anon_accounts', {
	id: text('id').notNull().primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id),
	createdAt: integer('created_at').notNull(),
});

export const altrankedAccounts = sqliteTable('altranked_accounts', {
	id: text('id').notNull().primaryKey(),
	email: text('email').notNull().unique(),
	username: text('username').notNull().unique(),
	passwordHash: text('password_hash').notNull(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id),
	createdAt: integer('created_at').notNull(),
});

export const sessions = sqliteTable('sessions', {
	id: text('id').notNull().primaryKey(),
	type: text('type').notNull(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id),
	createdAt: integer('created_at').notNull(),
});

export const games = sqliteTable('games', {
	id: text('id').notNull().primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id),
	score: integer('score').notNull().default(0),
	upgrade1: integer('upgrade_1').notNull().default(0),
	upgrade2: integer('upgrade_2').notNull().default(0),
	upgrade3: integer('upgrade_3').notNull().default(0),
	upgrade4: integer('upgrade_4').notNull().default(0),
	upgrade5: integer('upgrade_5').notNull().default(0),
	upgrade6: integer('upgrade_6').notNull().default(0),
	name: text('name'),
	createdAt: integer('created_at').notNull(),
	lastUpdatedAt: integer('last_updated_at').notNull().default(0),
});
