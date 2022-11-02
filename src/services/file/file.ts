import { Tournament } from "../../domain/tournament";
import { docFields, jatFileType } from "./jatSchema";
import { createSerializer } from "./serializer";

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

async function readFile(fileHandle: any): Promise<Tournament> {
    // console.log('reading ', fileHandle.name);
    const file = await fileHandle.getFile();
    // const { size, lastModifiedDate, type } = file;
    // console.log('size=', size, 'lastModifiedDate=', lastModifiedDate);
    // const content = await file.stream();
    // for await (const value of streamAsyncIterator(content)) {
    const buffer = await file.arrayBuffer();
    const value = new Uint8Array(buffer);

    const reader = createSerializer(value);
    const doc = reader.readObject(docFields, NaN, 'doc');
    console.log(doc);

    fileName = fileHandle.name;

    return doc;
}

export async function saveFile(doc: Tournament) {
    const fileHandle = await showSaveFilePicker({
        types: [jatFileType],
        suggestedName: fileName.replace(/\.jat$/i, '-saved$0'),
    });
    const writable = await fileHandle.createWritable();

    const writer = createSerializer(new Uint8Array(8192)); // TODO size
    // @ts-expect-error
    writer.writeObject(doc, docFields, docFields.version.def, 'doc');

    await writable.write(writer._buffer);
    await writable.truncate(writer._position);

    await writable.close();
}

function streamAsyncIterator(stream: ReadableStream, flags?: { mode: "byob" }) {
    // Get a lock on the stream:
    const reader = stream.getReader(); // stream.getReader(flags);

    return {
        next() {
            // Stream reads already resolve with {done, value}, so
            // we can just call read:
            return reader.read();
        },
        return() {
            // Release the lock if the iterator terminates.
            reader.releaseLock();
            return {};
        },
        // for-await calls this on whatever it's passed, so
        // iterators tend to return themselves.
        [Symbol.asyncIterator]() {
            return this;
        }
    };
}

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