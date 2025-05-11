import { KNOCKOUT } from "../domain/draw";
import { DEFAULT_SLOT_LENGTH, Tournament } from "../domain/tournament";
import { guid } from "../services/util/guid";
import fftType from '../services/fft';

export function emptyTournament() {
    return /* await reviveTournament */({ // TODO top await bug, prevent dynamic import and bundle
        version: 13,
        id: guid('T'),
        types: { name: 'FFT', versionTypes: 5 },
        _types: fftType,
        info: {
            name: 'no name',
            slotLength: DEFAULT_SLOT_LENGTH // minutes
        },
        players: [],
        events: [],
    });
}

export const mockTournament: Tournament = /* await reviveTournament */({
    version: 13,
    id: "T1",
    types: { name: 'FFT', versionTypes: 5 },
    _types: fftType,
    info: {
        name: "Test1",
        slotLength: 90 // minutes
    },
    players: [
        { id: "J0", name: "Albert", firstname: "René", sexe: "H", rank: "NC", registration: ["E0"], club: 'TROC' },
        { id: "J1", name: "Bernard", firstname: "et Bianca", sexe: "H", rank: "NC", registration: ["E0"] },
        { id: "J2", name: "Claude", firstname: "Mickaël", sexe: "H", rank: "30/4", registration: [] },
        { id: "J4", name: "Daniel", sexe: "H", rank: "30/3", registration: ["E0"] },
        { id: "J5", name: "Eloïse", sexe: "F", rank: "30/2", registration: ["E0", "E1"] },
        { id: "J6", name: "Françoise", sexe: "F", rank: "NC", registration: ["E1"] },
        { id: "J7", name: "Gérard", sexe: "H", rank: "30/3", registration: ["E0"] },
        { id: "J8", name: "Hubert", sexe: "H", rank: "30/3", registration: ["E0"] },
        { id: "J9", name: "Isidore", sexe: "H", rank: "30/3", registration: ["E0"] },
    ],
    events: [
        {
            id: "E0",
            name: "Messieurs - 4e série",
            sexe: "H",
            category: 11,
            maxRank: "30/1",
            color: "#dadaf9",
            draws: [
                {
                    id: "T00",
                    name: "NC",
                    minRank: "NC",
                    maxRank: "NC",
                    type: KNOCKOUT,
                    nbColumn: 2,
                    nbOut: 2,
                    boxes: [
                        { position: 6, playerId: "J0", qualifIn: 1, order: 2 },
                        { position: 2, date: new Date("2022-10-09T16:30"), qualifOut: 1, score: '' },
                        { position: 5, playerId: "J1", order: 3 },
                        { position: 4, qualifIn: 2, order: 4 },
                        { position: 1, score: '', qualifOut: 2 },
                        { position: 3, playerId: "J2", seeded: 1, order: 1 },
                    ],
                },
                // {
                //   id: "T01",
                //   name: "4e série",
                //   minRank: "40",
                //   maxRank: "30/1",
                //   type: FINAL,
                //   nbColumn: 3,
                //   nbOut: 1,
                //   boxes: [
                //     { position: 6, qualifIn:1, order:2 },
                //       { position: 2 , score:''},
                //     { position: 5, playerId: "J4", order:3 },
                //         { position: 0 , qualifOut: 1, score:''},
                //       { position: 1, playerId: "J5", seeded:1, order:1 },
                //   ],
                // },
            ],
        },
        {
            id: "E1",
            name: "Dames",
            sexe: "F",
            category: 11,
            maxRank: "30/1",
            color: "#f9dada",
            draws: [
            ]
        }
    ],
});
