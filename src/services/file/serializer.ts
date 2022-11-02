/* eslint-disable no-bitwise */
const decoder = new TextDecoder("iso-8859-1");
// const decoder = new TextDecoder("windows-1252");

const encoder = new TextEncoder(); // "iso-8859-1"

export type Serializer = ReturnType<typeof createSerializer>;

export type Type = keyof Omit<Serializer, `${"_"|"read"|"write"}${string}`|"seek">

export type FieldParent = { version?: number, [k: string]: any };

export type FnType<T> = (
    this: Serializer,
    writing: boolean,
    value: any, // for writing only
    fields?: Field<T>,
    parent?: FieldParent,
    name?: string
) => T;

export type Field<T> = {
    version?: number,
    maxVersion?: number,
    type: Type | FnType<T> | Fields<T>,
    def?: any,
    predicate?: (this: Serializer, parent: any) => boolean | number,
    reviver?: (this: Serializer, v: any, parent?: any) => T,
    replacer?: (this: Serializer, v: any, parent?: any) => T,
    valid?: (this: Serializer, v: any, parent?: any) => boolean,
    itemType?: Type | FnType<any> | Fields<any> // TODO no any
};

export type Fields<T> = {[P in keyof T]: Field<T[P]> } | { [Q: `_${string}`] : Field<any> };

const wBigObjectTag = 0x7fff;
const wClassTag = 0x8000;
const wNewClassTag = 0xffff;
const dwBigClassTag = 0x80000000;

