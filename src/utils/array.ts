type VoidCallback<T> = (item: T, index: number, array: T[]) => void
type ItemCallback<T, U> = (item: T, index: number, array: T[]) => U
/**
 * Runs the specified callback for each item in the array,
 * and returns the results in a new array.
 * @export
 * @template T
 * @template U
 * @param {Array<T>} array
 * @param {ItemCallback<T, U>} cb
 * @returns {U[]}
 */
export function map<T, U>(array: Array<T>, cb: ItemCallback<T, U>): U[] {
    let idx = -1;
    const length = array.length;
    const newArray: U[] = Array(length);
    for (; ++idx < length;) {
        newArray[idx] = cb(array[idx], idx, array);
    }
    return newArray;
}

/**
 * Runs the first specified callback for each item in the array,
 * and uses the second predicate callback to filter the results.
 * Returns the results in a new array.
 *
 * @export
 * @template T
 * @template U
 * @param {Array<T>} array
 * @param {ItemCallback<T, U>} cb
 * @param {(item: Partial<T>) => boolean} predicate
 * @returns {T[]}
 */
export function mapFilter<T, U>(
    array: Array<T>,
    cb: ItemCallback<T, U>,
    predicate: (item: U) => item is U,
): T[] {
    const length = array.length;
    const result: Partial<U>[] = [];
    for (let idx = 0; idx < length; idx++) {
        let res: U | null = cb(array[idx], idx, array);
        if (predicate(res)) {
            result[idx] = res;
        }
        res = null
    }
    return result as T[];
}

/**
 * Runs the first specified callback for each item in the array,
 * and uses the second predicate callback to filter the results.
 * Returns the results in a new array.
 *
 * @export
 * @template T
 * @template U
 * @param {Array<T>} array
 * @param {ItemCallback<T, U>} cb
 * @param {(item: Partial<T>) => boolean} predicate
 * @returns {T[]}
 */
export function filterMap<T, U>(
    array: Array<T>,
    predicate: (item: T) => unknown,
    cb: ItemCallback<T, U>,
): U[]
export function filterMap<T, U>(
    array: Array<T>,
    predicate: (item: T) => item is T,
    cb: ItemCallback<T, U>,
): U[]
export function filterMap<T, U>(
    array: Array<T>,
    predicate: (item: T) => unknown,
    cb: ItemCallback<T, U>,
): U[] {

    const length = array.length;
    const result: U[] = [];
    let count = -1, idx = 0;
    while (++count < length) {
        if (predicate(array[count])) {
            const res = cb(array[count], count, array);
            result[idx++] = res;
        }
    }
    return result;
}

/**
 * Filters an array into `[Truthy[], Falsey[]]` based on the specified predicate callback.
 *
 * Items that are truthy will be returned on the left side of the tuple.
 * Otherwise, falsey items will be on the right side of the tuple.
 *
 * ```ts
 * const myArray = [{ id: 1, synced: true }, { id: 2, synced: false }, { id: 3, synced: false }];
 *
 * const [ synced, notSynced ] = filterTF(myArray, (item) => item.synced);
 * // Logs:
 * // synced = [{ id: 1, synced: true }]
 * // notSynced = [{ id: 2, synced: false }, {id: 3, synced: false }]
 * console.log(synced, notSynced);
 * ```
 * @export
 * @template T
 * @param {T[]} array
 * @param {(item: T) => item is T} predicate
 * @return {*}  {[Truthy[], Falsey[]]}
 */
export function filterTF<T>(array: T[], predicate: (item: T) => unknown): [T[], T[]];
export function filterTF<T>(array: T[], predicate: (item: T) => item is T): [T[], T[]];
export function filterTF<T>(array: T[], predicate: (item: T) => unknown): [T[], T[]] {
    const truthyItems = [];
    const falseyItems = [];
    let position = -1,
        tIdx = 0,
        fIdx = 0;
    while (++position < array.length){
        const item = array[position];
        if (predicate(item)) {
            truthyItems[tIdx++] = item;
            continue;
        }
        falseyItems[fIdx++] = item;
    }

    return [truthyItems, falseyItems]
}

/**
 * Iterates over an array, running the specified `callback` for each entry.
 *
 * @export
 * @template T
 * @param {T[]} arr
 * @param {VoidCallback<T>} callback
 */
export function forEach<T>(arr: T[], callback: VoidCallback<T>): void {
    // eslint-disable-next-line prefer-const
    let idx = -1, length = arr.length;
    while (++idx < length) {
        callback(arr[idx], idx, arr);
    }
}

/**
 * Splits an array of `T` into chunks of `len` length, returning a new array of `T[]`.
 *
 * Does not mutate the original array.
 *
 * @example
 * ```ts
 * const items = [0, 1, 2, 3, 4, 5]
 *
 * const chunkedItems = chunk(items, 2)
 *
 * // Logs `[[0, 1], [2, 3], [4, 5]]
 * console.log(chunkedItems)
 * ```
 *
 * @export
 * @template T
 * @param {T[]} arr
 * @param {number} [len=0]
 * @return {*}  {T[][]}
 */
export function chunks<T>(arr: T[], len = 0): T[][] {
    const chunks: T[][] = [],
        n = arr.length;
    let i = 0;

    while (i < n) {
      chunks.push(arr.slice(i, i += len));
    }

    return chunks;
  }