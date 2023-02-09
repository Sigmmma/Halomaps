const knex = require('knex')(require('./knexfile'));

const CATEGORIES = 'categories';
const FORUMS     = 'forums';
const POSTS      = 'posts';
const STATS      = 'stats';
const TOPICS     = 'topics';
const USERS      = 'users';


async function addCategory(category) {
	return knex(CATEGORIES)
		.insert(category)
		.onConflict().ignore();
}

async function updateCategorySorts(categorySorts) {
	return Promise.all(categorySorts.map(sort =>
		knex(CATEGORIES)
			.where('name', sort.name)
			.update('sort_index', sort.sort_index)
	));
}

async function addForums(forums) {
	return knex(FORUMS)
		.insert(forums)
		.onConflict().ignore();
}

async function addPosts(posts) {
	return knex(POSTS)
		.insert(posts)
		.onConflict().ignore();
}

async function addStats(stats) {
	return knex(STATS)
		.insert(stats)
		.onConflict('name').merge(['value', 'mirrored_at']);
}

async function addTopics(topics) {
	return knex(TOPICS)
		.insert(topics)
		.onConflict().ignore();
}

async function patchTopicWhereNull(topicPatch) {
	return Promise.all(['author_id', 'created_at']
		.filter(field => topicPatch[field])
		.map(field => knex(TOPICS)
			.update(field, topicPatch[field])
			.where('id', topicPatch.id)
			.whereNull(field)
		));
}

async function addUser(user) {
	return knex(USERS)
		.insert(user)
		.onConflict().ignore();
}

async function getUserIdByName(name) {
	const row = await knex(USERS).first('id').where('name', name);
	return row?.id;
}

async function updateUsersWhereNull(userPatches) {
	return Promise.all(userPatches.map(userPatch =>
		Promise.all(['quote', 'special']
			.filter(field => userPatch[field])
			.map(field => knex(USERS)
				.update(field, userPatch[field])
				.where('id', userPatch.id)
			)
		)
	));
}

module.exports = {
	addCategory,
	addForums,
	addPosts,
	addStats,
	addTopics,
	addUser,
	getUserIdByName,
	patchTopicWhereNull,
	updateCategorySorts,
	updateUsersWhereNull,
};
