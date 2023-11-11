import { parseJSON as parseJsonDate } from 'date-fns';
import setupKnex from 'knex';
// @ts-ignore This has to be a JS file for knex
import knexfile from './knexfile';
const knex = setupKnex(knexfile);
import Table from './tables';
import { MatchOption, SearchParams } from '../http/types';
import {
	AdjacentTopic,
	Category,
	Forum,
	ForumStats,
	Post,
	PostAndUser,
	Stat,
	Topic,
	TopicPosts,
	TopicWithCount,
	TopicWithPostInfo,
	User,
	UserWithPostCount,
} from './types';

interface Paginated {
	limit?: number;
	start?: number;
}

type PostQuery = Paginated & {
	topicId: number;
}

type TopicQuery = Paginated & {
	forumId: number;
}

export const DEFAULT_USER_POST_COUNT = 20;
export const MAX_POST_PAGE_SIZE = 35;
export const MAX_TOPIC_PAGE_SIZE = 50;

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

/** Gets all Forums. */
export async function getForums(): Promise<Forum[]> {
	const forums = await knex<Forum>(Table.FORUMS)
		.select();
	return forums.map(forum => parseDates(forum, ['mirrored_at']));
}

/** Gets a Forum by ID. Returns `undefined` if `forumId` matches no Forums. */
export async function getForum(forumId: number): Promise<Forum | undefined> {
	const forums = await getForumsById([forumId]);
	return forums[0];
}

/** Gets a list of Forums matching the given IDs. */
export async function getForumsById(forumIds: number[]): Promise<Forum[]> {
	const forums = await knex<Forum>(Table.FORUMS)
		.select()
		.whereIn('id', forumIds);
	return forums.map(forum => parseDates(forum, ['mirrored_at']));
}

/** Gets the number of Posts in the given Forum. */
export async function getForumPostCount(forumId: number): Promise<number> {
	const COUNT = 'postcount';
	const countRow = await knex<Post>(Table.POSTS)
		.first()
		.count('*', { as: COUNT })
		.innerJoin(Table.TOPICS, join => join
			.on(`${Table.TOPICS}.id`, '=', 'topic_id')
		)
		.where(`${Table.TOPICS}.forum_id`, '=', forumId);

	return Number.parseInt(`${countRow[COUNT]}`);
}

/** Gets the number of Topics in the given Forum. */
export async function getForumTopicCount(forumId: number): Promise<number> {
	const COUNT = 'rowcount';
	const countRow = await knex<Topic>(Table.TOPICS)
		.first()
		.count('*', { as: COUNT })
		.where('forum_id', '=', forumId);

	return Number.parseInt(`${countRow[COUNT]}`);
}

/**
 * Gets a list of Forums by Category ID.
 * - If `categoryId` is `undefined`, all Forums are returned.
 * - If `categoryId` matches no Category, an empty list is returned.
 */
