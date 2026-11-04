// oxlint-disable no-bitwise
import { SlidingBinaryStreamWriter } from "./buffer";
import type { FnTypeWriter, Field, Fields, FieldParent } from "./serialTypes";

const encoder = new TextEncoder(); // "utf-8" not "iso-8859-1"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type _any = any;

export type SerialWriter = ReturnType<typeof createWriter>;

const wBigObjectTag = 0x7fff;
const wClassTag = 0x8000;
const wNewClassTag = 0xffff;
// const dwBigClassTag = 0x80000000;

const BUFFER_SIZE = 0x400;

export const createWriter = (stream: WritableStream<Uint8Array<ArrayBuffer>>, fileDate?: Date, position = 0) => {
    // const _writer = stream.getWriter();
    const _writer = new SlidingBinaryStreamWriter(stream, BUFFER_SIZE);
    return {
        writing: true as const,
        _position: position,
        _arrayIndex: NaN,
        _classNames: [] as string[],
        _nMapCount: 1,
        _fileDate: fileDate,
        close() { return _writer.close(); },
        [Symbol.dispose]() { return this.close(); },
        [Symbol.asyncDispose]() { return this.close(); },
        async writeBytes(bytes: Uint8Array<ArrayBuffer>) {
            this._position += await _writer.writeBytes(bytes);
        },
        async writeType<T>(
            value: _any,
            type: string | FnTypeWriter<T> | Fields<_any>,
            field: Field<T>,
            parent: FieldParent,
            name?: string
        ) {
            if (typeof type === 'string') {
                if (type === 'array' || type === 'arrayb') {
                    await this[type](value?.length ?? 0); // setter for the array length
                    await this.writeArrayItems(value, field, parent, name);
                } else {
                    await (this as _any)[type].call(this, value); // setter
                }
            } else if (typeof type === "function") {
                await type.call(this, value, field, parent, name); // FnType
            } else {
                await this.writeObject(value, type, parent?.version);
            }
        },
        async writeField<T>(
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
                    await this.writeType(value, type, field, parent, name);
                }
            }
        },
        async writeObject<T extends { version?: number }>(
            value: T | undefined,
            fields: Fields<T>,
            parentVersion?: number
        ) {
            const parent = { ...value, version: value?.version ?? parentVersion }; // by default, inherit version from parent
            for (const [fieldName, field] of Object.entries(fields)) {
                const v = !fieldName.startsWith('_') && value ? (value as _any)[fieldName] : undefined;
                await this.writeField(v, field, parent, fieldName);
            }
        },

        async writeArrayItems<T>(
            items: T[] | undefined,
            field: Field<T>,
            parent: FieldParent,
            name?: string
        ) {
            const { itemType } = field;
            if (!itemType) { throw new Error(`undefined array field or itemType at 0x${this._position.toString(16)}`); }
            const prev = this._arrayIndex;
            this._arrayIndex = 0;
            for (const item of items ?? []) {
                await this.writeType(item, itemType, field, parent, name);
                this._arrayIndex++;
            }
            this._arrayIndex = prev;
        },

        async u8(b: number) {
            this._position += await _writer.writeValue(b, 1, 'setUint8');
        },

        async char(c: string) {
            await this.u8(c.charCodeAt(0));
        },

        async u16(w: number) {
            this._position += await _writer.writeValue(w, 2, 'setUint16', true);
            // await this.u8(w & 0xFF);
            // await this.u8((w >> 8) & 0xFF);
        },

        async i8(i: number) {
            this._position += await _writer.writeValue(i, 1, 'setInt8');
        },

        async i16(i: number) {
            this._position += await _writer.writeValue(i, 2, 'setInt16', true);
        },

        async u32(dw: number) {
            this._position += await _writer.writeValue(dw, 4, 'setUint32', true);
        },

        async f32(f: number) {
            this._position += await _writer.writeValue(f, 4, 'setFloat32', true);
        },

        async date(date: Date) {
            let day = 0, month = 0, year = 0;
            if (typeof date === 'number') {
                year = date;
            } else if (date) {
                day = date.getDate();
                month = date.getMonth() + 1;
                year = date.getFullYear();
            }
            await this.u8(day + ((month & 0x7) << 5));
            await this.u8(month >> 3);
            await this.u8(year & 0xff);
            await this.u8((year >> 8) & 0x7f);
        },

        // https://github.com/Musashii-kun/winscp/blob/e0fcef1c1ea8074dbcf31ea61fa61150bb21eff9/libs/mfc/source/arccore.cpp#L155
        // CString serialization code
        // String format:
        //      UNICODE strings are always prefixed by 0xff, 0xfffe
        //      if < 0xff chars: len:BYTE, TCHAR chars
        //      if >= 0xff characters: 0xff, len:WORD, TCHAR chars
        //      if >= 0xfffe characters: 0xff, 0xffff, len:DWORD, TCHARs    
        async bstr(s: string) {
            // const buf = encoder.encode(s); // UTF-8
            const buf = new Uint8Array([...s ?? ''].map((c) => c.charCodeAt(0)));
            if (buf.length < 0xff) {
                await this.u8(buf.length);
            } else {
                await this.u8(0xff);
                if (buf.length < 0xfffe) {
                    await this.u16(buf.length);
                } else {
                    await this.u16(0xffff);
                    await this.u32(buf.length);
                }
            }
            await this.writeBytes(buf);
        },

        async array(n: number) {
            await this.u16(n);
        },
        async arrayb(n: number) {
            await this.u8(n);
        },

        async customData(_d: unknown) { },

        async schema(className: string) {
            const nClassIndex = this._classNames.indexOf(className);
            if (nClassIndex === -1) {
                const wTag = wNewClassTag;
                await this.u16(wTag);
                await this.u16(1); // pid;
                const buf = encoder.encode(className);
                await this.u16(buf.length);
                await this.writeBytes(buf);
                this._classNames[this._nMapCount] = className;
                this._nMapCount += 2; // class + instance
            } else {
                if (nClassIndex >= wBigObjectTag) {
                    await this.u16(wBigObjectTag);
                    await this.u32(nClassIndex);
                } else {
                    // const obTag = nClassIndex | dwBigClassTag;
                    // const wTag = ((obTag >> 16) & wClassTag) | (obTag & ~wClassTag);
                    // const wTag = (((obTag >> 16) & wClassTag) | obTag) & ~wClassTag;
                    const wTag = nClassIndex | wClassTag;
                    // obTag = 0x80000001 == -2147483647
                    // wTag  = 0x8001 == 32769
                    await this.u16(wTag);
                }
                this._nMapCount += 1;
            }
        }
    };
}
