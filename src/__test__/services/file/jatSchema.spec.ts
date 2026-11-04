/// <reference types="node" />
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import path from "node:path";
import { fileURLToPath } from "node:url";
import { KNOCKOUT } from "../../../domain/draw.ts";
import { docFields } from "../../../services/file/jatSchema.ts";
import { createReader } from "../../../services/file/serialReader.ts";
import { createWriter } from "../../../services/file/serialWriter.ts";
import { reviveTournament } from '../../../services/tournamentService.ts';
import { createResizableWritableStream } from '../../../services/file/file.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

beforeAll(() => {
    vi.spyOn(globalThis.console, 'warn').mockImplementation(() => { });
});
afterAll(() => {
    vi.restoreAllMocks();
});

describe("jatSchema", async () => {
    const tournament2 = await reviveTournament({
        version: 13,
        id: '701',
        info: { name: 'Tournament 1', slotLength: 90 },
        types: { name: 'FFT', versionTypes: 5 },
        players: [
            { id: '0', name: 'Albert', sexe: 'H', rank: 'NC', registration: ['301'] },
            { id: '1', name: 'Bertty', sexe: 'H', rank: '40', registration: ['301'] },
            { id: '2', name: 'Ernest', sexe: 'H', rank: '30/5', registration: ['301'] },
            { id: '3', name: 'Freddy', sexe: 'H', rank: '30/4', registration: [] },
        ],
        events: [
            {
                id: '301', name: 'Simple mens', sexe: 'H', category: 11, maxRank: '30/1', draws: [
                    {
                        id: '1011', name: 'First draw', type: KNOCKOUT, nbColumn: 2, nbOut: 2, minRank: 'NC', maxRank: '40', boxes: [
                            { position: 1, score: '', place: 0, qualifOut: 2 },
                            { position: 2, score: '6/4 6/1', date: new Date('2022-11-03T20:30Z'), playerId: '0', qualifOut: 1 },
                            { position: 3, playerId: '3' },
                            { position: 4, playerId: '2' },
                            { position: 5, playerId: '1' },
                            { position: 6, playerId: '0' },
                        ]
                    }
                ]
            }
        ]
    });

    const refDate = new Date('2025-05-11');

    it('should read binary tournament1.jat file version 13', async () => {
        const b = readFileSync(`${__dirname}/tournament1.jat`);

        const reader = createReader(new Blob([b]).stream(), refDate);

        const result = await reader.readObject(docFields);

        expect(result.version).toBe(13);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { _types, ...serialDoc } = result;
        expect(serialDoc).toMatchSnapshot();
    });

    // it('should read binary tournament1.jat file into snapshot', async () => {
    //     const b = readFileSync(`${__dirname}/tournament1.jat`);

    //     expect(new Blob([b]).stream()).toMatchSnapshot();
    // });

    it('should save tournament to array buffer', async () => {
        const writable = createResizableWritableStream();
        {
            await using writer = createWriter(writable.stream, refDate);
            await writer.writeObject(tournament2, docFields);
            // writer.close(); // already closed by using
        }
        const buf = writable.writtenBytes;

        expect(buf.length).toBe(562);
        expect(buf).toMatchSnapshot();
    });

    it('should save and reload same tournament', async () => {
        const writable = createResizableWritableStream();
        {
            await using writer = createWriter(writable.stream, refDate); // TODO size
            await writer.writeObject(tournament2, docFields);
        }
        const buf = writable.writtenBytes;

        const reader = createReader(new Blob([buf]).stream(), refDate);
        const result = await reader.readObject(docFields);

        expect(result.version).toBe(13);
        expect(result).toMatchObject(tournament2);
    });

    it('should write binary with the same tournament1.jat content', async () => {
        const b = readFileSync(`${__dirname}/tournament1.jat`);
        const expected = new Uint8Array(b.buffer, b.byteOffset, b.byteLength);

        const reader = createReader(new Blob([b]).stream(), refDate);
        const doc = await reader.readObject(docFields);

        const writable = createResizableWritableStream();
        {
            await using writer = createWriter(writable.stream, refDate); // TODO size
            await writer.writeObject(doc, docFields);
        }
        const result = writable.writtenBytes;

        expect(result.length).toEqual(expected.byteLength);
        expect(joinedChunks(result)).toEqual(joinedChunks(expected));
        expect(result).toEqual(expected);
    });
});

function joinedChunks(arr: Uint8Array, size = 32): string {
    return chunks(arr, size).map((chunk, i) =>
        `${(i * size).toString(16).padStart(6, '0')}: ` +
        Array.from(
            chunk,
            (v => v.toString(16).padStart(2, '0'))
        ).join(' ')
    ).join('\n');
}

function chunks<T extends Uint8Array>(arr: T, size?: number): T[]
function chunks(arr: unknown[], size = 32) {
    const result = [];
    for (let i = 0; i < arr.length; i += size) {
        result.push(arr.slice(i, i + size));
    }
    return result;
}