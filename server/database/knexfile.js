const path = require('path');

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
	client: 'sqlite3',
	connection: {
		// TODO probably make this configurable
		filename: path.join(__dirname, '..', 'halomaps.sqlite'),
	},
	migrations: {
		directory: path.join(__dirname, 'migrations'),
	},
	useNullAsDefault: true,
};
