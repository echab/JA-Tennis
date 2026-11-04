// oxlint-disable max-classes-per-file

type DataViewSetter = Exclude<Extract<keyof DataView, `set${string}`>, `setBig${string}`>;

/**
 * example:
 * 
 * ```js
 * // Consumer parser using standard getReader()
 * async function parseVariableRecords(stream) {
 *   const reader = stream.getReader();
 *   const slidingBuf = new SlidingByteBuffer();
 *   const decoder = new TextDecoder();
 * 
 *   try {
 *     while (true) {
 *       const { value, done } = await reader.read();
 * 
 *       if (done) {
 *         if (slidingBuf.unreadBytes > 0) {
 *           throw new Error("Stream terminated with an incomplete record.");
 *         }
 *         break; // Clean EOF
 *       }
 * 
 *       slidingBuf.append(value);
 * 
 *       // Drain as many full records as available in the sliding window
 *       while (slidingBuf.unreadBytes >= HEADER_SIZE) {
 *         const view = slidingBuf.getView();
 * 
 *         // 1. Peek header fields
 *         const payloadLength = view.getUint16(0, false);
 *         const sequenceId = view.getUint32(2, false);
 *         const totalRecordSize = HEADER_SIZE + payloadLength;
 * 
 *         // 2. Check if the full variable payload has arrived
 *         if (slidingBuf.unreadBytes < totalRecordSize) {
 *           break; // Wait for next stream chunk
 *         }
 * 
 *         // 3. Skip header bytes
 *         slidingBuf.advance(HEADER_SIZE);
 * 
 *         // 4. Extract variable payload
 *         const payloadBytes = slidingBuf.slice(payloadLength);
 *         const textMessage = decoder.decode(payloadBytes);
 * 
 *         console.log(`[Record #${sequenceId}] Length: ${payloadLength} bytes -> "${textMessage}"`);
 *       }
 *     }
 *   } finally {
 *     reader.releaseLock();
 *   }
 * }
 * ```
 */
export class SlidingByteBuffer {
    private buffer: Uint8Array<ArrayBuffer>;
    public readHead = 0;
    private writeHead = 0;
    constructor(initialCapacity = 64 * 1024) {
        this.buffer = new Uint8Array(initialCapacity);
    }

    get unreadBytes() {
        return this.writeHead - this.readHead;
    }

    // Ensure there is room for incoming chunk
    ensureCapacity(incomingLength: number) {
        const unread = this.unreadBytes;

        // Check if shifting remaining unread bytes to index 0 makes enough room
        if (this.buffer.length - unread >= incomingLength) {
            if (this.readHead > 0) {
                // Slide unread window to the start of the buffer
                this.buffer.copyWithin(0, this.readHead, this.writeHead);
                this.writeHead = unread;
                this.readHead = 0;
            }
        } else {
            // Not enough capacity even after sliding: grow buffer
            const newCapacity = Math.max(this.buffer.length * 2, unread + incomingLength);
            const newBuffer = new Uint8Array(newCapacity);
            newBuffer.set(this.buffer.subarray(this.readHead, this.writeHead), 0);
            this.buffer = newBuffer;
            this.writeHead = unread;
            this.readHead = 0;
        }
    }

    append(chunk: ArrayLike<number>) {
        this.ensureCapacity(chunk.length);
        this.buffer.set(chunk, this.writeHead);
        this.writeHead += chunk.length;
    }

    // Read view over the current unread window without copying
    getView() {
        return new DataView(
            this.buffer.buffer,
            this.buffer.byteOffset + this.readHead,
            this.unreadBytes
        );
    }

    advance(bytes: number) {
        this.readHead += bytes;
        // Reset pointers if buffer is completely consumed
        if (this.readHead === this.writeHead) {
            this.readHead = 0;
            this.writeHead = 0;
        }
    }

    // Get a direct view of a parsed payload slice
    slice(length: number): Uint8Array<ArrayBuffer> {
        const slice = this.buffer.subarray(this.readHead, this.readHead + length);
        this.advance(length);
        return slice;
    }
}

/**
 * example:
 * ```js
 * // Consumer parser using BYOB reader
 * async function parseVariableRecordsByob(stream) {
 *   const reader = stream.getReader({ mode: "byob" });
 *   const slidingBuf = new ByobSlidingBuffer();
 *   const decoder = new TextDecoder();
 * 
 *   try {
 *     while (true) {
 *       // 1. Drain any full records already sitting in the sliding buffer
 *       while (slidingBuf.unreadBytes >= HEADER_SIZE) {
 *         const view = slidingBuf.getView();
 *         const payloadLength = view.getUint16(0, false);
 *         const sequenceId = view.getUint32(2, false);
 *         const totalRecordSize = HEADER_SIZE + payloadLength;
 * 
 *         // Incomplete record: wait for more bytes from the stream
 *         if (slidingBuf.unreadBytes < totalRecordSize) {
 *           break;
 *         }
 * 
 *         // Complete record present: advance past header and consume
 *         slidingBuf.advance(HEADER_SIZE);
 *         const payloadBytes = slidingBuf.slice(payloadLength);
 *         const textMessage = decoder.decode(payloadBytes);
 * 
 *         console.log(`[Record #${sequenceId}] Length: ${payloadLength} bytes -> "${textMessage}"`);
 *       }
 * 
 *       // 2. Fetch the next chunk using BYOB window slice
 *       const targetSlice = slidingBuf.getReadTargetSlice();
 *       const { value, done } = await reader.read(targetSlice);
 * 
 *       if (done) {
 *         if (slidingBuf.unreadBytes > 0) {
 *           throw new Error("Stream closed unexpectedly with an incomplete record.");
 *         }
 *         break; // Clean EOF
 *       }
 * 
 *       // 3. Re-bind the returned buffer memory and advance write pointer
 *       slidingBuf.append(value);
 *     }
 *   } finally {
 *     reader.releaseLock();
 *   }
 * }
 * ```
 */
