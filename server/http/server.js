const polka = require('polka');

/**
 * A simple HTTP server that recreates Halomaps' queries.
 *
 * All queries to Halomaps' forum were done through an endpoint index.cfm.
 * Forums, Topics, Users, etc... were all requested via query parameters to
 * this one endpoint. Halomaps would then render the HTML server-side on-demand,
 * then serve the full page to the client.
 *
 * Instead of rendering the HTML, we will return the JSON a client needs to
 * render the page themselves.
 */
const server = polka();

server.get('/index.cfm', (req, res) => {
	console.log(req.query);
	res.end('Hi Mom');
});

module.exports = server;
