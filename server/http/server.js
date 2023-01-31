const polka = require('polka');

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

		const returnedData = (
			request.query.page === 'home'     ? getHome(request)  :
			request.query.page === 'forum'    ? getForum(request) :
			request.query.page === 'userinfo' ? getUser(request)  :
			request.query.page === 'topic'    ? getTopic(request) :
			undefined
		);

		if (returnedData === undefined) {
			writeText(response, 400, `Invalid page: ${request.query.page}`);
		} else if (typeof returnedData === 'string') {
			writeText(response, 200, returnedData);
		} else {
			writeJson(response, 200, returnedData);
		}
	} catch (err) {
		console.error(err);
		writeText(response, 500, 'Internal server error');
	}
});

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
 * @returns
 */
function getHome() {
	return 'TODO';
}

function getForum() {
	return 'TODO';
}

function getUser() {
	return 'TODO';
}

function getTopic() {
	return 'TODO';
}

module.exports = server;