export class ByobSlidingBuffer {
    private buffer: Uint8Array<ArrayBuffer>
    readHead = 0;
    private writeHead = 0;
    constructor(initialCapacity = 64 * 1024) {
        this.buffer = new Uint8Array(initialCapacity);
    }

    get unreadBytes() {
        return this.writeHead - this.readHead;
    }

    // Slide unread bytes to index 0, or grow the buffer if unread content fills capacity
    compactOrGrow(minFreeSpace = 4096) {
        const unread = this.unreadBytes;
        const availableTail = this.buffer.length - this.writeHead;

        if (availableTail >= minFreeSpace) {
            return; // Plenty of room to read next chunk directly into tail
        }

        if (this.buffer.length - unread >= minFreeSpace) {
            // Shifting unread bytes to index 0 recovers enough contiguous tail room
            this.buffer.copyWithin(0, this.readHead, this.writeHead);
            this.writeHead = unread;
            this.readHead = 0;
        } else {
            // Must allocate a larger ArrayBuffer
            const newCapacity = Math.max(this.buffer.length * 2, unread + minFreeSpace);
            const nextBuffer = new Uint8Array(newCapacity);
            nextBuffer.set(this.buffer.subarray(this.readHead, this.writeHead), 0);
            this.buffer = nextBuffer;
            this.writeHead = unread;
            this.readHead = 0;
        }
    }

    // Provide a window slice into the tail to pass to reader.read()
    getReadTargetSlice(minFreeSpace = 4096) {
        this.compactOrGrow(minFreeSpace);
        // Return a typed array view spanning the unwritten tail of the buffer
        return new Uint8Array(
            this.buffer.buffer,
            this.buffer.byteOffset + this.writeHead,
            this.buffer.length - this.writeHead
        );
    }

    // Adopt the returned BYOB view and re-bind this.buffer
    append(returnedView: Uint8Array<ArrayBuffer>) {
        // Adopt the returned backing ArrayBuffer (it was transferred during read)
        this.buffer = new Uint8Array(returnedView.buffer);
        this.writeHead += returnedView.byteLength;
    }

    // Read view over current unread window without copying
    getView() {
        return new DataView(
            this.buffer.buffer,
            this.buffer.byteOffset + this.readHead,
            this.unreadBytes
        );
    }

    advance(bytes: number) {
        this.readHead += bytes;
        if (this.readHead === this.writeHead) {
            this.readHead = 0;
            this.writeHead = 0;
        }
    }

    // Extract a slice of the variable payload
    slice(length: number) {
        const data = this.buffer.subarray(this.readHead, this.readHead + length);
        this.advance(length);
        return data;
    }
}

export class SlidingBinaryStreamWriter {
    private writer: WritableStreamDefaultWriter<Uint8Array>;
    private buffer: ArrayBuffer;
    private view: DataView;
    private offset: number = 0;
    private readonly capacity: number;
    private isClosed = false;

    /**
     * @param stream The destination WritableStream
     * @param bufferSize Size of the sliding buffer window (e.g. 64 KB)
     */
    constructor(private stream: WritableStream<Uint8Array>, bufferSize: number = 64 * 1024) {
        this.writer = stream.getWriter();
        this.capacity = bufferSize;
        this.buffer = new ArrayBuffer(bufferSize);
        this.view = new DataView(this.buffer);
    }

    /**
     * Flushes any pending buffered bytes to the WritableStream.
     */
    async flush(): Promise<void> {
        if (this.offset === 0) { return };

        // Slice out only the written region to send downstream
        const chunk = new Uint8Array(this.buffer.slice(0, this.offset));

        // Reset offset back to the beginning of the reusable window
        this.offset = 0;

        await this.writer.ready;
        await this.writer.write(chunk);
    }

    /**
     * Ensures there is enough contiguous room for `requiredBytes`.
     * If not, flushes the current window to slide back to offset 0.
     */
    private async ensureCapacity(requiredBytes: number): Promise<void> {
        if (requiredBytes > this.capacity) {
            throw new RangeError(
                `Item size (${requiredBytes}B) exceeds maximum sliding buffer capacity (${this.capacity}B)`
            );
        }

        if (this.offset + requiredBytes > this.capacity) {
            await this.flush();
        }
    }

