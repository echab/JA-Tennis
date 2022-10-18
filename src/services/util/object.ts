const slice = [].slice;

export function extend(dst: any, src?: any) {
  return baseExtend(dst, slice.call(arguments, 1), false);
}

function baseExtend(dst: any, objs: any[], deep: boolean) {
  for (let i = 0, ii = objs.length; i < ii; ++i) {
    const obj = objs[i];
    if (!isObject(obj) && !isFunction(obj)) continue;
    const keys = Object.keys(obj);
    for (let j = 0, jj = keys.length; j < jj; j++) {
      const key = keys[j];
      const src = obj[key];

      if (deep && isObject(src)) {
        if (isDate(src)) {
          dst[key] = new Date(src.valueOf());
        } else {
          if (!isObject(dst[key])) dst[key] = isArray(src) ? [] : {};
          baseExtend(dst[key], [src], true);
        }
      } else {
        dst[key] = src;
      }
    }
  }

  return dst;
}

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
 */
export function isObject(value: any): value is Object {
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
 * @ngdoc function
 * @name angular.isArray
 * @module ng
 * @kind function
 *
 * @description
 * Determines if a reference is an `Array`.
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is an `Array`.
 */
export const isArray = Array.isArray;

/**
 * @ngdoc function
 * @name angular.isFunction
 * @module ng
 * @kind function
 *
 * @description
 * Determines if a reference is a `Function`.
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is a `Function`.
 */
function isFunction(value: any): value is Function {
  return typeof value === "function";
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
