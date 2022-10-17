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


export function* chunks<T>(arr: T[], n: number): Generator<T[], void> {
    for (let i = 0; i < arr.length; i += n) {
      yield arr.slice(i, i + n);
    }
}