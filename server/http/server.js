const polka = require('polka');
const database = require('../database/server_fetch');
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

server.get('/index.cfm', async (request, response) => {
	try {
		// Halomaps used inconsistent casing on URLs,
		// so normalize parameters to lower case.
		Object.keys(request.query).forEach(key => {
			const value = request.query[key];
			delete request.query[key];

			request.query[key.toLowerCase()] = value.toLowerCase();
		});

		// Scala does one cool thing, and that is assignment from switch-case.
		// Thankfully, we can hack it in a better language.
		// undefined means an invalid page was requested (or none at all).
		// null means the page was valid, but returns no data.
		const returnedData = await {
			'forgotpassword': () => null,
			'forum':          getForum,
			'home':           getHome,
			'login':          () => null,
			'members':        getMembers,
			'recent':         getRecent,
			'register':       () => null,
			'search':         getSearch,
			'topic':          getTopic,
			'userinfo':       getUser,
		}[request.query.page]?.(request);

		if (returnedData === undefined) {
			writeText(response, 400, request.query.page
				? `Invalid page: ${request.query.page}`
				: 'No page requested'
			);
		} else if (returnedData === null) {
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
});

server.get('/info', (_request, response) => {
	writeText(response, 200, [
		info.description,
		'',
		`Server version:   ${info.version}`,
		`Source code:      ${info.repository.url}`,
		`Report bugs:      ${info.bugs.url}`,
		`Archive download: ${info.repository.url}#Download`,
		'',
	].join('\n'));
});

/**
 * Returns an empty response to the client.
 *
 * @param {Response} response
 * @param {number} code
 */
function writeEmpty(response, code) {
	response.writeHead(code).end();
}

/**
 * Returns a "text/plain" response to the client.
 *
 * @param {Response} response
 * @param {number} code
 * @param {string} text
 */
function writeText(response, code, text) {
	response.writeHead(code, {
		'Content-Type': 'text/plain',
	}).end(text);
}

/**
 * Returns an "application/json" data response to the client.
 *
 * @param {Response} response
 * @param {number} code
 * @param {string} data
 */
function writeJson(response, code, data) {
	response.writeHead(code, {
		'Content-Type': 'application/json',
	}).end(JSON.stringify(data));
}

/**
 * Fetches and returns the data needed to render the home page.
 *
 * Reference:
 *   - index.cfm?page=home
 *   - index.cfm?page=home&category=1
 * @param {Request} request
 */
async function getHome(request) {
	let categoryId = Number.parseInt(request.query.category);
	if (Number.isNaN(categoryId)) {
		categoryId = undefined;
	}

	const categories = await database.getCategoriesById(categoryId);
	if (categories.length === 0) {
		throw new RequestError(404, `No Category with ID ${categoryId}`);
	}

	const forums     = await database.getForumsByCategoryId(categoryId);
	const stats      = await database.getStats();
	const moderators = await database.getModerators();

	for await (const forum of forums) {
		const lastPostUser = await database.getLatestPostUserInForum(forum.id);
		forum.last_post_user = lastPostUser;
		forum.moderators     = moderators;
	}

	// Enables faster Category lookup in following forums.forEach
	const categoryMap = categories.reduce(
		(map, category) => map.set(category.id, category),
		new Map()
	);

	// Split Forums into lists in their respective Categories.
	// Forums come sorted from the database, so these Forum lists are already sorted.
	forums.forEach(forum => {
		const category = categoryMap.get(forum.category_id);

		if (!category.forums) {
			category.forums = [];
		}

		category.forums.push(forum);
	});

	return {
		categories,
		stats,
	};
}

/**
 *
 * @param {Request} request
 */
async function getSearch(request) {
	return 'TODO';
}

/**
 *
 * @param {Request} request
 */
async function getMembers(request) {
	return 'TODO';
}

/**
 *
 * @param {Request} request
 */
async function getRecent(request) {
	return 'TODO';
}

/**
 *
 * @param {Request} request
 */
async function getForum(request) {
	return 'TODO';
}

/**
 *
 * @param {Request} request
 */
async function getUser(request) {
	return 'TODO';
}

/**
 *
 * @param {Request} request
 */
async function getTopic(request) {
	return 'TODO';
}

/** An Error that can specify an HTTP response code. */
class RequestError extends Error {
	code;
	constructor(code, message) {
		super(message);
		this.code = code;
	}
}

module.exports = server;
