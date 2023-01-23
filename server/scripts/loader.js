const { readdir, readFile, stat } = require('fs').promises;
const { join, basename } = require('path');
const { HTMLElement, parse } = require('node-html-parser');

// Need insensitive search since filenames in mirror mix cases.
const HOME_FILE_REGEX    = /page=home$/i;
const HOMECAT_FILE_REGEX = /page=home&categoryid=(\d+)/i;
const USER_FILE_REGEX    = /page=userinfo&viewuserid=(\d+)/i;

/** Allows us to apply and load mirror files in a specific order. */
const FILE_PROCESSORS = [
	[HOMECAT_FILE_REGEX, loadHomeCategoryFile],
	[HOME_FILE_REGEX,    loadHomeFile],
	//[USER_FILE_REGEX, loadUserFile],
];

const TIMEZONE_OFFSET = 'GMT-0500'; // TODO parameterize this
const RENDER_TIME_REGEX = /Time: ([\w,: ]+)/;
const FORUM_ID_REGEX = /forumid=(\d+)/i;

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

	console.log(basename(filepath));

	const htmlContent = await readFile(filepath);
	const htmlRoot = parse(htmlContent);

	const fileProcessor = pair[1];
	fileProcessor(filepath, htmlRoot);
}

// The following is a series of jank CSS query selectors to scrape data from
// equally jank rendered HTML pages. It's more art than science.
// Rule of thumb -- Halomaps loves tables.

/**
 * Handles: index.cfm?page=home&categoryID=x
 *
 * Most information about Categories and Forums could be scraped from the main
 * home page, but critically, the home page is missing Category ID. Forums
 * belong to a Category, so we just extract both from these sub-home pages.
 *
 * Category sort order comes from {@link loadHomeFile}.
 *
 * @param {string} filepath
 * @param {HTMLElement} htmlRoot
 */
async function loadHomeCategoryFile(filepath, htmlRoot) {
	// Second table contains Category / Forum info
	const forumTable = htmlRoot.querySelectorAll('table table')[1];
	const forumTableRows = forumTable.querySelectorAll('tr');
	forumTableRows.shift(); // Ignore constant header
	const categoryRow = forumTableRows.shift();
	forumTableRows.shift(); // Ignore "top" link in category

	const categoryId = Number.parseInt(
		HOMECAT_FILE_REGEX.exec(basename(filepath))[1]
	);
	const categoryName = categoryRow.querySelector('b').text;
	const renderTime = extractRenderTime(htmlRoot);

	// TODO insert into database
	console.log('Category',
	{
		id: categoryId,
		name: categoryName,
		mirrored_at: renderTime,
	}
	);

	// Remaining rows contain Forum info
	// TODO insert into database
	console.log('Forums',
	forumTableRows.map((forumRow, index) => {
		// The cell containing the Forum's name, description, and lock status
		const forumInfo = forumRow.querySelectorAll('td')[1];

		const lockImg     = forumInfo.querySelector('img');
		const forumLocked = !!lockImg?.getAttribute('src')?.includes('icon_lock');

		const forumLink = forumInfo.querySelector('a');
		const forumName = forumLink.text;
		const forumId   = Number.parseInt(
			FORUM_ID_REGEX.exec(forumLink.getAttribute('href'))[1]
		);

		const forumDesc = forumInfo.querySelector('div').text;

		return {
			id:          forumId,
			sort_index:  index,
			name:        forumName,
			locked:      forumLocked,
			description: forumDesc,
			category_id: categoryId,
			mirrored_at: renderTime,
		};
	})
	);
}

/**
 * Handles: index.cfm?page=home
 *
 * Most of the work is already done by {@link loadHomeCategoryFile}. We just
 * extract Category sort order and forum stats here.
 *
 * @param {string} filepath unused
 * @param {HTMLElement} htmlRoot
 */
async function loadHomeFile(filepath, htmlRoot) {
	const tables = htmlRoot.querySelectorAll('table table');
	const forumTable = tables[1];
	const statsTable = tables[7];

	// Gives us Categories but not Forums
	const categoryRows = forumTable.querySelectorAll('table tr');
	// TODO update existing category rows
	console.log('Category Sort',
	categoryRows.map((row, index) => ({
		sort_index: index,
		name: row.querySelector('b').text,
	}))
	);

	const STATS_REGEX = new RegExp([
		/(\d+) users have contributed to /,
		/(\d+) threads and (\d+) posts/,
		/.*/,
		/Most registered users online was (\d+) on ([\w:, ]+)/,
	].map(part => part.source).join(''), 'gs');
	const match = STATS_REGEX.exec(statsTable.rawText);

	const renderTime = extractRenderTime(htmlRoot);
	// TODO stick this in the database
	console.log('Stats',
	[
		{ name: 'users',          value: match.at(1) },
		{ name: 'topics',         value: match.at(2) },
		{ name: 'posts',          value: match.at(3) },
		{ name: 'most_users_num', value: match.at(4) },
		{ name: 'most_users_at',  value: stringToDate(match.at(5)) },
	].map(row => ({...row, mirrored_at: renderTime}) )
	);
}

/**
 * Handles: index.cfm?page=userInfo&viewuserid=x
 *
 * All information for a User, other than their special field, can be extracted
 * from their individual userInfo page.
 *
 * @param {string} filepath
 * @param {HTMLElement} htmlRoot
 */
async function loadUserFile(filepath, htmlRoot) {

}

/**
 * Extracts the page render time from the given HTML. Halomaps uses a consistent
 * footer for this, so this should work for any rendered page.
 *
 * @param {HTMLElement} htmlRoot
 */
function extractRenderTime(htmlRoot) {
	const tables = htmlRoot.querySelectorAll('table');
	tables.pop(); // Last table is "Halomaps" footer
	const timeTable = tables.pop(); // Second-to-last contains the render time.

	const match = RENDER_TIME_REGEX.exec(timeTable?.text);
	if (match) {
		return stringToDate(match[1]);
	}
}

/**
 * Halomaps renders all dates in the same format. This converts the string to
 * an actual JavaScript Date object.
 *
 * @param {string} date_str
 */
function stringToDate(date_str) {
	return new Date(`${date_str} ${TIMEZONE_OFFSET}`);
	// TODO handle "today"
	// TODO handle "yesterday"
}

module.exports = {
	load,
};
