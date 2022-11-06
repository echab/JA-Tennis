/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * @ngdoc function
 * @name angular.isObject
 * @module ng
 * @kind function
 *
 * @description
 * Determines if a reference is an `Object`. Unlike `typeof` in JavaScript, `null`s are not
 * considered to be objects. Note that JavaScript arrays are objects.
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is an `Object` but not `null`.
 * @deprecated
 */
export function isObject(value: any): value is Record<string, unknown> {
    // http://jsperf.com/isobject4
    return value !== null && typeof value === "object";
}

/**
 * @ngdoc function
 * @name angular.isDate
 * @module ng
 * @kind function
 *
 * @description
 * Determines if a value is a date.
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is a `Date`.
 */
export function isDate(value: any): value is Date {
    return toString.call(value) === "[object Date]";
}

/**
 * For annotation of overridden methods
 */
export function override(container: any, key: string) {
    const baseType = Object.getPrototypeOf(container);
    if (typeof baseType[key] !== "function") {
        throw new Error(
            "Method " + key + " of " + container.constructor.name +
        " does not override any base class method",
        );
    }
}

/**
 * Predicate returning true if obj is defined.
 *
 * To be used for functional programing with `Array.filter()`.
 */
export function defined<T extends {}>(obj: T | undefined): obj is T {
    return !!obj;
}

/**
 * Clone an object.
 *
 * To be used for functional programing with `Array.map()`.
 */
export function clone<T>(obj: T): T {
    return { ...obj };
}

export function onlyDefined<T extends {}>(obj: T): T | undefined {
    if (obj && typeof obj === "object") {
        Object.entries(obj).forEach(([f,v]) => {
            v = onlyDefined(v as any);
            if (v === null || v === undefined) {
                delete (obj as any)[f];
            }
        });
    }
    return obj;
}