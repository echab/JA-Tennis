import type { SerialReader } from "./serialReader";
import type { SerialWriter } from "./serialWriter";

//#region Types

type Type = keyof Omit<SerialReader, `${"_" | "read"}${string}` | "writing" | typeof Symbol.dispose | typeof Symbol.asyncDispose>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type _any = any;

export type FieldParent<T extends Record<string, _any> = _any> = T & { version?: number };

export type FnTypeReader<T> = (
    this: SerialReader,
    value: _any, // for this.writing only
    fields?: Field<T>,
    parent?: FieldParent,
    name?: string
) => T | Promise<T>;
export type FnTypeWriter<T> = (
    this: SerialWriter,
    value: _any, // for this.writing only
    fields?: Field<T>,
    parent?: FieldParent,
    name?: string
) => T | Promise<T>;
export type FnType<T> = FnTypeReader<T> & FnTypeWriter<T>;

export type Field<T> = {
    version?: number,
    maxVersion?: number,
    type: Type | FnType<T> | Fields<_any>,
    def?: _any,
    predicate?: (this: SerialReader | SerialWriter, parent: FieldParent) => boolean | number,
    reviver?: (this: SerialReader, v: _any, parent: FieldParent) => T | Promise<T>,
    replacer?: (this: SerialWriter, v: T | undefined, parent: FieldParent) => _any,
    valid?: (this: SerialReader, v: _any, parent?: FieldParent) => boolean,
    itemType?: Type | FnType<_any> | Fields<_any> // TODO no any
};

export type Fields<T extends { version?: number }> = { [P in keyof T]: Field<T[P]> } & { [Q: `_${string}`]: Field<_any> };
//#endregion Types
