import { Tournament } from "../../domain/tournament";
import { docFields, jatFileType } from "./jatSchema";
import { createReader } from "./serialReader";
import { createWriter } from "./serialWriter";

let fileName: string = '';

export async function openFile(): Promise<Tournament> {
    // alert('hello');
    const [fileHandle] = await showOpenFilePicker({
        types: [jatFileType],
        excludeAcceptAllOption: true,
        multiple: false,
    });
    return readFile(fileHandle);
}

// https://streams.spec.whatwg.org/#example-rbs-pull

async function readFile(fileHandle: FileSystemFileHandle): Promise<Tournament> {
    // console.log('reading ', fileHandle.name);
    const file = await fileHandle.getFile();
    const { size, lastModified, type } = file;
    console.log(`name=${fileHandle.name} size=${size} lastModified=${new Date(lastModified).toISOString()} type=${type}`);

    using reader = createReader(file.stream(), new Date(file.lastModified)); // File parameter for streaming
    const doc = await reader.readObject(docFields);
    reader.close(); // already closed by using
    console.log(doc);

    fileName = doc._url = fileHandle.name;

    return doc;
}

export async function saveFile(doc: Tournament) {
    let writable: WritableStream<Uint8Array<ArrayBuffer>>;
    let resizable: ReturnType<typeof createResizableWritableStream> | undefined;
    try {
        const fileHandle = await showSaveFilePicker({
            types: [jatFileType],
            suggestedName: (doc._url ?? fileName).replace(/(\.jat)$/i, '-saved$1'),
        });
        writable = await fileHandle.createWritable();
    } catch (error) {
        if (!Error.isError(error) || error.name !== 'NotAllowedError') {
            throw error;
        }
        // fallback to download the file if not https
        resizable = createResizableWritableStream();
        writable = resizable.stream;
    }

    {
        await using writer = createWriter(writable);
        await writer.writeObject(doc, docFields, docFields.version.def);
    }

    if (resizable) {
        downloadBinaryFile(resizable.toBlob(), `${doc._url?.replace(/\.jat$/i, '')}-${Date.now()}.jat`);
    }
}

export function createResizableWritableStream(
    maxByteLength: number = 100 * 1024 * 1024 // 100MB max ceiling
) {
    const buffer = new ArrayBuffer(1024, { maxByteLength }); // ES2024+ support resize
    const view = new Uint8Array(buffer); // length-tracking
    let bytesWritten = 0;

    return {
        stream: new WritableStream<Uint8Array<ArrayBuffer>>({
            write(chunk) {
                const required = bytesWritten + chunk.byteLength;

                if (required > maxByteLength) {
                    throw new RangeError(`Exceeds max capacity of ${maxByteLength} bytes`);
                }
                if (required > buffer.byteLength) {
                    // Expand the underlying ArrayBuffer in-place
                    buffer.resize(Math.min(maxByteLength, Math.max(buffer.byteLength * 2, required)));
                    // view = new Uint8Array(buffer); // not necessary with length-tracking
                }

                // new Uint8Array(_buffer, bytesWritten, chunk.byteLength).set(chunk);
                view.set(chunk, bytesWritten);
                bytesWritten += chunk.byteLength;
            },
        }),
        get writtenBytes() {
            return view.subarray(0, bytesWritten);
        },
        toBlob(mimeType = "application/octet-stream") {
            return new Blob([view.subarray(0, bytesWritten).slice()], { type: mimeType });
        },
    };
}

/**
 * Prompts the browser to download client-generated binary data as a file.
 *
 * @param data - Blob, ArrayBuffer, or typed array containing the binary payload.
 * @param filename - Default name for the downloaded file (e.g., "export.bin").
 * @param mimeType - Optional MIME type override (default: "application/octet-stream").
 */
export function downloadBinaryFile(
    data: BlobPart, // Blob | ArrayBuffer | Uint8Array<ArrayBuffer>,
    filename: string,
    mimeType = "application/octet-stream"
): void {
    // Ensure we have a Blob
    const blob = data instanceof Blob ? data : new Blob([data], { type: mimeType });

    // 1. Create a transient object URL pointing to the Blob
    const url = URL.createObjectURL(blob);

    // 2. Create an off-DOM anchor element configured for download
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.style.display = "none";

    // 3. Append to body (required for reliable clicks in Firefox), trigger, and cleanup
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    // 4. Revoke the object URL to release browser memory
    // A microtask or short timeout ensures the browser finishes dispatching the download
    setTimeout(() => URL.revokeObjectURL(url), 100);
}

// function streamAsyncIterator(stream: ReadableStream, _flags?: { mode: "byob" }) {
//     // Get a lock on the stream:
//     const reader = stream.getReader(); // stream.getReader(flags);
//
//     return {
//         next() {
//             // Stream reads already resolve with {done, value}, so we can just call read:
//             return reader.read();
//         },
//         return() {
//             // Release the lock if the iterator terminates.
//             reader.releaseLock();
//             return {};
//         },
//         // for-await calls this on whatever it's passed, so iterators tend to return themselves.
//         [Symbol.asyncIterator]() {
//             return this;
//         }
//     };
// }

/* TODO
    document.getElementById('btnOpen').addEventListener('click', openFile);
    document.getElementById('btnSave').addEventListener('click', saveFile);
    const dropZone = document.getElementById('dropZone');
    dropZone.addEventListener('dragover', (event) => {
        event.preventDefault();
        dropZone.style.backgroundColor = '#ddd';
    });
    dropZone.addEventListener('drop', async (event) => {
        event.preventDefault();
        const fileHandlesPromises = [...event.dataTransfer.items]
            .filter((item) => item.kind === 'file')
            .map((item: any) => item.getAsFileSystemHandle());

        for await (const handle of fileHandlesPromises) {
            if (handle.kind === 'directory') {
                console.log(`Directory: ${handle.name}`);
            } else {
                console.log(`File: ${handle.name}`);
                readFile(handle);
            }
        }
    });
*/