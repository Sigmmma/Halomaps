const CATEGORIES = 'categories';
const FORUMS     = 'forums';
const POSTS      = 'posts';
const STATS      = 'stats';
const TOPICS     = 'topics';
const USERS      = 'users';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
	// The scraped archive already has IDs for all of these tables, so we just
	// use those IDs as our primary keys.

	// There is a "mirrored_at" field in each table. This value reflects the
	// time the data was scraped from the original Halomaps.

	await knex.schema.createTable(USERS, table => {
		table.integer  ('id'           ).primary();
		table.string   ('name'         ).notNullable();
		table.timestamp('joined_at'    ).notNullable();
		table.timestamp('last_visit_at').notNullable();
		table.string   ('special'      ).comment(
			'A header Dennis manually added to a select few users. ' +
			'Was not displayed in profiles.'
		);
		table.string   ('avatar'       ).comment(
			'References a statically served avatar image name.'
		);
		table.string   ('quote'        );
		table.string   ('location'     );
		table.string   ('occupation'   );
		table.string   ('interests'    );
		table.string   ('age'          );
		table.string   ('games_played' );
		table.timestamp('mirrored_at'  ).notNullable();

		// Omitted fields:
		// - email
		// - website
		//
		// No email. There was a user option to display emails, but it was no
		// longer being displayed at the time the site was mirrored, and thus
		// is effectively blank for everybody. Same for website.
		// If you really need a user's email, you may be able to search that
		// user's post text content for an email. (hint: use a regex).
	});

	await knex.schema.createTable(CATEGORIES, table => {
		table.integer  ('id'         ).primary();
		table.integer  ('sort_index' ).notNullable();
		table.string   ('name'       ).notNullable();
		table.timestamp('mirrored_at').notNullable();
	});

	await knex.schema.createTable(FORUMS, table => {
		table.integer  ('id'         ).primary();
		table.integer  ('sort_index' ).notNullable();
		table.string   ('name'       ).notNullable();
		table.boolean  ('locked'     ).defaultTo(false);
		table.string   ('description').notNullable();
		table.integer  ('category_id').notNullable().references('id').inTable(CATEGORIES);
		table.timestamp('mirrored_at').notNullable();
	});

	await knex.schema.createTable(STATS, table => {
		table.string   ('name'       ).primary();
		table.string   ('value'      ).notNullable();
		table.timestamp('mirrored_at').notNullable();
		table.comment(
			'These values are extracted from the stats rendered out on the ' +
			'forum home page. They ARE NOT derived from posts and users we ' +
			'scrape from the mirror, so they could be used to verify the ' +
			'completeness of the mirror and data extraction.'
		)
	});

	await knex.schema.createTable(TOPICS, table => {
		table.integer  ('id'         ).primary();
		table.string   ('name'       ).notNullable();
		table.integer  ('views'      ).notNullable();
		table.boolean  ('pinned'     ).defaultTo(false);
		table.boolean  ('locked'     ).defaultTo(false);
		table.integer  ('forum_id'   ).notNullable().references('id').inTable(FORUMS);
		table.integer  ('author_id'  ).notNullable().references('id').inTable(USERS);
		table.integer  ('moved_from' ).references('id').inTable(FORUMS);
		table.timestamp('created_at' ).notNullable();
		table.timestamp('mirrored_at').notNullable();
	});

	await knex.schema.createTable(POSTS, table => {
		table.integer  ('id'         ).primary();
		table.integer  ('author_id'  ).notNullable().references('id').inTable(USERS);
		table.integer  ('topic_id'   ).notNullable().references('id').inTable(TOPICS);
		table.timestamp('created_at' ).notNullable();
		table.text     ('content'    ).notNullable().comment(
			'Contains HTML tags adjusted to work with statically served CSS.'
		);
		table.timestamp('mirrored_at').notNullable();
	});
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
	await knex.schema.dropTable(POSTS);
	await knex.schema.dropTable(TOPICS);
	await knex.schema.dropTable(STATS);
	await knex.schema.dropTable(FORUMS);
	await knex.schema.dropTable(CATEGORIES);
	await knex.schema.dropTable(USERS);
};
