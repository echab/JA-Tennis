export function isObject<T extends object>(obj: unknown): obj is T {
    return obj !== null
        && typeof obj === 'object'
        && !(obj instanceof Date)
}

/**
 * Determines if a value is a date.
 */
export function isDate(value: unknown): value is Date {
    return toString.call(value) === "[object Date]";
}

/**
 * Predicate returning true if obj is defined.
 *
 * To be used for functional programing with `Array.filter()`.
 */
export function defined<T extends {}>(obj: T | undefined): obj is T {
    return !!obj;
}

export function onlyDefined<T>(obj: T | undefined): T | undefined {
    if (obj && typeof obj === "object") {
        for (const [f, val] of Object.entries(obj)) {
            const v = onlyDefined(val);
            if (v === null || v === undefined) {
                delete (obj as any)[f]; // eslint-disable-line typescript/no-explicit-any
            }
        }
    }
    return obj;
}

export function replacerPrivateField<T>(key: string, value: T): T | undefined {
    if (key.startsWith('_')) {
        return undefined;
    }
    return value;
}

/**
 * Copy recursively changed fields from source to target.
 */
export function applyChanges<T extends object, K extends keyof T>(target: T, source: T): void {
    if (Array.isArray(source) && Array.isArray(target)) {
        source.forEach((v, i) => {
            if (target[i] !== source[i]) {
                if (isObject(source[i])) {
                    applyChanges(target[i], source[i]);
                } else {
                    target[i] = source[i];
                }
            }
        });
        // cleanup removed items
        if (target.length > source.length) {
            target.splice(source.length);
        }
    } else if (isObject(source) && isObject(target)) {
        for (const [key, value] of Object.entries(source) as ([K, T[K]][])) {
            if (target[key] !== value) {
                if (target[key] !== null && isObject(value) && typeof target[key] === 'object') {
                    applyChanges(target[key], value);
                } else {
                    target[key] = value;
                }
            }
        }
        // cleanup removed fields 
        const sourceKeys = new Set(Object.keys(source) as K[]);
        const targetKeys = Object.keys(target) as K[];
        if (sourceKeys.size !== targetKeys.length) {
            for (const k of targetKeys) {
                if (!sourceKeys.has(k)) {
                    delete target[k];
                }
            }
        }
    }
}

/**
 * Copy recursively changed fields from source to the target item at position i
 */
export function applyChangesAt<T extends object>(target: T[], i: number, source: T | undefined): void {
    if (source) {
        if (target[i]) {
            applyChanges(target[i], source);
        } else {
            if (i < 0) {
                target.push(source);
            } else {
                target[i] = source;
            }
        }
    } else {
        if (i < 0) {
            target.pop();
        } else {
            target.splice(i, 1);
        }
    }
}