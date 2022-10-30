const decoder = new TextDecoder("iso-8859-1");
// const decoder = new TextDecoder("windows-1252");

// const encoder = new TextEncoder(); // "iso-8859-1"

export type Serializer = {
    reading: boolean,
    position: number,
    buffer: Uint8Array,
    view: DataView,
    _classNames: Record<number, string>,
    _nMapCount: number,
    read: (n: number) => Uint8Array,
    write: (bytes: Uint8Array) => void,
    deserialize: (
        fields: Fields,
        parentVersion: number,
        name?: string
    ) => any,
    deserializeField: (
        field: Field,
        parent: FieldParent,
        name: string
    ) => any,
    deserializeType: (
        type: FnType | Fields,
        field: Field,
        parent: any,
        name?: string
    ) => any
}

type FieldParent = { version?: number, [k: string]: any };

export type FnType = (
    this: Serializer,
    fields?: Field,
    parent?: FieldParent,
    name?: string
) => any;

export type Field = {
    version?: number,
    maxVersion?: number,
    type: FnType | Fields,
    def?: any,
    predicate?: (parent: any) => boolean | number,
    reviver?: (v: any, parent?: any) => any,
    valid?: (v: any, parent?: any) => boolean,
    itemType?: FnType | Fields
};

export type Fields = Record<string, Field>;

export type FnTypeRead = (
    this: Serializer,
    fields?: Field,
    parent?: FieldParent,
    name?: string
) => any;

export type FnTypeWrite = (
    this: Serializer,
    bytes: number,
    fields?: Field,
    parent?: FieldParent,
    name?: string
) => void;

const readers: Record<string, FnTypeRead> = {
    byte() {
        return this.read(1)[0];
    },
    bstr() {
        const n = byte.call(this);
        return decoder.decode(this.read(n));
    },
}

// const writers: Record<string, FnTypeWrite> = {
//     byte(b) {
//         this.write(new Uint8Array([b]));
//     },
//     bstr(s) {
//         encoder.encode(s);
//         const bytes = new Uin
//         const n = byte.call(this);
//         return decoder.encode(this.read(n));
//     },
// }

export const createSerializer = (reading: boolean, buffer: Uint8Array, position = 0): Serializer => ({
    reading,
    position,
    buffer,
    view: new DataView(buffer.buffer),
    _classNames: {}, _nMapCount: 1,
    read(n) {
        const r = this.buffer.slice(this.position, this.position + n);
        this.position += n;
        return r;
    },
    write(bytes) {
        this.buffer.set(bytes, this.position);
        this.position += bytes.byteLength;
    },
    deserializeType(type, field, parent, name) {
        if (typeof type === 'function') {
            return type.call(this, field, parent, name);
        } else {
            return this.deserialize(type, parent.version, name);
        }
    },
    deserializeField(field, parent, name) {
        const { version, maxVersion, predicate, type, def, valid, reviver } = field;
        if ((maxVersion || version) && !parent.version) {
            throw new Error(`Missing parent.version for ${name}`);
        }
        if ((!maxVersion || (parent.version ?? 0) <= maxVersion)
            && (!predicate || predicate(parent))) {
            let r;
            if (!version || version <= (parent.version ?? 99)) {
                r = this.deserializeType(type, field, parent, name);
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
    deserialize(fields, parentVersion, name) {
        const result = { version: parentVersion }; // by default, inherit version from parent
        for (const [name, field] of Object.entries(fields)) {
            const r = this.deserializeField(field, result, name);
            if (name === '_return') {
                return r;
            }
            if (typeof r !== 'undefined' && !name.startsWith('_')) {
                (result as any)[name] = r;
            }
        }
        return result;
    },
});

export function byte(this: Serializer) {
    // return this.reading ? this.read(1)[0] : this.write(b);
    return this.read(1)[0];
}

export function char(this: Serializer) {
    return decoder.decode(this.read(1));
}

export function word(this: Serializer) {
    const [a, b] = this.read(2);
    return a + (b << 8);
}

export function i16(this: Serializer) {
    const r = this.view.getInt16(this.position, true);
    this.position += 2;
    return r;
}

export function dword(this: Serializer) {
    const [a, b, c, d] = this.read(4);
    return a + (b << 8) + (c << 16) + (d << 24);
}

export function float(this: Serializer) {
    const r = this.view.getFloat32(this.position, true);
    this.position += 4;
    return r;
}

export function date(this: Serializer) {
    const [a, b, c, d] = this.read(4);
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
}

export function bstr(this: Serializer) {
    const n = byte.call(this);
    return decoder.decode(this.read(n));
}

export function array(this: Serializer, field?: Field, doc?: FieldParent, name?: string) {
    if (!field?.itemType) { throw new Error("undefined field or itemType"); }
    const { itemType } = field;
    const n = word.call(this);
    return Array(n).fill(0).map(() => this.deserializeType(itemType, field, doc, name));
    // const result = [];
    // for (let i = 0; i < n; i++) {
    //     result.push(this.deserializeType(itemType, field, doc, name));
    // }
    // return result;
}

export function arrayb(this: Serializer, field?: Field, doc?: FieldParent, name?: string) {
    if (!field?.itemType) { throw new Error("undefined field or itemType"); }
    const { itemType } = field;
    const n = byte.call(this);
    return Array(n).fill(0).map(() => this.deserializeType(itemType, field, doc, name));
}

export function generateId() {
    return (Math.random() * 0xffff) & 0xffff;
}

export function customData() { }

export function schema(this: Serializer, _?: Field, parent?: FieldParent, name?: string) {
    // https://learn.microsoft.com/en-us/cpp/mfc/tn002-persistent-object-data-format?view=msvc-170
    // https://www.codeproject.com/Articles/1176939/All-About-MFC-Serialization
    // atlmfc/src/mfc/arcobj.cpp
    const wBigObjectTag = 0x7fff;
    const wClassTag = 0x8000;
    const wNewClassTag = 0xffff;
    const dwBigClassTag = 0x80000000;

    const wTag = word.call(this);
    let obTag;
    if (wTag === wBigObjectTag) {
        obTag = dword.call(this);
    } else {
        obTag = ((wTag & wClassTag) << 16) | (wTag & ~wClassTag);
    }
    if (wTag === wNewClassTag) {
        const pid = word.call(this);
        const className = decoder.decode(this.read(word.call(this)));
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