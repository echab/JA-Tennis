/* eslint-disable no-bitwise */
const decoder = new TextDecoder("iso-8859-1");
// const decoder = new TextDecoder("windows-1252");
const decoderUnicode = new TextDecoder("utf-16");

const encoder = new TextEncoder(); // "utf-8" not "iso-8859-1"

//#region Types
export type SerialReader = ReturnType<typeof createReader>;
export type SerialWriter = ReturnType<typeof createWriter>;

type Type = keyof Omit<SerialReader, `${"_" | "read"}${string}` | "writing">;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type _any = any;

export type FieldParent<T extends Record<string, _any> = _any> = T & { version?: number };

type FnTypeReader<T> = (
    this: SerialReader,
    value: _any, // for this.writing only
    fields?: Field<T>,
    parent?: FieldParent,
    name?: string
) => T;
type FnTypeWriter<T> = (
    this: SerialWriter,
    value: _any, // for this.writing only
    fields?: Field<T>,
    parent?: FieldParent,
    name?: string
) => T;
export type FnType<T> = FnTypeReader<T> & FnTypeWriter<T>;

type Field<T> = {
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

const wBigObjectTag = 0x7fff;
const wClassTag = 0x8000;
const wNewClassTag = 0xffff;
// const dwBigClassTag = 0x80000000;

export const createReader = (buffer: Uint8Array<ArrayBuffer>, fileDate?: Date, position = 0) => ({
    writing: false as const,
    _position: position,
    _buffer: buffer,
    _arrayIndex: NaN,
    _view: new DataView(buffer.buffer),
    _classNames: [] as string[],
    _nMapCount: 1,
    _fileDate: fileDate,
    readBytes(n: number) {
        const r = this._buffer.slice(this._position, this._position + n);
        this._position += n;
        console.assert(this._position < this._buffer.byteOffset + this._buffer.byteLength);
        return r;
    },
    async readType<T>(
        type: string | FnTypeReader<T> | Fields<_any>,
        field: Field<T>,
        parent: FieldParent,
        name?: string
    ): Promise<T> {
        if (typeof type === 'string') {
            let r = (this as _any)[type];
            if (type === 'array' || type === 'arrayb') {
                r = await this.readArrayItems(r, field, parent, name);
            }
            return r;
        } else if (typeof type === "function") {
            return type.call(this, undefined, field, parent, name); // FnType
        } else {
            return this.readObject(type, parent?.version);
        }
    },
    async readField<T>(
        field: Field<T>,
        parent: FieldParent,
        name: string
    ): Promise<T | undefined> {
        const pos = this._position;
        const { version, maxVersion, predicate, type, def, valid, reviver } = field;
        if ((maxVersion || version) && !parent.version) {
            throw new Error(`Missing parent.version for ${name} at 0x${pos.toString(16)}`);
        }
        if ((!maxVersion || (parent.version ?? 0) <= maxVersion)
            && (!predicate || predicate.call(this, parent))) {
            let r: T;
            if (!version || version <= (parent.version ?? 99)) {
                r = await this.readType(type, field, parent, name);
            } else {
                r = typeof def === 'function' ? def() : def;
            }
            if (typeof valid === 'function') {
                if (!valid.call(this, r, parent)) {
                    throw new Error(`Invalid value for field "${name}": ${r} at 0x${pos.toString(16)}`)
                }
            }
            if (typeof reviver === 'function') {
                r = await reviver.call(this, r, parent);
            }
            return r;
        }
    },
    async readObject<T extends { version?: number }>(
        fields: Fields<T>,
        parentVersion = NaN
    ): Promise<T> {
        const result = { version: parentVersion }; // by default, inherit version from parent
        for (const [fieldName, field] of Object.entries(fields)) {
            const r = await this.readField(field, result, fieldName);
            if (r !== undefined && !fieldName.startsWith('_')) {
                (result as _any)[fieldName] = r;
            }
        }
        return result as unknown as T;
    },

    async readArrayItems<T>(
        n: number,
        field: Field<T>,
        parent: FieldParent,
        name?: string
    ): Promise<T[]> {
        const { itemType } = field;
        if (!itemType) { throw new Error(`undefined field or itemType at 0x${this._position.toString(16)}`); }
        const prev = this._arrayIndex;
        const result = Array(n).fill(0);
        for (let i = 0; i < n; i++) {
            this._arrayIndex = i;
            result[i] = await this.readType(itemType, field, parent, name);
        };
        this._arrayIndex = prev;
        return result;
    },

    get u8() {
        // return this.reading ? this.read(1)[0] : this.write(b);
        return this.readBytes(1)[0];
    },

    get char() {
        return decoder.decode(this.readBytes(1));
    },

    get u16() {
        const [a, b] = this.readBytes(2);
        return a + (b << 8);
    },

    get i8() {
        const r = this._view.getInt8(this._position);
        this._position += 1;
        console.assert(this._position < this._buffer.byteOffset + this._buffer.byteLength);
        return r;
    },

    get i16() {
        const r = this._view.getInt16(this._position, true);
        this._position += 2;
        console.assert(this._position < this._buffer.byteOffset + this._buffer.byteLength);
        return r;
    },

    get u32() {
        const [a, b, c, d] = this.readBytes(4);
        return a + (b << 8) + (c << 16) + (d << 24);
    },

    get f32() {
        const r = this._view.getFloat32(this._position, true);
        this._position += 4;
        console.assert(this._position < this._buffer.byteOffset + this._buffer.byteLength);
        return r;
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
            return year;
        }
        // validate date
        const result = new Date(year, month - 1, day, 12, 0, 0, 0);
        if (!(1 <= day && day <= 31
            && 1 <= month && month <= 12
            && 1900 <= year && year <= 2060
            && day === result.getDate())) {
            throw new Error(`Invalid date: ${day}/${month}/${year} at 0x${(this._position - 4).toString(16)}`);
        }
        return result;
    },

    // https://github.com/Musashii-kun/winscp/blob/e0fcef1c1ea8074dbcf31ea61fa61150bb21eff9/libs/mfc/source/arccore.cpp#L155
    // CString serialization code
    // String format:
    //      UNICODE strings are always prefixed by 0xff, 0xfffe
    //      if < 0xff chars: len:BYTE, TCHAR chars
    //      if >= 0xff characters: 0xff, len:WORD, TCHAR chars
    //      if >= 0xfffe characters: 0xff, 0xffff, len:DWORD, TCHARs    
    get bstr() {
        let n = this.u8;
        if (n === 0xff) {
            n = this.u16;
            if (n === 0xffff) {
                n = this.u32;
            } else if (n === 0xfffe) {
                // unicode
                n = this.u8;
                if (n === 0xff) {
                    n = this.u16;
                    if (n === 0xffff) {
                        n = this.u32;
                    }
                }
                return decoderUnicode.decode(this.readBytes(n));
            }
        }
        return decoder.decode(this.readBytes(n));
    },

    get array() {
        return this.u16; // get the array size, the items are read into readType()
    },
    get arrayb() {
        return this.u8; // get the array size, the items are read into readType()
    },

    get customData() {
        return undefined;
    },

    get schema() {
        // https://learn.microsoft.com/en-us/cpp/mfc/tn002-persistent-object-data-format?view=msvc-170
        // https://www.codeproject.com/Articles/1176939/All-About-MFC-Serialization
        // atlmfc/src/mfc/arcobj.cpp

        const pos = this._position;
        const wTag = this.u16;
        let obTag;
        if (wTag === wBigObjectTag) {
            obTag = this.u32;
        } else {
            // obTag = ((wTag & wClassTag) << 16) | (wTag & ~wClassTag);
            obTag = wTag & wBigObjectTag;
        }
        if (wTag === wNewClassTag) {
            this.u16; // pid === 1
            const className = decoder.decode(this.readBytes(this.u16));
            this._classNames[this._nMapCount] = className;
            this._nMapCount += 2; // class + instance
            return className;
        } else {
            // const nClassIndex = obTag & ~dwBigClassTag;
            const nClassIndex = obTag;
            if (nClassIndex === 0 || !this._classNames[nClassIndex]) {
                throw new Error(`invalid class index ${nClassIndex} at 0x${pos.toString(16)}`);
            }
            const className = this._classNames[nClassIndex];
            this._nMapCount += 1;
            return className;
        }
    },
});