    /**
     * Appends variable-length bytes into the buffer.
     */
    async writeBytes(bytes: Uint8Array): Promise<number> {
        let remaining = bytes;

        while (remaining.byteLength > 0) {
            const available = this.capacity - this.offset;
            if (available === 0) {
                await this.flush();
                continue;
            }

            const toCopy = Math.min(available, remaining.byteLength);
            new Uint8Array(this.buffer, this.offset, toCopy).set(remaining.subarray(0, toCopy));

            this.offset += toCopy;
            remaining = remaining.subarray(toCopy);
        }
        return bytes.length;
    }

    async writeValue(value: number, length: number, setter: DataViewSetter, littleIndian = false): Promise<number> {
        await this.ensureCapacity(length);
        // like this.view.setUint8(this.offset, value, littleIndian);
        this.view[setter].call(this.view, this.offset, value, littleIndian);
        this.offset += length;
        return length;
    }

    /**
     * Flushes remaining bytes, closes the stream, and releases the writer lock.
     */
    async close() {
        if (this.isClosed) { return; }
        this.isClosed = true;
        try {
            await this.flush();
            // await this.stream.close();
            await this.writer.close();
        } catch (err) {
            console.error('Closing SlidingBinaryStreamWriter', err);
        } finally {
            try {
                this.writer.releaseLock();
            } catch {
                // console.error('Closing SlidingBinaryStreamWriter releaseLock', err);
            }
        }
    }
    [Symbol.dispose]() { return this.close(); }
    [Symbol.asyncDispose]() { return this.close(); }

    /**
     * Aborts the stream and releases the lock.
     */
    async abort(reason?: unknown): Promise<void> {
        if (this.isClosed) { return; }
        this.isClosed = true;
        try {
            await this.writer.abort(reason);
        } finally {
            try {
                this.writer.releaseLock();
            } catch {
                // console.error('Aborting SlidingBinaryStreamWriter releaseLock', err);
            }
        }
    }
}

/**
 * Ensure exactly N bytes are read across potential chunk boundaries.
 * 
 * example:
 * ```js
 * const reader = stream.getReader({ mode: "byob" });
 * try {
 *   while (true) {
 *     const recordBytes = await readExactBytes(reader, RECORD_SIZE);
 *     if (!recordBytes) break; // Stream ended cleanly
 * 
 *     // Create a DataView over the completed record buffer
 *     const view = new DataView(
 *       recordBytes.buffer,
 *       recordBytes.byteOffset,
 *       recordBytes.byteLength
 *     );
 * 
 *     // Parse structured binary fields (false = Big-Endian)
 *     const readingValue = view.getFloat32(6, true);
 *     ...
 *   }
 * } finally {
 *   reader.releaseLock();
 * }
 * ```
 */
export async function readExactBytes(reader: ReadableStreamBYOBReader, totalBytes: number): Promise<Uint8Array<ArrayBuffer> | null> {
    const result = new Uint8Array(totalBytes);
    let bytesRead = 0;

    while (bytesRead < totalBytes) {
        // Provide a sub-view representing remaining unread space in the buffer
        const bufferSlice = new Uint8Array(
            result.buffer,
            bytesRead,
            totalBytes - bytesRead
        );

        const { value, done } = await reader.read(bufferSlice);

        if (done) {
            if (bytesRead > 0) {
                throw new Error("Stream closed unexpectedly before reading full record.");
            }
            return null; // Clean EOF
        }

        // In BYOB mode, value is a Uint8Array backed by the transferred memory
        bytesRead += value.byteLength;
    }

    return result;
}

/**
 * Accumulates incoming chunks and yields complete records of `recordSize`
 * 
 * example:
 * ```js
 * for await (const recordBytes of streamRecords(stream, RECORD_SIZE)) {
 *   const view = new DataView(
 *     recordBytes.buffer,
 *     recordBytes.byteOffset,
 *     recordBytes.byteLength
 *   );
 *   const readingValue = view.getFloat32(6, true);
 *   // ...
 * }
 * ```
 */
export async function* streamRecords(stream: ReadableStream, recordSize: number): AsyncGenerator<Uint8Array<ArrayBuffer>, void, unknown> {
    const reader = stream.getReader();
    let buffer = new Uint8Array(0);

    try {
        while (true) {
            const { value, done } = await reader.read();

            if (done) {
                if (buffer.length > 0) {
                    throw new Error("Stream closed unexpectedly with an incomplete record.");
                }
                break; // Clean EOF
            }

            // Append newly arrived chunk to the leftover buffer
            const merged = new Uint8Array(buffer.length + value.length);
            merged.set(buffer, 0);
            merged.set(value, buffer.length);
            buffer = merged;

            // Extract all complete records currently sitting in buffer
            while (buffer.length >= recordSize) {
                const recordBytes = buffer.subarray(0, recordSize);
                buffer = buffer.subarray(recordSize);
                yield recordBytes;
            }
        }
    } finally {
        reader.releaseLock();
    }
}
