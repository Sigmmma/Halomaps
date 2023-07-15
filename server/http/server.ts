import cors from 'cors';
import { RequestHandler, Request } from 'express'; // @types/express from polka
import { ServerResponse } from 'http';
import polka from 'polka';

import * as database from '../database/server_fetch';
import { TopicWithCount } from '../database/types';
import {
	CategoryWithForum,
	ForumInfo,
	ForumWithPost,
	HomeData,
	TopicList,
	TopicInfo,
	TopicPostPage,
	UserInfo,
} from './types';
const info = require('../package.json');

/**
 * A simple HTTP server for retrieving Halomaps data.
 *
 * See client/src/index.tsx for rationale.
 */
const server = polka();
export default server;

server.use(cors());

// Middleware for logging requests
server.use('/', (request, _response, next) => {
	console.log(`${new Date().toISOString()} ${request.method} ${request.url}`);
	next();
});

const CATEGORY_ID = 'categoryId';
const FORUM_ID = 'forumId';
const TOPIC_ID = 'topicId';
const USER_ID = 'userId';

server.get(`/forum/:${FORUM_ID}`, wrapHandler(getForum));
server.get(`/forum/:${FORUM_ID}/topics`, wrapHandler(getForumTopics));
server.get(`/home/:${CATEGORY_ID}?`, wrapHandler(getHome));
server.get('/info', wrapHandler(getInfo));
server.get(`/topic/:${TOPIC_ID}`, wrapHandler(getTopic));
server.get(`/topic/:${TOPIC_ID}/posts`, wrapHandler(getTopicPosts));
server.get(`/topic/latest/:${FORUM_ID}`, wrapHandler(getLatestTopic));
server.get(`/user/:${USER_ID}`, wrapHandler(getUser));

/**
 * Return info for AGPL compliance.
 */
function getInfo(): string {
	return [
		info.description,
		'',
		`Server version:   ${info.version}`,
		`Source code:      ${info.repository.url}`,
		`Report bugs:      ${info.bugs.url}`,
		`Archive download: ${info.repository.url}#Download`,
		'',
	].join('\n')
}

/**
 * Fetches and returns the data needed to render the home page.
 *
 * Reference:
 *   - index.cfm?page=home
 *   - index.cfm?page=home&category=1
 */
async function getHome(request: Request): Promise<HomeData> {
	const categoryId = getNumberParamOptional(request, CATEGORY_ID);

	// Comes sorted from the database.
	const categories: CategoryWithForum[] = await database.getCategories(categoryId);
	if (categories.length === 0) {
		throw new RequestError(404, `No Category with ID ${categoryId}`);
	}

	// Also comes sorted from the database.
	const forums     = await database.getForumsByCategory(categoryId);
	const stats      = await database.getStats();
	const moderators = await database.getModerators();

	const forumsWithPost: ForumWithPost[] = await Promise.all(forums.map(async forum => {
		const latest     = await database.getLatestPost(forum.id);
		const postCount  = await database.getForumPostCount(forum.id);
		const topicCount = await database.getForumTopicCount(forum.id);

		return {
			...forum,
			latest,
			postCount,
			topicCount,
		};
	}));

	// Enables faster Category lookup in following forums.forEach
	const categoryMap = categories.reduce(
		(map, category) => map.set(category.id, category),
		new Map<number, CategoryWithForum>()
	);

	// Split Forums into lists in their respective Categories.
	// Forums and Categories are already sorted, so this is automatically sorted too.
	forumsWithPost.forEach(forum => {
		const category = categoryMap.get(forum.category_id);

		if (!category.forums) {
			category.forums = [];
		}

		category.forums.push(forum);
	});

	const newestPost = await database.getLatestPost();
	const newestUser = await database.getNewestUser();

	return {
		categories,
		moderators,
		newestPost,
		newestUser,
		stats,
	};
}

/**
 *
 */
async function getSearch(request: Request) {
	return 'TODO';
}

/**
 *
 */
async function getMembers(request: Request) {
	return 'TODO';
}

/**
 *
 */
async function getRecent(request: Request) {
	return 'TODO';
}

/**
 * Fetches the data needed to render a Forum page, other than Topics.
 * For Topics, see {@link getForumTopics}.
 *
 * Reference:
 *   - index.cfm?forum&forumID=4
 *   - index.cfm?forum&forumID=4&start=51
 */
async function getForum(request: Request): Promise<ForumInfo> {
	const forumId = getNumberParam(request, FORUM_ID);

	const forum = await database.getForum(forumId);
	if (!forum) {
		throw new RequestError(404, `No Forum with ID ${forumId}`);
	}

	const category = (await database.getCategories(forum.category_id))[0];
	const moderators = await database.getModerators();
	const topics = await database.getTopicCount(forumId);

	return {
		category,
		forum,
		moderators,
		topics,
	};
}

/**
 * Fetches the list of Topics for a Forum page.
 */
async function getForumTopics(request: Request): Promise<TopicList> {
	const forumId = getNumberParam(request, FORUM_ID);
	const limit = getNumberQuery(request, 'count') ?? database.MAX_TOPIC_PAGE_SIZE;
	// Database is 0-indexed while the client is 1-indexed
	const start = (getNumberQuery(request, 'start') ?? 1) - 1;

	const topics = await database.getTopicsInForum({
		forumId,
		limit,
		start,
	});

	return {
		start: start + 1,
		topics,
	};
}

