const { basename } = require('path');

const minimist = require('minimist');

const loader = require('./loader');
const { version } = require('../package.json');

const argv = minimist(process.argv.slice(2), {
	alias: {
		help: 'h',
	},
	boolean: [
		'help',
		'version',
	],
	default: {
		help: false,
		version: false,
	},
});
argv.files = argv._;

const USAGE = [
	`Usage: ${basename(__filename)} [OPTIONS] <directory|file(s)>`,
	'',
	'Options:',
	'\t -h --help   Prints this help text and exits.',
	'\t --version   Prints the server (and this script) version and exits.',
	'',
	'Note: Prefer using directories over individual files. The mirror script ',
	'creates (or created) a directory containing about 52,000 files, which is ',
	'too many files to glob using a shell.',
].join('\n');

if (argv.help || argv.files.length === 0) {
	console.log(`Halomaps mirror import script ${version}`);
	console.log();
	console.log(USAGE);
	process.exit();
}

if (argv.version) {
	console.log(version);
	process.exit();
}

(async function () {
	for await (const file of argv.files) {
		await loader.load(file);
	}
	process.exit();
})();
