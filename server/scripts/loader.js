const { readdir, stat } = require('fs').promises;
const { join, basename } = require('path');

// Need insensitive search since filenames in mirror mix cases.
const HOME_FILE_REGEX    = /page=home$/i;
const HOMECAT_FILE_REGEX = /page=home&categoryid=(\d+)/i;
const USER_FILE_REGEX    = /page=userinfo&viewuserid=(\d+)/i;

/** Allows us to apply and load mirror files in a specific order. */
const FILE_PROCESSORS = [
	[HOME_FILE_REGEX,    loadHomeFile],
	[HOMECAT_FILE_REGEX, loadHomeCategoryFile],
	//[USER_FILE_REGEX, loadUserFile],
];

/**
 * Entry point for loading Halomaps files. Can handle a single file, or a
 * directory containing many files.
 *
 * @param {string} value path to a file or a directory.
 */
async function load(value) {
	const valueStats = await stat(value);
	if (valueStats.isFile()) {
		await loadFile(value);
	} else if (valueStats.isDirectory()) {
		await loadDirectory(value);
	} else {
		throw new Error(`Not a file or directory: ${value}`);
	}
}

/**
 * Loads every matching file in the given directory. Routes each file to the
 * appropriate loader. Also reports skipped files.
 *
 * Some information depends on other information already being in the database
 * (e.g. Topics reference a User). Because of this, we need to process each
 * page type from the mirror in a specific order. That order is defined by the
 * {@link FILE_PROCESSORS} array.
 *
 * @param {string} directory
 */
async function loadDirectory(directory) {
	const dirents = await readdir(directory, { withFileTypes: true });

	const filenameSet = dirents.reduce((fileset, dirent) => {
		if (dirent.isFile()) {
			fileset.add(dirent.name);
		}
		return fileset;
	}, new Set());

	for await (const pair of FILE_PROCESSORS) {
		const matchRegex = pair[0];
		const matchingFiles = Array.from(filenameSet.values())
			.filter(filename => matchRegex.test(filename));

		for await (const file of matchingFiles) {
			filenameSet.delete(file);
			await loadFile(join(directory, file), pair);
		}
	}

	// TODO report skipped files
	//console.log(filenameSet);
}

/**
 * Routes a single file to the appropriate loader.
 *
 * @param {string} filepath
 * @param {[RegExp, (string) => Promise<void>]?} pair
 */
async function loadFile(filepath, pair) {
	// If coming from loadDirectory, this work has already been done for us.
	if (!pair) {
		pair = FILE_PROCESSORS.find(([regex]) => regex.test(filepath));
	}

	if (!pair) {
		console.error(`No processor for file: ${basename(filepath)}`);
		return;
	}

	const fileProcessor = pair[1];
	fileProcessor(filepath);
}

/**
 * Handles: index.cfm?page=home
 *
 * We can extract all Category and Forum names and descriptions from the main
 * home page. The only thing missing is the Category ID, which we get in
 * {@link loadHomeCategoryFile}.
 *
 * @param {string} filepath
 */
async function loadHomeFile(filepath) {
	console.log(basename(filepath));
}

/**
 * Handles: index.cfm?page=home&categoryID=x
 *
 * The categoryID pages are just used to extract Category IDs and match them to
 * Category names.
 *
 * @param {string} filepath
 */
async function loadHomeCategoryFile(filepath) {
	console.log(basename(filepath));
}

/**
 * Handles: index.cfm?page=userInfo&viewuserid=x
 *
 * All information for a User, other than their special field, can be extracted
 * from their individual userInfo page.
 *
 * @param {string} filepath
 */
async function loadUserFile(filepath) {
	console.log(filepath);
}

module.exports = {
	load,
};
