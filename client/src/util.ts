import { HasID } from '../../server/database/types';

/**
 * Reduces an array of items with IDs (e.g. rows from the database)
 * into a map of ID -> item.
 */
export function idMap<T extends HasID>(items: T[]): Map<number, T> {
	return items.reduce(
		(map, item) => map.set(item.id, item),
		new Map<number, T>(),
	);
}
