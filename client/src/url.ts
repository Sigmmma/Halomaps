const URL_NORMALIZER = new RegExp(/\/{2,}/g);

/** Makes a client-side URL that takes the global root URL into account. */
export function clientUrl(url_part: string): string {
	return normalizeUrl(process.env.CLIENT_BASE_URL ?? '/', url_part);
}

/** Removes any repeated slashes in URLs. */
export function normalizeUrl(...parts: string[]): string {
	return parts.join('/').replaceAll(URL_NORMALIZER, '/');
}

// TODO we definitely want better functions for generating URLs.
// We shouldn't be repeating index.cfm over and over again in strings.
