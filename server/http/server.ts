import cors from 'cors';
import { RequestHandler, Request } from 'express'; // @types/express from polka
import { ServerResponse } from 'http';
import polka from 'polka';

import * as database from '../database/server_fetch';
import {
	CategoryWithForum,
	ForumInfo,
	ForumWithPost,
	HomeData,
} from './types';
const info = require('../package.json');

/**
 * A simple HTTP server that recreates Halomaps' queries.
 *
 * All queries to Halomaps' forum were done through an endpoint index.cfm.
 * Forums, Topics, Users, etc... were all requested via query parameters to
 * this one endpoint. Halomaps would then render the HTML server-side on-demand,
 * then serve the full page to the client.
 *
 * Examples:
 *   index.cfm?page=topic&topicID=12345&start=36
 *   index.cfm?page=userInfo&viewuserid=54321
 *
 * Supporting these queries as Halomaps did will preserve links to other forum
 * pages in Post content to continue working with this new mirror.
 *
 * The only difference is that instead of rendering the HTML server-side, we
 * will return the data as JSON a client can use to render the page themselves.
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

server.get(`/forum/:${FORUM_ID}`, wrapHandler(getForum));
server.get(`/forum/:${FORUM_ID}/posts`, wrapHandler(getForumTopics));
server.get(`/home/:${CATEGORY_ID}?`, wrapHandler(getHome));
server.get('/info', wrapHandler(getInfo));

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
	const categoryId = getNumberParam(request, CATEGORY_ID);

	// Comes sorted from the database.
	const categories: CategoryWithForum[] = await database.getCategories(categoryId);
	if (categories.length === 0) {
		throw new RequestError(404, `No Category with ID ${categoryId}`);
	}

	// Also comes sorted from the database.
	const forums: ForumWithPost[] = await database.getForums(categoryId);
	const stats                   = await database.getStats();
	const moderators              = await database.getModerators();

	for await (const forum of forums) {
		forum.latest = await database.getLatestPost(forum.id);
	}

	// Enables faster Category lookup in following forums.forEach
	const categoryMap = categories.reduce(
		(map, category) => map.set(category.id, category),
		new Map<number, CategoryWithForum>()
	);

	// Split Forums into lists in their respective Categories.
	// Forums and Categories are already sorted, so this is automatically sorted too.
	forums.forEach(forum => {
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
 *
 */
async function getUser(request: Request) {
	return 'TODO';
}

/**
 *
 */
async function getTopic(request: Request) {
	return 'TODO';
}

/** An Error that can specify an HTTP response code. */
class RequestError extends Error {
	code: number;
	constructor(code: number, message: string) {
		super(message);
		this.code = code;
	}
}

/** Extracts, parses, and validates a numerical query parameter. */
function getNumberParam(request: Request, param: string): number {
	const value = Number.parseInt(request.params[param]);

	if (Number.isNaN(value)) {
		throw new RequestError(400, `${param} must be a number`);
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