/**
 * Fetches a User and their most recent posts.
 */
async function getUser(request: Request): Promise<UserInfo> {
	const userId = getNumberParam(request, USER_ID);

	const board_post_count = await database.getBoardPostCount();
	const posts = await database.getUserPosts(userId);
	const user = await database.getUserWithPostCount(userId);

	const topicIds = posts.reduce(
		(set, post) => set.add(post.topic_id),
		new Set<number>(),
	);
	const topics = await database.getTopicsById([...topicIds]);

	const forumIds = topics.reduce(
		(set, topic) => set.add(topic.forum_id),
		new Set<number>()
	);
	const forums = await database.getForumsById([...forumIds]);

	return {
		board_post_count,
		forums,
		posts,
		topics,
		user,
	};
}

/**
 * Fetches the Topic containing the most recent Post in the given Forum.
 */
async function getLatestTopic(request: Request): Promise<TopicInfo> {
	const forumId = getNumberParam(request, FORUM_ID);
	const topic = await database.getLatestTopic(forumId);
	return _getTopicShared(topic);
}

/**
 * Fetches the information for a Topic.
 */
async function getTopic(request: Request): Promise<TopicInfo> {
	const topicId = getNumberParam(request, TOPIC_ID);
	const topic = await database.getTopic(topicId);
	return _getTopicShared(topic);
}

async function _getTopicShared(topic: TopicWithCount): Promise<TopicInfo> {
	const adjacent = await database.getAdjacentTopics(topic.id);
	const moderators = await database.getModerators();
	const forum = await database.getForum(topic.forum_id);
	const category = (await database.getCategories(forum.category_id))[0];

	return {
		...adjacent,
		category,
		forum,
		moderators,
		topic,
	};
}

/**
 * Fetches the list of Posts and Users for a Topic page.
 */
async function getTopicPosts(request: Request): Promise<TopicPostPage> {
	const topicId = getNumberParam(request, TOPIC_ID);
	const limit = getNumberQuery(request, 'count') ?? database.MAX_POST_PAGE_SIZE;
	// Database is 0-indexed while the client is 1-indexed
	const start = (getNumberQuery(request, 'start') ?? 1) - 1;

	const postsAndUsers = await database.getPosts({
		topicId,
		limit,
		start,
	});

	return {
		size: limit,
		start: start + 1,
		...postsAndUsers,
	};
}

/** An Error that can specify an HTTP response code. */
class RequestError extends Error {
	code: number;
	constructor(code: number, message: string) {
		super(message);
		this.code = code;
	}
}

/** Extracts, parses, and validates a numerical path parameter. */
function getNumberParam(request: Request, param: string): number {
	const value = Number.parseInt(request.params[param]);

	if (Number.isNaN(value)) {
		throw new RequestError(400, `${param} must be a number`);
	}

	return value;
}

/** Extracts, parses, and validates an optional numerical path parameter. */
function getNumberParamOptional(request: Request, param: string): number | undefined {
	const value = Number.parseInt(request.params[param]);

	return Number.isNaN(value) ? undefined : value;
}

/**
 * Extracts, parses, and validates a numerical query parameter.
 *
 * Query parameters are always optional in our system.
 * We also only expect one instance of any numerical query parameter,
 * so we can enforce that here.
 */
function getNumberQuery(request: Request, paramName: string): number | undefined {
	const param = request.query[paramName];
	if (!param) {
		return undefined;
	}

	if (typeof param !== 'string') {
		throw new RequestError(400, `Only one instance of ${paramName} is allowed`);
	}

	const value = Number.parseInt(param);

	if (Number.isNaN(value)) {
		throw new RequestError(400, `${paramName} must be a number, if provided`);
	}

	return value;
}

/** Returns an empty response to the client. */
function writeEmpty(response: ServerResponse, code: number): void {
	response.writeHead(code).end();
}

/** Returns a "text/plain" response to the client. */
function writeText(response: ServerResponse, code: number, text: string): void {
	response.writeHead(code, {
		'Content-Type': 'text/plain',
	}).end(text);
}

/** Returns an "application/json" data response to the client. */
function writeJson(response: ServerResponse, code: number, data: unknown): void {
	response.writeHead(code, {
		'Content-Type': 'application/json',
	}).end(JSON.stringify(data));
}

/** Wrapper that restores the ability to use "throw" in handlers. */
function wrapHandler(handler: (request: Request) => unknown): RequestHandler {
	return async (request, response) => {
		try {
			// NOTE The handler can be async
			const returnedData: unknown = await handler(request);

			if (!returnedData) {
				writeEmpty(response, 204);
			} else if (typeof returnedData === 'string') {
				writeText(response, 200, returnedData);
			} else {
				writeJson(response, 200, returnedData);
			}
		} catch (err) {
			if (err instanceof RequestError) {
				writeText(response, err.code, err.message);
			} else {
				console.error(err);
				writeText(response, 500, 'Internal server error');
			}
		}
	};
}