export const createSerializer = (buffer: Uint8Array, position = 0) => ({
    _position: position,
    _buffer: buffer,
    _view: new DataView(buffer.buffer),
    _classNames: [] as string[],
    _nMapCount: 1,
    readBytes(n: number) {
        const r = this._buffer.slice(this._position, this._position + n);
        this._position += n;
        return r;
    },
    writeBytes(bytes: Uint8Array) {
        this._buffer.set(bytes, this._position);
        this._position += bytes.byteLength;
    },
    readType<T>(type: string | FnType<T> | Fields<T>, field: Field<T>, parent: any, name?: string) {
        if (typeof type === 'string') {
            // @ts-expect-error
            let r = this[type];
            if (type === 'array' || type ==='arrayb') {
                r = this.readArrayItems(r, field, parent, name);
            }
            return r;
        } else if (typeof type === "function") {
            return type.call(this, false, undefined, field, parent, name); // FnType
        } else {
            return this.readObject(type, parent.version, name);
        }
    },
    writeType<T>(value: any, type: string | FnType<T> | Fields<T>, field: Field<T>, parent: any, name?: string) {
        if (typeof type === 'string') {
            if (type === 'array' || type ==='arrayb') {
                this[type] = value.length;
                this.writeArrayItems(value, field, parent, name);
            } else {
                // @ts-expect-error
                this[type] = value;
            }
        } else if (typeof type === "function") {
            type.call(this, true, value, field, parent, name); // FnType
        } else {
            this.writeObject(value, type, parent.version, name);
        }
    },
    readField<T>(field: Field<T>, parent: FieldParent, name: string): T | undefined {
        const { version, maxVersion, predicate, type, def, valid, reviver } = field;
        if ((maxVersion || version) && !parent.version) {
            throw new Error(`Missing parent.version for ${name}`);
        }
        if ((!maxVersion || (parent.version ?? 0) <= maxVersion)
            && (!predicate || predicate.call(this, parent))) {
            let r: any;
            if (!version || version <= (parent.version ?? 99)) {
                r = this.readType(type, field, parent, name);
            } else {
                r = typeof def === 'function' ? def() : def;
            }
            if (typeof valid === 'function') {
                if (!valid.call(this, r, parent)) {
                    throw new Error(`Invalid value for field "${name}": ${r}`)
                }
            }
            if (typeof reviver === 'function') {
                r = reviver.call(this, r, parent);
            }
            return r;
        }
    },
    writeField<T>(value: T | undefined, field: Field<T>, parent: FieldParent, name: string) {
        const { version, maxVersion, predicate, type, def, replacer } = field;
        if ((maxVersion || version) && !parent.version) {
            throw new Error(`Missing parent.version for ${name}`);
        }
        if ((!maxVersion || (parent.version ?? 0) <= maxVersion)
            && (!predicate || predicate.call(this, parent))) {
            if (typeof replacer === 'function') {
                value = replacer.call(this, value, parent);
            }
            if (!version || version <= (parent.version ?? 99)) {
                this.writeType(value, type, field, parent, name);
            }
        }
    },
    readObject<T>(fields: Fields<T>, parentVersion: number, name?: string): T {
        const result = { version: parentVersion }; // by default, inherit version from parent
        for (const [name, field] of Object.entries(fields)) {
            const r = this.readField(field, result, name);
            if (name === '_return') {
                return r as T;
            }
            if (typeof r !== 'undefined' && !name.startsWith('_')) {
                (result as any)[name] = r;
            }
        }
        return result as unknown as T;
    },
    writeObject<T>(value: T, fields: Fields<T>, parentVersion: number, name?: string) {
        const result = { version: parentVersion }; // by default, inherit version from parent
        for (const [name, field] of Object.entries(fields)) {
            // TODO _return or _*
            // @ts-expect-error
            const v = !name.startsWith('_') ? value[name] : undefined;
            this.writeField(v, field, result, name);
        }
        return result as unknown as T;
    },

    readArrayItems<T>(n: number, field: Field<T>, doc?: FieldParent, name?: string): T[] {
        const { itemType } = field;
        if (!itemType) { throw new Error("undefined field or itemType"); }
        return Array(n).fill(0).map(() => this.readType(itemType, field, doc, name));
    },
    writeArrayItems<T>(items: any[], field: Field<T>, doc?: FieldParent, name?: string) {
        const { itemType } = field;
        if (!itemType) { throw new Error("undefined field or itemType"); }
        items.forEach((item) => this.writeType(item, itemType, field, doc, name));
    },

    get byte() {
        // return this.reading ? this.read(1)[0] : this.write(b);
        return this.readBytes(1)[0];
    },
    set byte(b) {
        this._buffer[this._position++] = b;
    },

    get char() {
        return decoder.decode(this.readBytes(1));
    },
    set char(c) {
        this.byte = c.charCodeAt(0);
    },

    get word() {
        const [a, b] = this.readBytes(2);
        return a + (b << 8);
    },
    set word(w) {
        this.byte = w & 0xFF
        this.byte =(w >> 8) & 0xFF;
    },

    get i16() {
        const r = this._view.getInt16(this._position, true);
        this._position += 2;
        return r;
    },
    set i16(i) {
        this._view.setInt16(this._position, i, true);
        this._position += 2;
    },

    get dword() {
        const [a, b, c, d] = this.readBytes(4);
        return a + (b << 8) + (c << 16) + (d << 24);
    },
    set dword(dw) {
        this._view.setUint32(this._position, dw, true);
        this._position += 4;
    },

    get float() {
        const r = this._view.getFloat32(this._position, true);
        this._position += 4;
        return r;
    },
    set float(f) {
        this._view.setFloat32(this._position, f, true);
        this._position += 4;
    },

    get date() {
        const [a, b, c, d] = this.readBytes(4);
        // format: { day:5, month: 4, f1: 7, year: 15, f2:1 } { second: 5, minute: 6, hour: 5 }
        // d=.yyyyyyy c=yyyyyyyy b=.......m a=mmmddddd

        // _dos_getftime()
        // yyyyyyym mmmddddd hhhhhmmm mmmsssss > y + 1980; s/2
        // dos_date = year * 512 + month * 32 + day
        // dos_time = hour * 2048 + minute * 32 + second / 2

        const day = a & 0x1f;
        const month = (a >> 5) | ((b & 1) << 3);
        const year = c | ((d & 0x7f) << 8);

        if (day === 0 && month === 0) {
            if (year === 0) {
                return undefined;
            }
            return year.toString();
        }
        // validate date
        const result = new Date(year, month - 1, day, 12, 0, 0, 0);
        if (!(1 <= day && day <= 31
            && 1 <= month && month <= 12
            && 1900 <= year && year <= 2060
            && day === result.getDate())) {
            throw new Error(`Invalid date: ${day}/${month}/${year}`);
        }
        return result;
    },
    set date(d) {
        // TODO
        this.byte = 0;
        this.byte = 0;
        this.byte = 0;
        this.byte = 0;
    },

    get bstr() {
        const n = this.byte;
        return decoder.decode(this.readBytes(n));
    },
    set bstr(s) {
        // const buf = encoder.encode(s); // UTF-8
        const buf = new Uint8Array([...s ?? ''].map((c)=> c.charCodeAt(0)));
        this.byte = buf.length;
        this.writeBytes(buf);
    },

    get array() {
        return this.word; // get the array size, the items are read into readType()
    },
    set array(n) {
        this.word = n;
    },
    get arrayb() {
        return this.byte; // get the array size, the items are read into readType()
    },
    set arrayb(n) {
        this.byte = n;
    },

    get generateId() {
        return generateId();
    },
    set generateId(id) {},

    get customData() { return; },
    set customData(d) {},

    get schema() {
        // https://learn.microsoft.com/en-us/cpp/mfc/tn002-persistent-object-data-format?view=msvc-170
        // https://www.codeproject.com/Articles/1176939/All-About-MFC-Serialization
        // atlmfc/src/mfc/arcobj.cpp

        const wTag = this.word;
        let obTag;
        if (wTag === wBigObjectTag) {
            obTag = this.dword;
        } else {
            obTag = ((wTag & wClassTag) << 16) | (wTag & ~wClassTag);
        }
        if (wTag === wNewClassTag) {
            this.word; // pid === 1
            const className = decoder.decode(this.readBytes(this.word));
            this._classNames[this._nMapCount] = className;
            this._nMapCount += 2; // class + instance
            return className;
        } else {
            const nClassIndex = obTag & ~dwBigClassTag;
            if (nClassIndex === 0) {
                throw new Error(`invalid class index ${nClassIndex}`);
            }
            const className = this._classNames[nClassIndex];
            this._nMapCount += 1;
            return className;
        }
    },
    set schema(className) {
        const nClassIndex = this._classNames.indexOf(className);
        if (nClassIndex === -1) {
            const wTag = wNewClassTag;
            this.word = wTag;
            this.word = 1; // pid;
            this.writeBytes(encoder.encode(className));
            this._classNames[this._nMapCount] = className;
            this._nMapCount += 2; // class + instance
        } else {
            const obTag = nClassIndex;
            const wTag = ((obTag >> 16) & wClassTag) | (obTag & ~wClassTag);
            this.word = wTag;
            this._nMapCount += 1;
        }
    }
});

export function generateId() {
    return String((Math.random() * 0xffff) & 0xffff);
}
