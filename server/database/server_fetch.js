const knex = require('knex')(require('./knexfile'));
const {
	CATEGORIES,
	FORUMS,
	POSTS,
	STATS,
	TOPICS,
	USERS,
} = require('./tables');

/**
 * @param {number|undefined} categoryId ID of Category to fetch.
 * @returns {Promise<any[]>} A list of Categories. If `categoryId` is
 * `undefined`, all Categories are returned. This will always be a list,
 * even when a single Category is returned (by ID).
 */
async function getCategoriesById(categoryId) {
	const query = knex.select().from(CATEGORIES);

	if (categoryId != null) {
		query.where('id', '=', categoryId);
	}

	return query;
}

/**
 * @param {number|undefined} categoryId Fetch Forums with this Category ID.
 * @returns {Promise<any[]>} The list of Forums that belong to the given
 * Category, sorted by their `sort_index`. If `categoryId` is `undefined`,
 * all Forums are returned.
 */
async function getForumsByCategoryId(categoryId) {
	const query = knex.select()
		.from(FORUMS)
		.orderBy('sort_index', 'asc');

	if (categoryId != null) {
		query.where('category_id', '=', categoryId);
	}

	return query;
}

/**
 * @param {number} forumId ID of Forum to fetch within.
 * @returns {Promise<any>} The User that made the most recent Post in a Topic
 * within the given Forum.
 */
async function getLatestPostUserInForum(forumId) {
	return knex
		.first(`${USERS}.*`)
		.from(USERS)
		.whereIn(`${USERS}.id`, builder1 => builder1
			.first(`${POSTS}.author_id`)
			.from(POSTS)
			.innerJoin(TOPICS, builder2 => builder2
				.on(`${POSTS}.topic_id`,  '=', `${TOPICS}.id`)
				.on(`${TOPICS}.forum_id`, '=', forumId)
			)
			.orderBy(`${POSTS}.created_at`, 'DESC')
		);
}

/**
 * @returns {Promise<any[]>} The list of all moderators. Dennis was the only
 * moderator, so this will always be a list containing Dennis and no one else.
 */
async function getModerators() {
	const DENNIS_ID = 73;
	return knex
		.select()
		.from(USERS)
		.where('id', '=', DENNIS_ID);
}

/**
 * @return {Promise<Object<string,string>>}
 * A name -> value mapping of all the arbitrary stats in the database,
 * also the latest Post with its associated User.
 */
async function getStats() {
	const latestPost = await knex
		.first()
		.from(POSTS)
		.orderBy('created_at', 'DESC');

	const latestPostUser = await knex
		.first()
		.from(USERS)
		.where('id', '=', latestPost.author_id);

	const statRows = await knex.select().from(STATS);

	const stats = statRows.reduce((map, stat) => {
		map[stat.name] = Number.parseInt(stat.value);
		return map;
	}, {});

	return {
		...stats,
		latest_post: {
			...latestPost,
			author: latestPostUser,
		},
	};
}

/**
 * @param {number} userId The ID of the User to fetch.
 * @return {Promise<any>} A User matching the given ID.
 */
async function getUserById(userId) {
	return knex.first()
		.from(USERS)
		.where('id', '=', userId);
}

module.exports = {
	getCategoriesById,
	getForumsByCategoryId,
	getLatestPostUserInForum,
	getModerators,
	getStats,
	getUserById,
};