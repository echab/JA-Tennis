import { SlidingByteBuffer } from "./buffer";
import type { FieldParent, Field, Fields, FnTypeReader } from "./serialTypes";

/* eslint-disable no-bitwise */
const decoder = new TextDecoder("iso-8859-1");
// const decoder = new TextDecoder("windows-1252");
const decoderUnicode = new TextDecoder("utf-16");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type _any = any;

const wBigObjectTag = 0x7fff;
// const wClassTag = 0x8000;
const wNewClassTag = 0xffff;
// const dwBigClassTag = 0x80000000;

const BUFFER_SIZE = 0x400;

export type SerialReader = ReturnType<typeof createReader>;

type DataViewGetter = Exclude<Extract<keyof DataView, `get${string}`>, `getBig${string}`>;

export const createReader = (stream: ReadableStream<Uint8Array<ArrayBuffer>>, fileDate?: Date, position = 0) => {
    const _reader = stream.getReader();
    const slidingBuffer = new SlidingByteBuffer(BUFFER_SIZE);
    // const _reader = stream.getReader({ mode: 'byob' });
    // const slidingBuffer = new ByobSlidingBuffer(BUFFER_SIZE);
    let _view: DataView;

    async function ensureBytes(n: number) {
        if (slidingBuffer.unreadBytes < n) {
            const { value, done } = await _reader.read();
            // const { value, done } = await _reader.read(slidingBuffer.getReadTargetSlice(BUFFER_SIZE));            
            if (done) {
                if (slidingBuffer.unreadBytes > 0) {
                    throw new Error("Stream terminated with an incomplete record.");
                } else {
                    throw new Error("Stream terminated before reading all requested data.");
                }
            }
            slidingBuffer.append(value);
            _view = slidingBuffer.getView();
        }
    }

    return {
        writing: false as const,
        _position: position,
        _arrayIndex: NaN,
        _classNames: [] as string[],
        _nMapCount: 1,
        _fileDate: fileDate,
        close() { _reader.releaseLock(); },
        [Symbol.dispose]() { return this.close(); },
        async readValue(length: number, getter: DataViewGetter, littleIndian = false): Promise<number> {
            await ensureBytes(length);
            const r = _view[getter].call(_view, slidingBuffer.readHead, littleIndian);
            slidingBuffer.advance(length);
            this._position += length;
            return r;
        },
        async readBytes(n: number): Promise<Uint8Array<ArrayBuffer>> {
            await ensureBytes(n);
            this._position += n;
            return slidingBuffer.slice(n);
        },
        async readType<T>(
            type: string | FnTypeReader<T> | Fields<_any>,
            field: Field<T>,
            parent: FieldParent,
            name?: string
        ): Promise<T> {
            if (typeof type === 'string') {
                let r = await (this as _any)[type]();
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

        async u8() {
            return this.readValue(1, 'getUint8');
        },

        async char() {
            return decoder.decode(await this.readBytes(1));
        },

        async u16() {
            return this.readValue(2, 'getUint16', true);
        },

        async i8() {
            return this.readValue(1, 'getInt8');
        },

        async i16() {
            return this.readValue(2, 'getInt16', true);
        },

        async u32() {
            // return this.readValue(4, 'getUint32', true);
            const [a, b, c, d] = await this.readBytes(4);
            return a + (b << 8) + (c << 16) + (d << 24); // TODO return -1 instead of 0xffffffff
        },

        async f32() {
            return this.readValue(4, 'getFloat32', true);
        },

        async date() {
            const [a, b, c, d] = await this.readBytes(4);
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
        async bstr() {
            let n = await this.u8();
            if (n === 0xff) {
                n = await this.u16();
                if (n === 0xffff) {
                    n = await this.u32();
                } else if (n === 0xfffe) {
                    // unicode
                    n = await this.u8();
                    if (n === 0xff) {
                        n = await this.u16();
                        if (n === 0xffff) {
                            n = await this.u32();
                        }
                    }
                    return decoderUnicode.decode(await this.readBytes(n));
                }
            }
            return decoder.decode(await this.readBytes(n));
        },

        array() {
            return this.u16(); // get the array size, the items are read into readType()
        },
        arrayb() {
            return this.u8(); // get the array size, the items are read into readType()
        },

        async customData() {
            return undefined;
        },

        async schema() {
            // https://learn.microsoft.com/en-us/cpp/mfc/tn002-persistent-object-data-format?view=msvc-170
            // https://www.codeproject.com/Articles/1176939/All-About-MFC-Serialization
            // atlmfc/src/mfc/arcobj.cpp

            const pos = this._position;
            const wTag = await this.u16();
            let obTag;
            if (wTag === wBigObjectTag) {
                obTag = await this.u32();
            } else {
                // obTag = ((wTag & wClassTag) << 16) | (wTag & ~wClassTag);
                obTag = wTag & wBigObjectTag;
            }
            if (wTag === wNewClassTag) {
                await this.u16(); // pid === 1
                const n = await this.u16();
                const className = decoder.decode(await this.readBytes(n));
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
        }
    };
}

export function generateId() {
    return String((Math.random() * 0xffff) & 0xffff);
}
