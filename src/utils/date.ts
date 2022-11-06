export const MINUTES = 60_000;
export const HOURS = 60 * MINUTES;
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

/**
 * Compare two dates without hour
 */
export function dateDiff(first: Date, second: Date, unit: typeof DAYS | typeof HOURS) {
    return Math.floor((atZeroHour(second).getTime() - atZeroHour(first).getTime()) / unit);
}

/**
 * @returns the `date` at 0h, without the time.
 */
export function atZeroHour(date: Date): Date {
    // copy date parts of the timestamps, discarding the time parts.
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * @returns the `date` at 23h59:59.
 */
export function atMidnight(date: Date): Date {
    // copy date parts of the timestamps, discarding the time parts.
    return  new Date(atZeroHour(date).getTime() + DAYS - 1);
}

/** @returns a date formatted `yyyy-mm-ddThh:mm` compatible with `<input type="datetime-local" />` */
export function dateTimeLocal(date?: Date | string): string | undefined {
    // return date?.toISOString().substring(0,16);
    if (!date) {
        return undefined;
    }
    if (typeof date === 'string') {
        return date.substring(0,16);
    }

    // using local time zone
    const yyyy = date.toLocaleDateString(undefined, { year: "numeric" });
    const MM = date.toLocaleDateString(undefined, { month: "2-digit" });
    const dd = date.toLocaleDateString(undefined, { day: "2-digit" });
    const time = date.toLocaleTimeString('en-GB', { timeStyle:'short' }); // 20:45
    return `${yyyy}-${MM}-${dd}T${time}`;
}