export async function getForumsByCategory(categoryId?: number): Promise<Forum[]> {
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

/** Gets the most recent registered User. */
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

/**
 * Gets list of Posts and their Authors for a page in a Topic.
 * Also includes the total number of Posts in the Topic.
 */
export async function getPosts({
	topicId,
	limit,
	start,
}: PostQuery): Promise<TopicPosts> {
	const posts = await knex<Post>(Table.POSTS)
		.select()
		.where('topic_id', '=', topicId)
		.orderBy('created_at', 'asc')
		.offset(start)
		.limit(clamp(0, limit ?? MAX_POST_PAGE_SIZE, MAX_POST_PAGE_SIZE));

	const authorIds = [...new Set(posts.map(post => post.author_id))]

	const users = await knex<User>(Table.USERS)
		.select()
		.whereIn('id', authorIds);

	return {
		posts: posts.map(post => parseDates(post, ['created_at', 'mirrored_at'])),
		users: users.map(user => parseDates(user, ['joined_at', 'last_visit_at', 'mirrored_at'])),
	};
}

/** Gets the total number of posts. */
export async function getBoardPostCount(): Promise<number> {
	const NUM = 'num_posts';
	const count = await knex<Post>(Table.POSTS)
		.count('*', { as: NUM })
		.first();
	return Number.parseInt(`${count[NUM]}`);
}

/** Gets the most recent Posts for the given User. */
export async function getUserPosts(
	userId: number,
	limit = DEFAULT_USER_POST_COUNT,
): Promise<Post[]> {
	const posts = await knex<Post>(Table.POSTS)
		.select()
		.where('author_id', '=', userId)
		.limit(limit)
		.orderBy('created_at', 'desc');

	return posts.map(post => parseDates(post, ['created_at', 'mirrored_at']));
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

/** Gets the latest Topic in the given Forum */
export async function getLatestTopic(forumId: number): Promise<TopicWithCount | undefined> {
	const latest = await knex<Topic>(Table.TOPICS)
		.first()
		.where('forum_id', '=', forumId)
		.orderBy('created_at', 'desc');

	if (!latest) return undefined;

	const topicId = latest['id'];
	return await getTopic(topicId);
}
/**
 * Returns the IDs of the Topics that are adjacent to the given Topic.
 *
 * "Adjacent" means the next newest and previous oldest Topics. In other words,
 * the Topics that display above and below the given Topic on the Forum list.
 * This is determined by the time of the most recent Post in the Topic.
 */
export async function getAdjacentTopics(topicId: number): Promise<AdjacentTopic> {
	const LATEST_POSTS = 'latest_posts';
	const POST_TIME = 'latest_post_time';
	const ROW_NUM = 'row_num';
	const SORTED_POSTS = 'sorted_posts';

	const topic = await getTopic(topicId);

	const latestPostGroupedByTopicQuery = knex<Post>(Table.POSTS)
		.select('author_id', 'topic_id')
		.max('created_at', { as: POST_TIME })
		.groupBy('topic_id');

	type SortedPostTopic = Topic
		& Pick<Post, 'author_id'|'topic_id'>
		& {
			[POST_TIME]: number;
			[ROW_NUM]: number;
		};

	// Newer / Older is determined by last post. We sort by last post and assign
	// row_numbers so we can select the current Topic by ID, then subtract / add
	// 1 to the row_num to get the newer / older Topic.

	const sortedPostsQuery = knex<SortedPostTopic>(Table.TOPICS)
		.with(LATEST_POSTS, latestPostGroupedByTopicQuery)
		.select('id', 'name', 'topic_id', POST_TIME)
		.rowNumber(ROW_NUM, { column: POST_TIME, order: 'desc' })
		.innerJoin(LATEST_POSTS, join => join
			.on(`${LATEST_POSTS}.topic_id`, '=', `${Table.TOPICS}.id`)
		)
		.where('forum_id', '=', topic.forum_id)
		.orderBy(POST_TIME, 'desc');

	const adjPartial = knex.queryBuilder<SortedPostTopic>()
		.from(SORTED_POSTS)
		.where('topic_id', '=', topicId)

	type AdjTopic = Pick<SortedPostTopic, 'id'> & { [ROW_NUM]: number };

	const adjRows: AdjTopic[] = await knex.queryBuilder<SortedPostTopic>()
		.with(SORTED_POSTS, sortedPostsQuery)
		.select('id', ROW_NUM)
		.from(SORTED_POSTS)
		.whereIn(ROW_NUM, sub => sub
			.unionAll(adjPartial.clone().select(knex.raw(`${ROW_NUM} - 1`))) // Newer Topic
			.unionAll(adjPartial.clone().select(ROW_NUM)) // Given reference Topic
			.unionAll(adjPartial.clone().select(knex.raw(`${ROW_NUM} + 1`))) // Older Topic
		);

	// This query could be missing a newer or older Topic (or both) if the
	// given Topic is already the newest or oldest. We detect this by using the
	// given Topic's row_number as a reference.
	const refTopic = adjRows.find(row => row.id === topicId);
	const newTopic = adjRows.find(row => row[ROW_NUM] === refTopic[ROW_NUM] - 1);
	const oldTopic = adjRows.find(row => row[ROW_NUM] === refTopic[ROW_NUM] + 1);

	return {
		topicNewerId: newTopic?.id,
		topicOlderId: oldTopic?.id,
	};
}

/** Gets a single Topic by ID. */
export async function getTopic(topicId: number): Promise<TopicWithCount | undefined> {
	const topics = await getTopicsById([topicId]);
	return topics[0];
}

/** Gets a list of Topics whose IDs are in the given list. */
export async function getTopicsById(topicIds: number[]): Promise<TopicWithCount[]> {
	const topics = await knex<Topic>(Table.TOPICS)
		.select()
		.whereIn('id', topicIds);

	const REPLIES = 'replies';
	const postCountRows = await knex<Post>(Table.POSTS)
		.select('topic_id')
		.count('*', { as: REPLIES })
		.groupBy('topic_id')
		.whereIn('topic_id', topicIds);

	const countMap = postCountRows.reduce(
		(map, count) => map.set(count.topic_id, Number.parseInt(`${count[REPLIES]}`)),
		new Map<number, number>()
	);

	return topics.map(topic => ({
		...parseDates(topic, ['created_at', 'mirrored_at']),
		replies: countMap.get(topic.id),
	}));
}

/**
 * Gets a page of Topics within the given Forum. These are intended to show up
 * in a list of Topics, so the returned Topics also include number of Posts and
 * most recent Post.
 */
export async function getTopicsInForum({
	forumId,
	limit,
	start
}: TopicQuery): Promise<TopicWithPostInfo[]> {
	const LATEST_POSTS = 'latest_posts';
	const POST_TIME = 'latest_post_time';
	const POST_AUTHOR_ID = 'latest_post_author_id';
	const POST_AUTHOR_NAME = 'latest_post_author_name';
	const USERNAMES = 'user_names';

	const latestPostGroupedByTopicQuery = knex<Post>(Table.POSTS)
		.select(
			{ [POST_AUTHOR_ID]: 'author_id' },
			'topic_id',
		)
		.count('topic_id', { as: 'post_count' })
		.max('created_at', { as: POST_TIME })
		.groupBy('topic_id');

	const userNameQuery = knex<User>(Table.USERS)
		.select(
			{ [POST_AUTHOR_ID]:   'id'   },
			{ [POST_AUTHOR_NAME]: 'name' },
		);

	// Type safety kinda goes out the window with compound queries like this.
	const rows: TopicWithPostInfo[] = await knex<TopicWithPostInfo>(Table.TOPICS)
		.with(LATEST_POSTS, latestPostGroupedByTopicQuery)
		.with(USERNAMES, userNameQuery)
		.select('*')
		.innerJoin(LATEST_POSTS, join => join
			.on(`${LATEST_POSTS}.topic_id`, '=', `${Table.TOPICS}.id`)
		)
		.innerJoin(USERNAMES, join => join
			.on(`${USERNAMES}.${POST_AUTHOR_ID}`, '=', `${LATEST_POSTS}.${POST_AUTHOR_ID}`)
		)
		.where('forum_id', '=', forumId)
		.orderBy([
			{ column: 'pinned',  order: 'desc' },
			{ column: POST_TIME, order: 'desc' },
		])
		.offset(start)
		.limit(clamp(0, limit ?? MAX_TOPIC_PAGE_SIZE, MAX_TOPIC_PAGE_SIZE));

	return rows.map(row =>
		parseDates(row, ['created_at', 'latest_post_time', 'mirrored_at'])
	);
}

/** Fetches the number of Topics in the given Forum. */
export async function getTopicCount(forumId: number): Promise<number> {
	const NUM = 'topic_count';
	const row = await knex<Topic>(Table.TOPICS)
		.first()
		.count('*', { as: NUM })
		.where('forum_id', '=', forumId);
	return Number.parseInt(`${row[NUM]}`);
}

/** Fetches a User by ID. */
export async function getUser(userId: number): Promise<User | undefined> {
	const user = await knex<User>(Table.USERS)
		.first()
		.where('id', '=', userId);

	return parseDates(user, ['joined_at', 'last_visit_at', 'mirrored_at']);
}

/** Fetches a list of Users by IDs. */
export async function getUsersById(userIds: number[]): Promise<User[]> {
	const users = await knex<User>(Table.USERS)
		.select()
		.whereIn('id', userIds);

	return users.map(user => parseDates(user, ['joined_at', 'last_visit_at', 'mirrored_at']));
}

/** Fetches a User and their total Post count by ID. */
export async function getUserWithPostCount(
	userId: number,
): Promise<UserWithPostCount | undefined> {
	const user = await getUser(userId);

	if (!user) return undefined;

	const NUM = 'post_count';
	const countRow = await knex<Post>(Table.POSTS)
		.count('*', { as: NUM })
		.first()
		.where('author_id', '=', userId);
	const total_posts = Number.parseInt(`${countRow[NUM]}`);

	return {
		...user,
		total_posts,
	};
}

/**
 * Returns a list of Posts matching the given search parameters.
 */
export async function queryPosts(
	params: SearchParams,
	limit: number,
	start: number,
): Promise<Post[]> {
	let authorId: number;
	if (params.author) {
		const author = await knex<User>(Table.USERS)
			.first('id')
			.where('name', '=', params.author);

		// If we can't find the author, then there couldn't possibly be any
		// posts from that user. We can short-circuit early.
		if (!author) {
			return [];
		}

		authorId = author.id;
	}

	const query = knex<Post>(Table.POSTS)
		.select()
		.limit(limit)
		.offset(start);

	if (params.author) {
		query.where('author_id', '=', authorId);
	}

	if (params.from) {
		query.where('created_at', '>=', params.from);
	}

	if (params.to) {
		query.where('created_at', '<=', params.to);
	}

	// Escape SQL WHERE wildcards
	if (params.search) {
		params.search = params.search
			.replace(/%/g, '\\%')
			.replace(/_/g, '\\_');
	}

	// Knex doesn't have an "escape" builder, so we need to use raw WHERE
	// queries to make SQLite use our escape character.
	const like = `content LIKE ? ESCAPE '\\'`;
	if (params.match === MatchOption.Exact) {
		query.whereRaw(like, [`%${params.search}%`]);
	} else {
		const terms = params.search?.split(/\s+/);

		if (params.match === MatchOption.All) {
			terms?.forEach(term => query.andWhereRaw(like, [`%${term}%`]));
		}

		if (params.match === MatchOption.Any) {
			terms?.forEach(term => query.orWhereRaw(like, [`%${term}%`]));
		}
	}

	const posts = await query;
	return posts.map(post => parseDates(post, ['created_at', 'mirrored_at']));
}

/** Constrains a value between the min and max. */
function clamp(min: number, value: number, max: number): number {
	return Math.min(Math.max(min, value), max);
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
