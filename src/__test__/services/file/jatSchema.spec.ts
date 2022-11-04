/// <reference types="node" />
import type { Tournament } from "../../../domain/tournament";
import { KNOCKOUT } from "../../../domain/draw";
import { docFields } from "../../../services/file/jatSchema";
import { createSerializer } from "../../../services/file/serializer";
import { readFile } from 'node:fs/promises';

describe("jatSchema", () => {
    const tournament2: Tournament = {
        version: 13,
        id: 'T1',
        info: { name: 'Tournament 1', slotLength: 90 },
        types: { name: 'FFT', versionTypes: 5 },
        players: [
            { id: 'J1', name: 'Albert', sexe: 'H', rank: 'NC', registration: ['E1'] },
            { id: 'J2', name: 'Bertty', sexe: 'H', rank: '40', registration: ['E1'] },
            { id: 'J3', name: 'Ernest', sexe: 'H', rank: '30/5', registration: ['E1'] },
            { id: 'J4', name: 'Freddy', sexe: 'H', rank: '30/4', registration: [] },
        ],
        events: [
            {
                id: 'E1', name: 'Simple mens', sexe: 'H', category: 11, maxRank: '30/1', draws: [
                    {
                        id: 'D11', name: 'First draw', type: KNOCKOUT, nbColumn: 2, nbOut: 2, minRank: 'NC', maxRank: '40', boxes: [
                            { position: 6, playerId: 'J1' },
                            { position: 2, score: '6/4 6/1', date: new Date('2022-11-03T20:30Z'), playerId: 'J1', qualifOut: 1 },
                            { position: 5, playerId: 'J2' },
                            { position: 4, playerId: 'J3' },
                            { position: 1, score: '', place: 0, qualifOut: 2 },
                            { position: 3, playerId: 'J4' },
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
        writer.writeObject(tournament2, docFields, docFields.version.def);
        const buf = writer._buffer.slice(0, writer._position);

        expect(buf).toMatchSnapshot();
    });

    it('should save and reload same tournament', () => {
        const writer = createSerializer(new Uint8Array(8192)); // TODO size
        writer.writeObject(tournament2, docFields, docFields.version.def);
        const buf = writer._buffer.slice(0, writer._position);

        const reader = createSerializer(buf);
        const result = reader.readObject(docFields);

        expect(result.version).toBe(13);
        expect(result).toMatchObject(tournament2);
    });
});
