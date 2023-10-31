import { HasID } from '../database/types';

/**
 * Reduces an array of items with IDs (e.g. rows from the database)
 * into a map of ID -> item.
 */
export function mapById<T extends HasID>(items: T[]): Map<number, T> {
	return items.reduce(
		(map, item) => map.set(item.id, item),
		new Map<number, T>(),
	);
}

/**
 * Returns a copy of {@link items} with the element at {@link index} removed.
 */
export function copyRemoveAt<T>(items: T[], index: number): T[] {
	return [
		...items.slice(0, index) ?? [],
		...items.slice(index + 1) ?? [],
	];
}
