const { readdir, readFile, stat } = require('fs').promises;
const { join, basename } = require('path');
const { DateTime } = require('luxon');
const { HTMLElement, parse: parseHtml } = require('node-html-parser');

// Need insensitive search since filenames in mirror mix cases.
const HOME_FILE_REGEX    = /page=home$/i;
const HOMECAT_FILE_REGEX = /page=home&categoryid=(\d+)/i;
const USER_FILE_REGEX    = /page=userinfo&viewuserid=(\d+)/i;

/** Allows us to apply and load mirror files in a specific order. */
const FILE_PROCESSORS = [
	[HOMECAT_FILE_REGEX, loadHomeCategoryFile],
	[HOME_FILE_REGEX,    loadHomeFile],
	[USER_FILE_REGEX,    loadUserFile],
];

const MIRROR_TIMEZONE = 'America/New_York'; // TODO parameterize this

// Matches both of these:
// <b>Time:</b> Wed January 18, 2023 11:32 PM
// Time: Wed January 18, 2023 11:32 PM
const RENDER_TIME_REGEX = /(?:<b>)?Time:(?:<\/b>)? ([\w,: ]+)/;

const TIME_FORMATS = [
	'MMM d, yyyy h:mm a',      // Sep 30, 2006 09:29 PM
	'EEE MMMM d, yyyy h:mm a', // Wed January 18, 2023 11:50 PM
];
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

	const htmlContent = await readFile(filepath, { encoding: 'utf-8' });
	const htmlRoot = parseHtml(htmlContent);

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
	const renderTime = stringToDate(extractRenderTime(htmlRoot));

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

	const renderTimeStr = extractRenderTime(htmlRoot);
	const renderTime = stringToDate(renderTimeStr);
	const mostUsersAt = stringToDate(match.at(5), renderTimeStr);

	// TODO stick this in the database
	console.log('Stats',
	[
		{ name: 'users',          value: match.at(1) },
		{ name: 'topics',         value: match.at(2) },
		{ name: 'posts',          value: match.at(3) },
		{ name: 'most_users_num', value: match.at(4) },
		{ name: 'most_users_at',  value: mostUsersAt },
	].map(row => ({ ...row, mirrored_at: renderTime }) )
	);
}

/**
 * Handles: index.cfm?page=userInfo&viewuserid=x
 *
 * All information for a User, other than their special field, can be extracted
 * from their individual userInfo page. Unless they don't have an avatar, then
 * they could have a quote that only renders on their posts.
 *
 * @param {string} filepath
 * @param {HTMLElement} htmlRoot
 */
async function loadUserFile(filepath, htmlRoot) {
	const userId = Number.parseInt(
		USER_FILE_REGEX.exec(basename(filepath))[1]
	);

	// TODO catch if we've already added this user (check by ID in database)

	// User pages do not play nice with query selectors for some reason.
	// Thankfully, the page structure is pretty consistent, so we can isolate
	// profile info with this awful hard-coded nonsense instead.
	let userInfoNodes = htmlRoot.childNodes[1].childNodes.slice(21, 70);

	// Strip the blank nodes out of this list. Empty user info fields still
	// have HTML tags in them, so we use .toString() instead of .text
	// to remove the truly blank ones.
	userInfoNodes = userInfoNodes.filter(
		node => node.toString().trim().length > 0
	);

	// Catch blank user pages (like ID = 0)
	if (userInfoNodes.length === 0) {
		console.log('Skipping blank user page', userId);
		return;
	}

	// Name node need special handling, so pop those off
	const nameNode = userInfoNodes.shift();
	userInfoNodes.shift(); // Ignore "Contact" label node

	// Avatar node needs special handling too, but isn't present if user has no avatar
	let avatarNode;
	if (userInfoNodes.at(-2).toString().includes('Avatar')) {
		avatarNode = userInfoNodes.pop();
		userInfoNodes.pop(); // Ignore "Avatar" label node
	}

	// From this point on, empty strings indicate the value wasn't actually
	// provided on the page, so treat those as null.

	// What remains now is an alternating list of keys and values.
	const userFields = {};
	for (let i = 0; i < userInfoNodes.length; i += 2) {
		const fieldName = userInfoNodes[i].text.split(':')[0];
		userFields[fieldName] = userInfoNodes[i + 1]?.text || null;
	}

	const renderTime = extractRenderTime(htmlRoot);
	const userName = nameNode.text.split(': ')[1].trim();

	// The avatar node contains both the user's image and quote.
	// If the user does not have an avatar, this node is not present at all,
	// EVEN IF they do have a quote.
	//
	// Get the avatar filename off of the image node. Remove the "avatars" root
	// so we can use our own solution to statically serve these files later.
	let userAvatar = null;
	let userQuote  = null;
	if (avatarNode) {
		userAvatar = avatarNode.childNodes[0]
			?.getAttribute('src')
			?.replace('avatars/', '');
		userQuote = avatarNode.text.trim() || null;
	}

	console.log('User',
	{
		id:            userId,
		name:          userName,
		joined_at:     stringToDate(userFields['Joined'], renderTime),
		last_visit_at: stringToDate(userFields['Last Visit'], renderTime),
		special:       undefined,
		avatar:        userAvatar,
		quote:         userQuote,
		location:      userFields['Location'],
		occupation:    userFields['Occupation'],
		interests:     userFields['Interests'],
		age:           userFields['Your Age'],
		games_played:  userFields['What Games do you play'],
		mirrored_at:   stringToDate(renderTime),
	}
	);
}

