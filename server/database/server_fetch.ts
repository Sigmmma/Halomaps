import { parseJSON as parseJsonDate } from 'date-fns';
import setupKnex from 'knex';
// @ts-ignore This has to be a JS file for knex
import knexfile from './knexfile';
const knex = setupKnex(knexfile);
import Table from './tables';
import {
	Category,
	Forum,
	ForumStats,
	Post,
	PostAndUser,
	Stat,
	Topic,
	User,
} from './types';

/**
 * Gets a list of Categories.
 * - If `categoryId` is `undefined`, all Categories are returned.
 * - if `categoryId` matches no Category, an empty list is returned.
 */
export async function getCategories(categoryId?: number): Promise<Category[]> {
	const query = knex<Category>(Table.CATEGORIES).select();

	if (categoryId != null) {
		query.where('id', '=', categoryId);
	} else {
		query.orderBy('sort_index', 'asc');
	}

	return (await query).map(row => parseDates(row, ['mirrored_at'])!);
}

/**
 * Gets a list of Forums by Category ID.
 * - If `categoryId` is `undefined`, all Forums are returned.
 * - If `categoryId` matches no Category, an empty list is returned.
 */
export async function getForums(categoryId?: number): Promise<Forum[]> {
	const query = knex<Forum>(Table.FORUMS)
		.select()
		.orderBy('sort_index', 'asc');

	if (categoryId != null) {
		query.where('category_id', '=', categoryId);
	}

	return (await query).map(row => parseDates(row, ['mirrored_at'])!);
}

/**
 * Gets the latest Post and Post User.
 * - If `forumId` is `undefined`, returns latest Post globally.
 * - If `forumId` matches no Forum, `undefined` is returned.
 */
export async function getLatestPost(forumId?: number): Promise<PostAndUser | undefined> {
	// FIXME this query is quite slow. Can we speed it up at all?
	const latestPostQuery = knex<Post>(Table.POSTS)
		.first()
		.orderBy('created_at', 'desc');

	if (forumId != null) {
		latestPostQuery.whereIn('topic_id', knex<Topic>(Table.TOPICS)
			.select('id')
			.where('forum_id', '=', forumId)
		);
	}

	const latestPost = parseDates(
		await latestPostQuery,
		['created_at', 'mirrored_at'],
	);

	if (!latestPost) {
		return undefined;
	}

	const latestPostUser = (await getUser(latestPost.author_id))!;

	return {
		post: latestPost,
		user: latestPostUser,
	};
}

/**
 * Gets the most recent registered User.
 */
export async function getNewestUser(): Promise<User> {
	const user = await knex<User>(Table.USERS)
		.first()
		.orderBy('joined_at', 'desc');
	return parseDates(user, ['joined_at', 'last_visit_at', 'mirrored_at']);
}

/**
 * Gets the list of all moderators. Dennis was the only moderator, so this will
 * always be a list containing Dennis and no one else.
 *
 * Why are we returning a list, you ask?
 *
 * For one, it's just more syntactically correct for "moderators" to be a list.
 *
 * For two, maybe some day we want this forum to be "not-read-only". This is,
 * perhaps, blind optimism, but if that day ever comes, it's one less thing
 * to worry about (in a sea of many new things to worry about).
 */
export async function getModerators(): Promise<User[]> {
	const DENNIS_ID = 73;
	return await Promise.all([DENNIS_ID].map(id => getUser(id)));
}

/** Gets all of the arbitrary stats in the database. */
export async function getStats(): Promise<ForumStats> {
	const statRows = await knex<Stat>(Table.STATS).select()

	const statHash = statRows.reduce((map, row) => {
		map[row.name] = row.name === 'most_users_at'
			? new Date(row.value)
			: row.value;
		return map;
	}, {} as Record<keyof ForumStats, number | Date>);

	return statHash as ForumStats;
}

/** Fetches a User by ID. */
export async function getUser(userId: number): Promise<User | undefined> {
	const user = await knex<User>(Table.USERS)
		.first()
		.where('id', '=', userId);

	return parseDates(user, ['joined_at', 'last_visit_at', 'mirrored_at']);
}

// Fields in T with (possibly optional) Date https://stackoverflow.com/a/49752227
type DateKey<T> = keyof {
	[K in keyof T as T[K] extends (Date | null | undefined) ? K : never]: any
}

/** Converts columns containing date data to actual {@link Date} objects. */
function parseDates<T>(
	row: T | undefined,
	dateKeys: DateKey<T>[]
): T | undefined {
	if (!row) return;

	dateKeys.forEach(key => {
		// These are the possible values of a date column in the database.
		const value = row[key] as number | string | null | undefined;

		if (value != null) { // Intentional loose equality
			// @ts-ignore The constraint on key makes this a safe assignment.
			row[key] = parseJsonDate(value);
		}
	});

	return row;
}
