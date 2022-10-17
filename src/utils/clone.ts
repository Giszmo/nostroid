/* eslint-disable prefer-spread */
/* eslint-disable @typescript-eslint/ban-types */

type IndexableObject<T> = {
	[PropertyKey in keyof T]: T[PropertyKey];
};

/**
 * Recursively clones all properties from `source` onto a new object.
 *
 * @export
 * @template Source
 * @param {Source} source
 * @returns {IndexableObject<Source>}
 */
export function deepCloneObj<Source extends Record<string, any> = Record<string, any>>(
	source: Source,
): IndexableObject<Source> {
	if (typeof source !== "object") throw new Error("Provided parameter 'source' is not a valid object.");
    const obj: IndexableObject<Record<string, unknown>> = {}
	let keys: Array<string> | null = Object.keys(source);
	const length = keys.length;
	let idx = -1;
	for (; ++idx < length; ) {
		const key = keys[idx];
		if (Array.isArray(source[key])) {
            obj[key] = [];
			;(obj[key] as unknown[]).push(...(source[key] as unknown[]));
		} else if (typeof source[key] === "object" && key in source) {
			obj[key] = deepCloneObj(source[key] as Record<string, unknown>);
		} else {
			obj[key] = source[key];
		}
	}
    keys = null
	return obj as IndexableObject<Source>;
}