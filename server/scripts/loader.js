const { readdir, readFile, stat } = require('fs').promises;
const { join, basename } = require('path');
const { JSDOM } = require('jsdom');
const { DateTime } = require('luxon');

const database = require('../database/mirror_insert');

// Need insensitive search since filenames in mirror mix cases.
const HOME_FILE_REGEX    = /index.cfm(?:\?|%3F|_)page=home$/i;
const HOMECAT_FILE_REGEX = /index.cfm(?:\?|%3F|_)page=home&categoryid=(\d+)/i;
const USER_FILE_REGEX    = /index.cfm(?:\?|%3F|_)page=userinfo&viewuserid=(\d+)/i;
const FORUM_FILE_REGEX   = /index.cfm(?:\?|%3F|_)page=forum&forumid=(\d+)(?:&start=(\d+))?/i;
const TOPIC_FILE_REGEX   = /index.cfm(?:\?|%3F|_)page=topic&topicid=(\d+)(?:&start=(\d+))?/i;

/** Allows us to apply and load mirror files in a specific order. */
const FILE_PROCESSORS = [
	[HOMECAT_FILE_REGEX, loadHomeCategoryFile],
	[HOME_FILE_REGEX,    loadHomeFile],
	[USER_FILE_REGEX,    loadUserFile],
	[FORUM_FILE_REGEX,   loadForumFile],
	[TOPIC_FILE_REGEX,   loadTopicFile],
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
const FORUM_ID_REGEX  = /forumid=(\d+)/i;
const POST_ID_REGEX   = /replyid=(\d+)/i;
const POST_TIME_REGEX = /Posted: ([\w,:@ ]+)/;

/**
 * Entry point for loading Halomaps files. Can handle a single file, or a
 * directory containing many files.
 *
 * @param {string} value path to a file or a directory.
 * @param {Object<string, any>} opts Optional loader options. Defaults:
 * ```
 * {
 *   print_json: false, // Output JSON instead of inserting into the database
 * }
 * ```
 */
async function load(value, opts) {
	const valueStats = await stat(value);
	if (valueStats.isFile()) {
		await loadFile(value, undefined, opts);
	} else if (valueStats.isDirectory()) {
		await loadDirectory(value, opts);
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
 * @param {Object<string, any>} opts See {@link load}.
 */
async function loadDirectory(directory, opts) {
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
			await loadFile(join(directory, file), pair, opts);
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
 * @param {Object<string, any>} opts See {@link load}.
 */
async function loadFile(filepath, pair, opts) {
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
	const document = new JSDOM(htmlContent).window.document;

	// Some pages in the mirror are empty stubs with just the common header.
	if (document.querySelector('body > table > tbody > tr:nth-child(2)')
		.textContent.trim().length === 0
	) {
		console.log('Skipping stub file');
		return;
	}

	const fileProcessor = pair[1];
	await fileProcessor(filepath, document, opts);
}

// The following is a series of jank CSS query selectors to scrape data from
// equally jank rendered HTML pages. It's more art than science.
// Rule of thumb -- Halomaps loves tables.

/**
 * Handles: index.cfm?page=home&categoryID=x
 *
 * Most information about Categories and Forums could be scraped from the main
 * home page, but critically, the home page is missing Category ID. Forums
 * belong to a Category, so the Category record needs to exist before we can
 * create the Forum record. Therefore, we process these sub-home pages first.
 *
 * Category sort order comes from {@link loadHomeFile}.
 *
 * @param {string} filepath
 * @param {Document} htmlRoot
 * @param {Object<string, any>} opts See {@link load}.
 */
async function loadHomeCategoryFile(filepath, htmlRoot, opts) {
	const categoryId = Number.parseInt(
		HOMECAT_FILE_REGEX.exec(basename(filepath))[1]
	);
	const renderTime = stringToDate(extractRenderTime(htmlRoot));

	// Second table contains Category / Forum info
	const forumRows = Array.from(htmlRoot
		.querySelector('table table:nth-child(2)')
		.querySelectorAll('tr')
	);
	forumRows.shift(); // Ignore constant header
	forumRows.shift(); // Ignore outer Category row
	const categoryRow = forumRows.shift();

	const categoryName = categoryRow.querySelector('b').textContent;

	const categoryData = {
		id:          categoryId,
		name:        categoryName,
		sort_index:  0, // loadHomeFile fills this in later
		mirrored_at: renderTime,
	};

	const forumsData = forumRows.map((forumRow, index) => {
		// The cell containing the Forum's name, description, and lock status
		const forumInfo = forumRow.querySelector('td:nth-child(2)');

		const forumLocked = !!forumInfo
			.querySelector('img')
			?.getAttribute('src')
			?.includes('icon_lock');

		const forumLink = forumInfo.querySelector('a');
		const forumName = forumLink.textContent;
		const forumId   = Number.parseInt(
			FORUM_ID_REGEX.exec(forumLink.getAttribute('href'))[1]
		);

		const forumDesc = forumInfo.querySelector('div.SMALL').textContent;

		return {
			id:          forumId,
			sort_index:  index,
			name:        forumName,
			locked:      forumLocked,
			description: forumDesc,
			category_id: categoryId,
			mirrored_at: renderTime,
		};
	});

	if (opts.print_json) {
		console.log('Category', categoryData);
		console.log('Forums', forumsData);
	} else {
		await database.addCategory(categoryData);
		await database.addForums(forumsData);
	}
}

/**
 * Handles: index.cfm?page=home
 *
 * Most of the work is already done by {@link loadHomeCategoryFile}. We just
 * extract Category sort order and forum stats here.
 *
 * @param {string} filepath unused
 * @param {Document} htmlRoot
 * @param {Object<string, any>} opts See {@link load}.
 */
async function loadHomeFile(filepath, htmlRoot, opts) {
	// Categories use a third layer of nested tables, so we need to be very
	// specific here.
	const tables = htmlRoot.querySelectorAll('body > table > tbody > tr > td > table');
	const forumTable = tables.item(1);
	const statsTable = tables.item(2);

	// We already have Categories from each Category page.
	// We just need the Category's sort order now.
	const categories = Array
		.from(forumTable.querySelectorAll('table'))
		.map((table, index) => ({
			sort_index: index,
			name:       table.textContent.trim().split('\n')[0],
		}));

	const STATS_REGEX = new RegExp([
		/(\d+) users have contributed to /,
		/(\d+) threads and (\d+) posts/,
		/.*/,
		/Most registered users online was (\d+) on ([\w:, ]+)/,
	].map(part => part.source).join(''), 'gs');
	const match = STATS_REGEX.exec(statsTable.textContent);

	const renderTimeStr = extractRenderTime(htmlRoot);
	const renderTime   = stringToDate(renderTimeStr);
	const mostUsersAt  = stringToDate(match.at(5), renderTimeStr);

	const statsData = [
		{ name: 'users',          value: match.at(1) },
		{ name: 'topics',         value: match.at(2) },
		{ name: 'posts',          value: match.at(3) },
		{ name: 'most_users_num', value: match.at(4) },
		{ name: 'most_users_at',  value: mostUsersAt },
	].map(row => ({ ...row, mirrored_at: renderTime }) );

	if (opts.print_json) {
		console.log('Category Sort Update', categories);
		console.log('Stats', statsData);
	} else {
		await database.updateCategorySorts(categories);
		await database.addStats(statsData);
	}
}

/**
 * Handles: index.cfm?page=userInfo&viewuserid=x
 *
 * All information for a User, other than their special field, can be extracted
 * from their individual userInfo page. Unless they don't have an avatar, then
 * they could have a quote that only renders on their posts.
 *
 * @param {string} filepath
 * @param {Document} htmlRoot
 * @param {Object<string, any>} opts See {@link load}.
 */
async function loadUserFile(filepath, htmlRoot, opts) {
	const userId = Number.parseInt(
		USER_FILE_REGEX.exec(basename(filepath))[1]
	);

	// TODO catch if we've already added this user (check by ID in database)

	const userTableRows = htmlRoot
		.querySelectorAll('table table')
		.item(2)
		.querySelectorAll('tr');
	const userNameRow  = userTableRows.item(0);
	const userInfoRows = Array.from(
		userTableRows.item(2).querySelector('td').querySelectorAll('tr')
	);

	const userName = userNameRow.textContent.trim().split(': ')[1];

	// From this point on, empty strings indicate the value wasn't actually
	// provided on the page, so treat those as null.

	// The avatar node contains both the user's image and quote.
	// If the user does not have an avatar, this node is not present at all,
	// EVEN IF they do have a quote.
	//
	// Get the avatar filename off of the image node. Remove the "avatars" root
	// so we can use our own solution to statically serve these files later.
	let userAvatar = null;
	let userQuote  = null;
	if (userInfoRows.at(-1).textContent.startsWith('Avatar')) {
		const avatarRow = userInfoRows.pop();

		userAvatar = avatarRow.querySelector('img')
			?.getAttribute('src')
			?.replace('avatars/', '')

		userQuote  = avatarRow.querySelector('td:nth-child(2)')
			.textContent.trim() || null;
	}

	const userFields = userInfoRows.reduce((fields, row) => {
		const cells = row.querySelectorAll('td');
		const fieldName  = cells.item(0).textContent.split(':')[0];
		const fieldValue = cells.item(1).textContent;
		fields[fieldName] = fieldValue || null;
		return fields;
	}, {});

	const renderTime = extractRenderTime(htmlRoot);

	const userData = {
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
	};

	if (opts.print_json) {
		console.log('User', userData);
	} else {
		await database.addUser(userData);
	}
}

/**
 * Handles:
 *   - index.cfm?page=forum&forumID=x
 *   - index.cfm?page=forum&forumID=x&start=y
 *
 * Gives us everything for a Topic except its created_at timestamp.
 * We derive created_at from the first post in {@link loadTopicFile}.
 *
 * @param {string} filepath
 * @param {Document} htmlRoot
 * @param {Object<string, any>} opts See {@link load}.
 */
async function loadForumFile(filepath, htmlRoot, opts) {
	const forumId = Number.parseInt(FORUM_FILE_REGEX.exec(filepath)[1]);
	const renderTime = stringToDate(extractRenderTime(htmlRoot));

	const topicTable = htmlRoot.querySelector('table table:nth-child(2)');

	// There's at least one invalid Forum page in the mirror (ID = 19).
	if (!topicTable) {
		console.log('Skipping stub forum', forumId);
		return;
	}

	const topicTableRows = Array.from(topicTable.querySelectorAll('tr'));
	topicTableRows.shift(); // Ignore header row
	topicTableRows.shift(); // Ignore moderator row

	const topics = [];
	for await (topicRow of topicTableRows) {
		const topicData = extractTopicInfoFromRow(topicRow);

		const authorName = topicData.authorName;
		delete topicData.authorName;
		const authorId   = await database.getUserIdByName(authorName);

		// Topics listed on a Forum page have a "Started By" field. This field
		// reflects the name of the Topic's author at the time the Topic was
		// created. If the User who created the Topic was deleted or renamed,
		// this lookup will fail.
		// We'll infer author from the first Post in the Topic later.
		if (!authorId) {
			console.warn(`No user found with name: ${authorName}`);
		}

		topics.push({
			...topicData,
			forum_id:    forumId,
			author_id:   authorId,
			author_name: authorName,
			created_at:  null, // We'll get this later from Posts.
			mirrored_at: renderTime,
		});
	}

	if (opts.print_json) {
		console.log('Topics', topics);
	} else {
		await database.addTopics(topics);
	}
}

/**
 * Extracts Topic info from a row of the Topic table on a Forum page.
 * Returns a partial Topic record, as well as the Topic author's name.
 *
 * @param {HTMLTableRowElement} topicRow
 */
function extractTopicInfoFromRow(topicRow) {
	// Every Topic row has an icon. If the Topic is locked, this icon is
	// different. Pinned Topics also have a little paper clip icon.
	const images = topicRow.querySelectorAll('img');
	const topicLocked = images.item(0).getAttribute('src').includes('locked');
	const topicPinned = !!images.item(1)?.getAttribute('src').includes('clip');

	// The first link in a row USUALLY contains both the Topic ID and name.
	// In the rare case a Topic was moved, the first link will be the link to
	// the Forum it was moved from, and the second has the ID and name.
	const rowLinks = topicRow.querySelectorAll('a');
	let topicLinkElem;
	let topicMovedFrom;
	if (FORUM_FILE_REGEX.test(rowLinks.item(0).getAttribute('href'))) {
		topicLinkElem  = rowLinks.item(1);
		topicMovedFrom = Number.parseInt(
			FORUM_FILE_REGEX.exec(rowLinks.item(0).getAttribute('href'))[1]
		);
	} else {
		topicLinkElem  = rowLinks.item(0);
		topicMovedFrom = null;
	}

	const topicName = topicLinkElem.textContent;
	const topicId   = Number.parseInt(
		TOPIC_FILE_REGEX.exec(topicLinkElem.getAttribute('href'))[1]
	);

	// span elements contain author name, total posts, and total views.
	const topicRowCells = topicRow.querySelectorAll('td');
	const authorName = topicRowCells.item(2).textContent;
	const topicViews = Number.parseInt(topicRowCells.item(4).textContent);

	return {
		id:         topicId,
		name:       topicName,
		views:      topicViews,
		pinned:     topicPinned,
		locked:     topicLocked,
		moved_from: topicMovedFrom,
		authorName: authorName, // Not a database column, but needed for lookup.
	}
}

/**
 * Handles:
 *   - index.cfm?page=topic&topicID=x
 *   - index.cfm?page=topic&topicID=x&start=y
 *
 * All posts for a Topic come from these pages.
 * The Topic's created_at time is derived from the first post in the Topic.
 * User quotes are rendered in Topics, even if they don't have an avatar image.
 * User special strings are also rendered in Topics.
 *
 * @param {string} filepath
 * @param {Document} htmlRoot
 * @param {Object<string, any>} opts See {@link load}.
 */
async function loadTopicFile(filepath, htmlRoot, opts) {
	const topicMatch = TOPIC_FILE_REGEX.exec(filepath);
	const topicId     = Number.parseInt(topicMatch[1]);
	const isFirstPage = !topicMatch[2] || topicMatch[2] === '1';

	const renderTimeStr = extractRenderTime(htmlRoot);
	const renderTime    = stringToDate(renderTimeStr);

	const postTable = Array.from(htmlRoot.querySelectorAll('table table'))
		.find(table => table.querySelector('#messagearea'));

	if (!postTable) {
		console.log('Skipping stub Topic', topicId);
		return;
	}

	const postRows = Array.from(postTable.querySelectorAll('tr'));
	postRows.shift(); // Ignore topic title row
	postRows.shift(); // Ignore moderator row
	postRows.pop();   // Ignore empty end row

	// Each Post is split across two sequential rows:
	// The first row has the User, Post created_at, and Post content.
	// The second row has the Post's ID.
	//
	// Also, since posts are the only sure place to get a User's special text
	// and quote, we'll grab those too.
	const posts = [];
	const users = [];
	let firstPost;
	for (let i = 0; i < postRows.length; i += 2) {
		const postInfo = extractPostInfoFromRows(postRows[i], postRows[i + 1]);

		const createdStr = postInfo.post.createdStr;
		delete postInfo.post.createdStr;
		postInfo.post.created_at = stringToDate(createdStr, renderTimeStr);

		// Derive Topic created_at timestamp from first Post of first page.
		// Consider the first Post's author to be the Topic author if we failed
		// the username lookup at the Forum stage (e.g. user was renamed).
		if (isFirstPage && i === 0) {
			firstPost = postInfo.post;
		}

		users.push(postInfo.user);
		posts.push({
			...postInfo.post,
			topic_id:    topicId,
			mirrored_at: renderTime,
		});
	}

	const topicUpdateData = {
		id:         topicId,
		author_id:  firstPost?.author_id,
		created_at: firstPost?.created_at,
	};

	if (opts.print_json) {
		console.log('Topic creation time update', topicUpdateData);
		console.log('User updates', users);
		console.log('Posts', posts);
	} else {
		await database.patchTopicWhereNull(topicUpdateData);
		// TODO only update user if the respective field is null
		await database.updateUsers(users);
		await database.addPosts(posts);
	}
}

/**
 * Extracts Post info from two subsequent rows of the Post table on a Topic page.
 * Also gets User quotes and possible special fields.
 *
 * @param {HTMLTableRowElement} postRow
 * @param {HTMLTableRowElement} idRow
 */
function extractPostInfoFromRows(postRow, idRow) {
	// Post rows have two cells -- the user info, and the post content.
	const userNode = postRow.querySelector('td');

	// First link contains link to author's User page, and thus, User's ID.
	const authorId = Number.parseInt(USER_FILE_REGEX.exec(
		userNode.querySelector('a').getAttribute('href')
	)[1]);

	// Avatar quote has a unique class "avatar" we can select on.
	const userQuote = userNode.querySelector('span.avatar')?.textContent || null;

	// User special info can be an image (Dennis' moderator badge) or a text
	// node (Maniac's "helpful user" label). There's not a great way to
	// select this, so just grab whatever comes after the User link that isn't
	// the User join date (if anything).
	const specialTextNode = userNode.childNodes.item(6);
	const specialImgNode  = userNode.childNodes.item(7);

	// Yes, this is kind of dumb, but it'll help catch other specials.
	let userSpecial = null;
	if (specialTextNode.textContent.trim().length > 0) {
		userSpecial = specialTextNode.textContent.trim();
	} else if (specialImgNode && specialImgNode.nodeName === 'IMG') {
		if (specialImgNode.getAttribute('src').includes('moderator')) {
			userSpecial = 'moderator';
		} else {
			throw new Error(
				`User had special image ${specialImgNode.getAttribute('src')}`
			);
		}
	}

	// Post time always appears first as a "strong" tag.
	const postCreatedStr = POST_TIME_REGEX.exec(
		postRow.querySelector('strong').textContent
	)[1];

	// Post content is easy. It appears in a div with a unique ID.
	// Posts are formatted using embedded HTML. Users could edit this HTML
	// directly when editing their post. There's not really any good way
	// to sanitize this without losing information, so just keep it.
	const postContent = postRow.querySelector('div#messagearea').innerHTML;

	// The button for replying to a post contains a link with the Post's ID.
	const replyLinkNode = idRow.querySelector('a');
	const postId = Number.parseInt(
		POST_ID_REGEX.exec(replyLinkNode.getAttribute('href'))[1]
	);

	return {
		user: {
			id:      authorId,
			quote:   userQuote,
			special: userSpecial,
		},
		post: {
			id:          postId,
			author_id:   authorId,
			content:     postContent,
			createdStr:  postCreatedStr, // Return as string we resolve later.
		}
	};
}

/**
 * Extracts the page render time from the given HTML. Halomaps uses a consistent
 * footer for this, so this should work for any rendered page.
 *
 * This is the date string with the timezone offset baked into it. We keep this
 * as a string to have an easier time resolving dates like "Today @ <time>".
 * Use {@link stringToDate} to get a {@link Date} object.
 *
 * @param {Document} htmlRoot
 */
function extractRenderTime(htmlRoot) {
	const tables = htmlRoot.querySelectorAll('table');
	const timeTable = tables.item(tables.length - 2);

	const match = RENDER_TIME_REGEX.exec(timeTable.textContent);
	if (match) {
		return match[1];
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
