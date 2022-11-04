export const MINUTES = 60_000;
export const DAYS = 24 * 60 * MINUTES;

/**
 * Check if the string matches an ISO date like:
 * - `2022-10-30T05:58:27.867Z`
 * - `2022-10-30T05:58:27Z`
 * - `2022-10-30T05:58Z`
 * - `2022-10-30`
 */
const reISODate = /^\d\d\d\d-\d\d-\d\d(T[012]\d:[0123456]\d(:\d\d(\.\d+)?)?(Z|[-+]\d\d\d\d))?$/;

/** Reviver for `JSON.parse()` to convert ISO date string to Date */
export function reviver<T>(key: string, value: T): T {
    if (typeof value === 'string' && value.match(reISODate)) {
        return new Date(value) as unknown as T;
    }
    return value;
}
