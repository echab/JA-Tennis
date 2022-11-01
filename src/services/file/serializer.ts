const decoder = new TextDecoder("iso-8859-1");
// const decoder = new TextDecoder("windows-1252");

// const encoder = new TextEncoder(); // "iso-8859-1"

export type Serializer = ReturnType<typeof createSerializer>;

export type Type = keyof Omit<Serializer, `${"_"|"read"|"write"}${string}`|"seek">

export type FieldParent = { version?: number, [k: string]: any };

export type FnType<T> = (
    this: Serializer,
    writing: boolean,
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
    valid?: (this: Serializer, v: any, parent?: any) => boolean,
    itemType?: Type | FnType<any> | Fields<any> // TODO no any
};

export type Fields<T> = {[P in keyof T]: Field<T[P]> } | { [Q: `_${string}`] : Field<any> };

export const createSerializer = (buffer: Uint8Array, position = 0) => ({
    _position: position,
    _buffer: buffer,
    _view: new DataView(buffer.buffer),
    _classNames: {} as Record<number, string>,
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
                r = this.readArray(r, field, parent, name);
            }
            return r;        
        } else if (typeof type === "function") {
            return type.call(this, false, field, parent, name); // FnType
        } else {
            return this.readFields(type, parent.version, name);
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
    readFields<T>(fields: Fields<T>, parentVersion: number, name?: string): T {
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

    /** any for `itemType?: Type | Fields<T>` to avoid circular reference */
    readArray<T>(n: number, field: Field<T>, doc?: FieldParent, name?: string): T[] {
        const { itemType } = field;
        if (!itemType) { throw new Error("undefined field or itemType"); }
        return Array(n).fill(0).map(() => this.readType(itemType, field, doc, name));
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
    
    get word() {
        const [a, b] = this.readBytes(2);
        return a + (b << 8);
    },
    
    get i16() {
        const r = this._view.getInt16(this._position, true);
        this._position += 2;
        return r;
    },
    
    get dword() {
        const [a, b, c, d] = this.readBytes(4);
        return a + (b << 8) + (c << 16) + (d << 24);
    },
    
    get float() {
        const r = this._view.getFloat32(this._position, true);
        this._position += 4;
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
    
    get bstr() {
        const n = this.byte;
        return decoder.decode(this.readBytes(n));
    },
    set bstr(s) {
        // const buf = encoder.encode(s); // UTF-8
        const buf = new Uint8Array([...s].map((c)=> c.charCodeAt(0)));
        this.byte = buf.length; 
        this.writeBytes(buf);
    },

    get array() {
        return this.word; // the array size, the items are read into readType()
    },
    get arrayb() {
        return this.byte; // the array size, the items are read into readType()
    },

    get generateId() {
        return generateId();
    },
    
    get customData() { return; },
    
    get schema() {
        // https://learn.microsoft.com/en-us/cpp/mfc/tn002-persistent-object-data-format?view=msvc-170
        // https://www.codeproject.com/Articles/1176939/All-About-MFC-Serialization
        // atlmfc/src/mfc/arcobj.cpp
        const wBigObjectTag = 0x7fff;
        const wClassTag = 0x8000;
        const wNewClassTag = 0xffff;
        const dwBigClassTag = 0x80000000;
    
        const wTag = this.word;
        let obTag;
        if (wTag === wBigObjectTag) {
            obTag = this.dword;
        } else {
            obTag = ((wTag & wClassTag) << 16) | (wTag & ~wClassTag);
        }
        if (wTag === wNewClassTag) {
            const pid = this.word;
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
    }    
});

export function generateId() {
    return String((Math.random() * 0xffff) & 0xffff);
}
