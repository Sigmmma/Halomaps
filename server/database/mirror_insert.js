const knex = require('knex')(require('./knexfile'));
const {
	CATEGORIES,
	FORUMS,
	POSTS,
	STATS,
	TOPICS,
	USERS,
} = require('./tables');

async function addCategory(category) {
	return knex
		.insert(category)
		.into(CATEGORIES)
		.onConflict().ignore();
}

/**
 * Sets the sort index for already-added Category records.
 */
async function updateCategorySorts(categorySorts) {
	return Promise.all(categorySorts.map(sort =>
		knex
			.update('sort_index', sort.sort_index)
			.table(CATEGORIES)
			.where('name', sort.name)
	));
}

async function addForums(forums) {
	return knex
		.insert(forums)
		.into(FORUMS)
		.onConflict().ignore();
}

async function addPosts(posts) {
	return knex
		.insert(posts)
		.into(POSTS)
		.onConflict().ignore();
}

async function addStats(stats) {
	return knex
		.insert(stats)
		.into(STATS)
		.onConflict('name').merge(['value', 'mirrored_at']);
}

async function addTopics(topics) {
	return knex
		.insert(topics)
		.into(TOPICS)
		.onConflict().ignore();
}

/**
 * Patches a subset of Topic fields if they're null.
 */
async function patchTopicWhereNull(topicPatch) {
	return Promise.all(['author_id', 'created_at']
		.filter(field => topicPatch[field])
		.map(field => knex
			.update(field, topicPatch[field])
			.table(TOPICS)
			.where('id', topicPatch.id)
			.whereNull(field)
		));
}

async function addUser(user) {
	return knex
		.insert(user)
		.into(USERS)
		.onConflict().ignore();
}

async function getUserIdByName(name) {
	const row = await knex
		.first('id')
		.from(USERS)
		.where('name', name);

	return row?.id;
}

/**
 * Patches a subset of User fields.
 */
async function patchUsers(userPatches) {
	return Promise.all(userPatches.map(userPatch =>
		Promise.all(['quote', 'special']
			.filter(field => userPatch[field])
			.map(field => knex
				.update(field, userPatch[field])
				.table(USERS)
				.where('id', userPatch.id)
			)
		)
	));
}

/**
 * Gets every instance where a Topic's author_name does not match the name of
 * the User referenced by the Topic's author_id. These records are grouped by
 * author name and user name to give us a count of how many times each
 * individual author_name -> user_name mismatch happens.
 *
 * @returns {Promise<{
 *   topic_count: number,
 *   author_name: string,
 *   user_name: string,
 * }[]>}
 */
async function getMismatchedTopicAuthors() {
	return knex
		.count(`${TOPICS}.id AS topic_count`)
		.select(
			`${TOPICS}.author_name`,
			`${USERS}.name AS user_name`,
		)
		.from(USERS)
		.innerJoin(TOPICS, function() {
			this
				.on(   `${USERS}.id`,    '=', `${TOPICS}.author_id`)
				.andOn(`${USERS}.name`, '!=', `${TOPICS}.author_name`);
		})
		.groupBy(`${TOPICS}.author_name`)
		.groupBy(`${USERS}.name`)
		.orderBy(`${TOPICS}.author_name`);
}

/**
 * Nulls out the author_id for every Topic whose author_name is in the given list.
 * @param {string[]} authorNames
 */
async function clearAuthorIdForTopicsStartedBy(authorNames) {
	return knex(TOPICS)
		.update('author_id', null)
		.whereIn('author_name', authorNames);
}

module.exports = {
	addCategory,
	addForums,
	addPosts,
	addStats,
	addTopics,
	addUser,
	clearAuthorIdForTopicsStartedBy,
	getMismatchedTopicAuthors,
	getUserIdByName,
	patchTopicWhereNull,
	patchUsers,
	updateCategorySorts,
};
