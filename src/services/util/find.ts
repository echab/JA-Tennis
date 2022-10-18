// Find service

type StringKey<T> = Exclude<keyof T, symbol | number>;

interface IIndex {
    [key: string]: number;
    _length: number
}

const indexes = new WeakMap<Array<any>,Map<string,IIndex>>();

/**
 * Returns the index of an object in the array. Or -1 if not found.
*/
export function indexOf<T>(array: T[], member: StringKey<T>, value: any, error?: string): number {

    let i: number, a: T;

    if (value === null || value === undefined) {
        return -1;
    }

    let idx = indexes.get(array)?.get(member) ?? _reindex(array, member);

    if (!(value in idx) || idx._length !== array.length) {
        idx = _reindex(array, member);
        // a = (array as any)[member];
        // i = (a as any)[value];
        i = idx[value];
    } else {
        i = idx[value];
        a = array[i];
        if (a[member] !== value) {
            idx = _reindex(array, member);
            // a = (array as any)[member];
            // i = (a as any)[value];
            i = idx[value];
        }
    }

    if (error && i === undefined) {
        throw error;
    }

    return i !== undefined ? i : -1;
}

/**
 * Returns an object in the array by member. Or undefined if not found.
 */
export function by<T>(array: T[], member: StringKey<T>, value: any, error?: string): T | undefined {
    var i = indexOf(array, member, value, error);
    return array[i];
}

export function mapBy<T,K = number>(array: T[], member: StringKey<T>): Map<K,T> {
    return new Map(array.map((item) => [item[member] as unknown as K, item]));
}

export function byId<T extends {id: string}>(array: T[], value: any, error?: string): T | undefined {
    var i = indexOf(array, "id" as any, value, error);
    return array[i];
}

function _reindex<T>(array: T[], member: StringKey<T>): IIndex {

    const idx: IIndex = {
        _length: array.length
    };
    for (let i = 0; i < array.length; i++) {
        const a = array[i], j = a[member];
        if (j !== undefined) {
            if ((idx as any)[j] !== undefined) {
                throw new Error (`Duplicated index ${member}: ${j}`)
            }
            (idx as any)[j] = i;
        }
    }

    if (!indexes.has(array)) {
        indexes.set(array, new Map(Array.of([member, idx])));
    } else {
        indexes.get(array)?.set(member, idx);
    }

    return idx;
}
