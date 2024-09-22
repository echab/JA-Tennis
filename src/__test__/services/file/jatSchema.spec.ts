/// <reference types="node" />
/**
 * @jest-environment node
 */
import type { Tournament } from "../../../domain/tournament";
import { KNOCKOUT } from "../../../domain/draw";
import { docFields } from "../../../services/file/jatSchema";
import { createSerializer } from "../../../services/file/serializer";
import { readFile } from 'node:fs/promises';

// import path from "node:path";
// import { fileURLToPath } from "node:url";
// const __dirname = path.dirname(fileURLToPath(import.meta.url));

beforeAll(() => {
    jest.spyOn(globalThis.console, 'warn').mockImplementation();
});
afterAll(() => {
    jest.restoreAllMocks();
});

describe("jatSchema", () => {
    const tournament2: Tournament = {
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
    };

    it('should read binary tournament1.jat file version 13', async () => {
        const b = await readFile(`${__dirname}/tournament1.jat`);
        const buf = b.buffer;

        const reader = createSerializer(new Uint8Array(buf));

        const result = reader.readObject(docFields);

        expect(result.version).toBe(13);
        expect(result).toMatchSnapshot();
    });

    // it('should read binary tournament1.jat file into snapshot', async () => {
    //     const b = await readFile(`${__dirname}/tournament1.jat`);

    //     expect(new Uint8Array(b.buffer)).toMatchSnapshot();
    // });

    it('should save tournament to array buffer', () => {
        const writer = createSerializer(new Uint8Array(8192)); // TODO size
        writer.writeObject(tournament2, docFields);
        const buf = writer._buffer.slice(0, writer._position);

        expect(buf).toMatchSnapshot();
    });

    it('should save and reload same tournament', () => {
        const writer = createSerializer(new Uint8Array(8192)); // TODO size
        writer.writeObject(tournament2, docFields);
        const buf = writer._buffer.slice(0, writer._position);

        const reader = createSerializer(buf);
        const result = reader.readObject(docFields);

        expect(result.version).toBe(13);
        expect(result).toMatchObject(tournament2);
    });

    it('should write binary with the same tournament1.jat content', async () => {
        const b = await readFile(`${__dirname}/tournament1.jat`);
        const expected = new Uint8Array(b.buffer);

        const reader = createSerializer(new Uint8Array(b.buffer));
        const doc = reader.readObject(docFields);

        const writer = createSerializer(new Uint8Array(expected.length * 2)); // TODO size
        writer.writeObject(doc, docFields);
        const result = writer._buffer.slice(0, writer._position);

        expect(result).toEqual(expected);
    });

});