/**
 * Extracts the page render time from the given HTML. Halomaps uses a consistent
 * footer for this, so this should work for any rendered page.
 *
 * This is the date string with the timezone offset baked into it. We keep this
 * as a string to have an easier time resolving dates like "Today @ <time>".
 * Use {@link stringToDate} to get a {@link Date} object.
 *
 * @param {HTMLElement} htmlRoot
 */
function extractRenderTime(htmlRoot) {
	const tables = htmlRoot.querySelectorAll('table');
	tables.pop(); // Last table is "Halomaps" footer
	const timeTable = tables.pop(); // Second-to-last contains the render time.

	const match = RENDER_TIME_REGEX.exec(timeTable?.text);
	if (match) {
		return match[1];
	}

	// The above doesn't work with a select few pages, so we need a fallback.
	// (e.g. kirby_422's user page [id 728]).

	const endOfPageSnippet = htmlRoot.textContent.slice(-1000);
	const fallbackMatch = RENDER_TIME_REGEX.exec(endOfPageSnippet);
	if (fallbackMatch) {
		return fallbackMatch[1];
	}

	throw new Error('Failed to extract mirror time');
}

/**
 * Halomaps renders all dates in the same format. This converts the string to
 * an actual JavaScript Date object. Has special handling to process dates like
 * "Today @ <time>".
 *
 * A NOTE ON TIMEZONES:
 *
 * All dates rendered in the HTML are relative to the timezone of the server
 * that requested the HTML. This includes dates like "Today @ <time>".
 *
 * @param {string} date_str
 * @param {string} reference_date date string (usually from
 *   {@link extractRenderTime}) to resolve dates like "Today @ <time>".
 */
function stringToDate(date_str, reference_date) {
	if (date_str.startsWith('Today') || date_str.startsWith('Yesterday')) {
		if (!reference_date) {
			throw new Error(`No reference given to resolve date: ${date_str}`);
		}

		// Page mirror time with timezone baked in
		let datetime = stringToDateInner(reference_date);

		// Looks like "Yesterday @ 12:34 PM"
		const [day, time] = date_str.split(' @ ');

		if (day === 'Yesterday') {
			datetime = datetime.minus({ days: 1 });
		}

		// Parse the "12:34 PM" portion of the relative date.
		// Note: This is just a convenient way to get 24-hour time from an AM/PM
		// timestamp. This DateTime will also use the current day, but we ignore
		// that information.
		const offset = DateTime.fromFormat(time, 'h:mm a', {
			zone: MIRROR_TIMEZONE
		});

		datetime = datetime.set({
			hour: offset.hour,
			minute: offset.minute,
		});

		return datetime.toJSDate();
	} else {
		return stringToDateInner(date_str).toJSDate();
	}
}

/**
 * Common parse routine for actual dates. Parses to DateTime objects that are
 * aware of the baked-in timezone offset.
 *
 * Dates can come in a few formats, so find one that matches
 * (see {@link TIME_FORMATS}).
 *
 * @param {string} date_str
 */
function stringToDateInner(date_str) {
	for (fmt of TIME_FORMATS) {
		const dt = DateTime.fromFormat(date_str, fmt, { zone: MIRROR_TIMEZONE });
		if (dt.isValid) {
			return dt;
		}
	}
	throw new Error(`Cannot parse date: ${date_str}`);
}

module.exports = {
	load,
};