export const createWriter = (buffer: Uint8Array<ArrayBuffer>, fileDate?: Date, position = 0) => ({
    writing: true as const,
    _position: position,
    _buffer: buffer,
    _arrayIndex: NaN,
    _view: new DataView(buffer.buffer),
    _classNames: [] as string[],
    _nMapCount: 1,
    _fileDate: fileDate,
    writeBytes(bytes: Uint8Array<ArrayBuffer>) {
        this._buffer.set(bytes, this._position);
        this._position += bytes.byteLength;
    },
    writeType<T>(
        value: _any,
        type: string | FnTypeWriter<T> | Fields<_any>,
        field: Field<T>,
        parent: FieldParent,
        name?: string
    ) {
        if (typeof type === 'string') {
            if (type === 'array' || type === 'arrayb') {
                this[type] = value?.length ?? 0; // setter for the array length
                this.writeArrayItems(value, field, parent, name);
            } else {
                (this as _any)[type] = value; // setter
            }
        } else if (typeof type === "function") {
            type.call(this, value, field, parent, name); // FnType
        } else {
            this.writeObject(value, type, parent?.version);
        }
    },
    writeField<T>(
        value: T | undefined,
        field: Field<T>,
        parent: FieldParent,
        name: string
    ) {
        const { version, maxVersion, predicate, type, replacer } = field;
        if ((maxVersion || version) && !parent.version) {
            throw new Error(`Missing parent.version for ${name} at 0x${this._position.toString(16)}`);
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
    writeObject<T extends { version?: number }>(
        value: T | undefined,
        fields: Fields<T>,
        parentVersion?: number
    ) {
        const parent = { ...value, version: value?.version ?? parentVersion }; // by default, inherit version from parent
        for (const [fieldName, field] of Object.entries(fields)) {
            const v = !fieldName.startsWith('_') && value ? (value as _any)[fieldName] : undefined;
            this.writeField(v, field, parent, fieldName);
        }
    },

    writeArrayItems<T>(
        items: T[] | undefined,
        field: Field<T>,
        parent: FieldParent,
        name?: string
    ) {
        const { itemType } = field;
        if (!itemType) { throw new Error(`undefined array field or itemType at 0x${this._position.toString(16)}`); }
        const prev = this._arrayIndex;
        items?.forEach((item, i) => {
            this._arrayIndex = i;
            this.writeType(item, itemType, field, parent, name);
        });
        this._arrayIndex = prev;
    },

    set u8(b: number) {
        this._buffer[this._position++] = b;
    },

    set char(c: string) {
        this.u8 = c.charCodeAt(0);
    },

    set u16(w: number) {
        this.u8 = w & 0xFF
        this.u8 = (w >> 8) & 0xFF;
    },

    set i8(i: number) {
        this._view.setInt8(this._position, i ?? 0);
        this._position += 1;
    },

    set i16(i: number) {
        this._view.setInt16(this._position, i ?? 0, true);
        this._position += 2;
    },

    set u32(dw: number) {
        this._view.setUint32(this._position, dw ?? 0, true);
        this._position += 4;
    },

    set f32(f: number) {
        this._view.setFloat32(this._position, f ?? 0.0, true);
        this._position += 4;
    },

    set date(date: Date) {
        let day = 0, month = 0, year = 0;
        if (typeof date === 'number') {
            year = date;
        } else if (date) {
            day = date.getDate();
            month = date.getMonth() + 1;
            year = date.getFullYear();
        }
        this.u8 = day + ((month & 0x7) << 5);
        this.u8 = month >> 3;
        this.u8 = year & 0xff;
        this.u8 = (year >> 8) & 0x7f;
    },

    // https://github.com/Musashii-kun/winscp/blob/e0fcef1c1ea8074dbcf31ea61fa61150bb21eff9/libs/mfc/source/arccore.cpp#L155
    // CString serialization code
    // String format:
    //      UNICODE strings are always prefixed by 0xff, 0xfffe
    //      if < 0xff chars: len:BYTE, TCHAR chars
    //      if >= 0xff characters: 0xff, len:WORD, TCHAR chars
    //      if >= 0xfffe characters: 0xff, 0xffff, len:DWORD, TCHARs    
    set bstr(s: string) {
        // const buf = encoder.encode(s); // UTF-8
        const buf = new Uint8Array([...s ?? ''].map((c) => c.charCodeAt(0)));
        if (buf.length < 0xff) {
            this.u8 = buf.length;
        } else {
            this.u8 = 0xff;
            if (buf.length < 0xfffe) {
                this.u16 = buf.length;
            } else {
                this.u16 = 0xffff;
                this.u32 = buf.length;
            }
        }
        this.writeBytes(buf);
    },

    set array(n: number) {
        this.u16 = n;
    },
    set arrayb(n: number) {
        this.u8 = n;
    },

    set customData(d: unknown) { },

    set schema(className: string) {
        const nClassIndex = this._classNames.indexOf(className);
        if (nClassIndex === -1) {
            const wTag = wNewClassTag;
            this.u16 = wTag;
            this.u16 = 1; // pid;
            const buf = encoder.encode(className);
            this.u16 = buf.length;
            this.writeBytes(buf);
            this._classNames[this._nMapCount] = className;
            this._nMapCount += 2; // class + instance
        } else {
            if (nClassIndex >= wBigObjectTag) {
                this.u16 = wBigObjectTag;
                this.u32 = nClassIndex;
            } else {
                // const obTag = nClassIndex | dwBigClassTag;
                // const wTag = ((obTag >> 16) & wClassTag) | (obTag & ~wClassTag);
                // const wTag = (((obTag >> 16) & wClassTag) | obTag) & ~wClassTag;
                const wTag = nClassIndex | wClassTag;
                // obTag = 0x80000001 == -2147483647
                // wTag  = 0x8001 == 32769
                this.u16 = wTag;
            }
            this._nMapCount += 1;
        }
    }
});

export function generateId() {
    return String((Math.random() * 0xffff) & 0xffff);
}
