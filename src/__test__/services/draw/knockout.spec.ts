import { Draw, KNOCKOUT, Match, PlayerIn } from "../../../domain/draw";
import type { Player } from "../../../domain/player";
import type { TEvent } from "../../../domain/tournament";
import { GenerateType } from "../../../services/draw/drawLib";
import { Knockout } from "../../../services/draw/knockout";
import { findDrawPlayersOrQ } from "../../../services/drawService";
import { onlyDefined } from "../../../services/util/object";

const EVENT: TEvent = { id: 'E0', name: 'event1', sexe: 'H', category: 11, maxRank: '15/1', draws: [] };

const DRAW: Draw = { id: 'D0', name: 'draw1', type: KNOCKOUT, minRank: 'NC', maxRank: '30/4', nbColumn: 3, nbOut: 2, boxes: [] };

const PLAYER1: Player = { id: "J1", name: "Albert", sexe: "H", rank: "NC", registration: [] };
const PLAYER2: Player = { id: "J2", name: "Bernard", sexe: "H", rank: "30/5", registration: [] };
const PLAYER3: Player = { id: "J3", name: "Claude", sexe: "H", rank: "30/4", registration: [] };
const PLAYER4: Player = { id: "J4", name: "Daniel", sexe: "H", rank: "30/3", registration: [] };

function mainFields(box: PlayerIn | Match) {
    const playerIn = box as PlayerIn;
    const match = box as Match;
    return onlyDefined({
        position: box.position,
        order: playerIn.order,
        seeded: playerIn.seeded,
        qualifIn: playerIn.qualifIn,
        playerId: box.playerId,
        score: match.score,
        qualifOut: match.qualifOut,
    });
}

describe("Knockout lib service", () => {
    describe("generateDraw create", () => {
        const draw1: Draw = { ...DRAW, nbColumn: 3, nbOut: 1, boxes:[
            { position: 0, qualifOut: 1, playerId: 'J4'}
        ] };

        it('should create new draw with players', () => {
            const event1: TEvent = { ...EVENT }; // no draw
            const lib = new Knockout(event1, draw1);

            const draws = lib.generateDraw(GenerateType.Create, [PLAYER1, PLAYER2, PLAYER3]);

            expect(draws.length).toBe(1);
            expect(draws[0].boxes /*.map(mainFields) */).toStrictEqual([
                { position: 0, score: "", qualifOut: 1 },
                { position: 2, playerId: "J3", order: 3, seeded: 1 },
                { position: 1, score: "" },
                { position: 3, playerId: "J2", order: 2, seeded: 2 },
                { position: 4, playerId: "J1", order: 1 },
            ]);
        });

        it('should create draw with Q and players', () => {
            const event1: TEvent = { ...EVENT }; // no draw
            const lib = new Knockout(event1, draw1);

            const draws = lib.generateDraw(GenerateType.Create, [1, PLAYER2, PLAYER3]);

            expect(draws.length).toBe(1);
            expect(draws[0].boxes /*.map(mainFields) */).toStrictEqual([
                { position: 0, score: "", qualifOut: 1 },
                { position: 2, playerId: "J3", order: 3, seeded: 1 },
                { position: 1, score: "" },
                { position: 3, playerId: "J2", order: 2, seeded: 2 },
                { position: 4, qualifIn: 1, order: 1 },
            ]);
        });

        it('should create draw with Q and known players', () => {
            const event1: TEvent = { ...EVENT, draws: [draw1] };
            const lib = new Knockout(event1, draw1);

            const draws = lib.generateDraw(GenerateType.Create, [1, PLAYER2, PLAYER3]);

            expect(draws.length).toBe(1);
            expect(draws[0].boxes /*.map(mainFields) */).toStrictEqual([
                { position: 0, score: "", qualifOut: 1 },
                { position: 2, playerId: "J3", order: 3, seeded: 1 },
                { position: 1, score: "" },
                { position: 3, playerId: "J2", order: 2, seeded: 2 },
                { position: 4, playerID: "J4", qualifIn: 1, order: 1 },
            ]);
        });
    });

    describe("generateDraw mix", () => {

        it('shuffle players with same rank', () => {

            const draw1: Draw = {
                ...DRAW, id:'D1', boxes: [
                    { position: 1, qualifOut: 1, playerId: 'J1' } // qualifOut for draw2
                ]
            };
            const draw2: Draw = {
                ...DRAW, id:'D2', nbColumn: 2, nbOut: 2, boxes: [
                    { position: 1, score: '', qualifOut: 2 },
                    { position: 2, score: '', qualifOut: 1, date: new Date('2022-10-09T16:30') },
                    { position: 3, playerId: 'J3', seeded: 1 },
                    { position: 4, qualifIn: 2 },
                    { position: 5, playerId: 'J2' },
                    { position: 6, playerId: 'J1', qualifIn: 1 },
                ]
            };
            const event1: TEvent = { ...EVENT, draws: [draw1, draw2] };

            const lib = new Knockout(event1, draw2);
            const drawPlayers = findDrawPlayersOrQ(draw2, [PLAYER1, PLAYER2, PLAYER3]);
            expect(drawPlayers).toStrictEqual([PLAYER3, 2, PLAYER2, 1]);

            const draws = lib.generateDraw(GenerateType.Mix, drawPlayers);

            expect(draws.length).toBe(1);
            expect(draws[0].boxes /*.map(mainFields) */).toStrictEqual([
                { position: 2, score: '', qualifOut: 1 }, // loose the date
                { position: 1, score: '', qualifOut: 2 },
                { position: 6, order: 4, seeded: 1, playerId: 'J3' },
                { position: 3, order: 3, seeded: 2, playerId: 'J2' },
                { position: 4, order: 2, qualifIn: 2 },
                { position: 5, order: 1, qualifIn: 1, playerId: 'J1' },
            ]);
        });

    });
});
