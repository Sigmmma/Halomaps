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

async function updateTopicCreationTime(topicCreationTime) {
	return knex(TOPICS)
		.where('id', topicCreationTime.id)
		.update('created_at', topicCreationTime.created_at);
}

async function addUser(user) {
	return knex(USERS)
		.insert(user)
		.onConflict().ignore();
}

async function getUserIdByName(name) {
	return knex(USERS).select('id').where('name', name);
}

async function updateUsers(userUpdates) {
	return Promise.all(userUpdates.map(userUpdate =>
		knex(USERS)
			.where('id', userUpdate.id)
			.update(userUpdate)
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
	updateCategorySorts,
	updateTopicCreationTime,
	updateUsers,
};
