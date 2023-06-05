import setupKnex from 'knex';
// @ts-ignore This has to be a JS file for knex
import knexfile from './knexfile';
const knex = setupKnex(knexfile);
import Table from './tables';
import { Category, Forum, Post, Stat, Topic, User } from './types';

/** For updating a Category with its sort index. */
export type CategorySort = Pick<Category, 'name' | 'sort_index'>;
/** For creating the initial Topic record. */
export type InitialTopic = Omit<Topic, 'author_id' | 'created_at'> & Partial<Topic>;
/** For updating a Topic record with previously missing info. */
export type TopicPatch = Pick<Topic, 'id'> & Partial<Pick<Topic, 'author_id' | 'created_at'>>;
/** For updating a User record with previously missing info. */
export type UserPatch = Pick<User, 'id' | 'quote' | 'special'>;
/** For identifying Topics whose author may have been deleted or renamed. */
export interface MismatchedTopicAuthor {
	topic_count: number;
	author_name: string;
	user_name: string;
}

export async function addCategory(category: Category): Promise<void> {
	await knex<Category>(Table.CATEGORIES)
		.insert(category)
		.onConflict().ignore();
}

/** Sets the sort index for already-added Category records. */
export async function updateCategorySorts(
	categorySorts: CategorySort[],
): Promise<void> {
	await Promise.all(categorySorts.map(sort =>
		knex<CategorySort>(Table.CATEGORIES)
			.update('sort_index', sort.sort_index)
			.where('name', '=', sort.name)
	));
}

export async function addForums(forums: Forum[]): Promise<void> {
	await knex<Forum>(Table.FORUMS)
		.insert(forums)
		.onConflict().ignore();
}

export async function addPosts(posts: Post[]): Promise<void> {
	await knex<Post>(Table.POSTS)
		.insert(posts)
		.onConflict().ignore();
}

export async function addStats(stats: Stat[]): Promise<void> {
	await knex<Stat>(Table.STATS)
		.insert(stats)
		.onConflict('name').merge(['value', 'mirrored_at']);
}

export async function addTopics(topics: InitialTopic[]): Promise<void> {
	await knex<Topic>(Table.TOPICS)
		.insert(topics)
		.onConflict().ignore();
}

/** Patches a subset of Topic fields if they're null. */
export async function patchTopicWhereNull(topicPatch: TopicPatch): Promise<void> {
	await Promise.all(Array.of<keyof TopicPatch>('author_id', 'created_at')
		.filter(field => topicPatch[field])
		.map(field => knex<TopicPatch>(Table.TOPICS)
			.update(field, topicPatch[field]!)
			.where('id', '=', topicPatch.id)
			.whereNull(field)
		)
	);
}

export async function addUser(user: User): Promise<void> {
	await knex<User>(Table.USERS)
		.insert(user)
		.onConflict().ignore();
}

export async function getUserIdByName(name: string): Promise<number | undefined> {
	const row = await knex<User>(Table.USERS)
		.first('id')
		.where('name', '=', name);

	return row?.id;
}

/** Patches a subset of User fields. */
export async function patchUsers(userPatches: UserPatch[]): Promise<void> {
	await Promise.all(userPatches.map(userPatch =>
		Promise.all(Array.of<keyof UserPatch>('quote', 'special')
			.filter(field => userPatch[field])
			.map(field => knex<UserPatch>(Table.USERS)
				.update(field, userPatch[field])
				.where('id', '=', userPatch.id)
			)
		)
	));
}

/**
 * Gets every instance where a Topic's author_name does not match the name of
 * the User referenced by the Topic's author_id. These records are grouped by
 * author name and user name to give us a count of how many times each
 * individual author_name -> user_name mismatch happens.
 */
export async function getMismatchedTopicAuthors(): Promise<MismatchedTopicAuthor[]> {
	// Look, we're just not getting type safety with this one. Sorry.
	return knex
		.count(`${Table.TOPICS}.id AS topic_count`)
		.select(
			`${Table.TOPICS}.author_name`,
			`${Table.USERS}.name AS user_name`,
		)
		.from(Table.USERS)
		.innerJoin(Table.TOPICS, function() {
			this
				.on(   `${Table.USERS}.id`,    '=', `${Table.TOPICS}.author_id`)
				.andOn(`${Table.USERS}.name`, '!=', `${Table.TOPICS}.author_name`);
		})
		.groupBy(`${Table.TOPICS}.author_name`)
		.groupBy(`${Table.USERS}.name`)
		.orderBy(`${Table.TOPICS}.author_name`);
}

/**
 * Nulls out the author_id for every Topic whose author_name is in the given list.
 * @param {string[]} authorNames
 */
export async function clearAuthorIdForTopicsStartedBy(authorNames: string[]): Promise<void> {
	await knex<Topic>(Table.TOPICS)
		.update('author_id', null)
		.whereIn('author_name', authorNames);
}
