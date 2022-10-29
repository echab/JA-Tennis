import { Draw, DrawType, Match, PlayerIn } from "../../../domain/draw";
import type { Player } from "../../../domain/player";
import type { TEvent } from "../../../domain/tournament";
import { GenerateType } from "../../../services/draw/drawLib";
import { Knockout } from "../../../services/draw/knockout";
import { onlyDefined } from "../../../services/util/object";

const EVENT: TEvent = { id: 'E0', name: 'event1', sexe: 'H', category: 'Senior', maxRank: '15/1', draws: [] };

const DRAW: Draw = { id: 'D0', name: 'draw1', type: DrawType.Normal, minRank: 'NC', maxRank: '30/4', nbColumn: 3, nbOut: 2, boxes: [] };

const PLAYER1: Player = { id: "J0", name: "Albert", sexe: "H", rank: "NC", registration: [] };
const PLAYER2: Player = { id: "J1", name: "Bernard", sexe: "H", rank: "30/5", registration: [] };
const PLAYER3: Player = { id: "J2", name: "Claude", sexe: "H", rank: "30/4", registration: [] };
const PLAYER4: Player = { id: "J3", name: "Daniel", sexe: "H", rank: "30/3", registration: [] };

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
    describe("generateDraw", () => {
        const event1: TEvent = { ...EVENT };

        const draw1: Draw = { ...DRAW, nbColumn: 3, nbOut: 1 };

        const lib = new Knockout(event1, draw1);

        it('should create new draw with players', () => {
            const draws = lib.generateDraw(GenerateType.Create, [PLAYER1, PLAYER2, PLAYER3]);

            expect(draws.length).toBe(1);
            expect(draws[0].boxes /*.map(mainFields) */).toStrictEqual([
                { position: 0, score: "", qualifOut: 1 },
                { position: 2, playerId: "J2", order: 3, seeded: 1 },
                { position: 1, score: "" },
                { position: 3, playerId: "J1", order: 2, seeded: 2 },
                { position: 4, playerId: "J0", order: 1 },
            ]);
        });

        it('should create draw with Q and players', () => {
            const draws = lib.generateDraw(GenerateType.Create, [1, PLAYER2, PLAYER3]);

            expect(draws.length).toBe(1);
            expect(draws[0].boxes /*.map(mainFields) */).toStrictEqual([
                { position: 0, score: "", qualifOut: 1 },
                { position: 2, playerId: "J2", order: 3, seeded: 1 },
                { position: 1, score: "" },
                { position: 3, qualifIn: 1, order: 2 },
                { position: 4, playerId: "J0", order: 1 },
            ]);
        });

    });
});
