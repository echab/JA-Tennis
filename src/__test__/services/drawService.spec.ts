import { groupDraw, previousGroup, nextGroup } from "../../services/drawService";
import { Draw, FINAL, KNOCKOUT } from "../../domain/draw";
import type { TEvent } from "../../domain/tournament";

const EVENT: TEvent = { id: 'E0', name: 'event1', sexe: 'H', category: 11, maxRank: 'NC', draws: [] };
const DRAW: Draw = { id: 'D0', name: 'draw1', type: KNOCKOUT, minRank: 'NC', maxRank: 'NC', nbColumn: 3, nbOut: 2, boxes: [] };

describe("drawService", () =>{

    describe("groupDrawIndex", () => {

        const event1: TEvent = { ...EVENT, draws: [
            {...DRAW, id:'D0'},
            {...DRAW, id:'D1'},
            {...DRAW, id:'D2'},
        ]};

        it("returns the first draw alone", () => {
            const result = groupDraw(event1, event1.draws[0].id);
            expect(result).toStrictEqual([0,1]);
        });

        it("returns the second draw alone", () => {
            const result = groupDraw(event1, event1.draws[1].id);
            expect(result).toStrictEqual([1,2]);
        });

        it("returns the first draw", () => {
            const result = groupDraw(event1, event1.draws[2].id);
            expect(result).toStrictEqual([2,3]);
        });

        const event2: TEvent = { ...EVENT, draws: [
            {...DRAW, id:'D0'},
            {...DRAW, id:'D1', cont: true},
            {...DRAW, id:'D2', cont: true},
            {...DRAW, id:'D3'},
            {...DRAW, id:'D4', cont: true},
            {...DRAW, id:'D5', cont: true},
            {...DRAW, id:'D6' },
            {...DRAW, id:'D7', type:FINAL},
        ]};

        it("returns the group of first draw", () => {
            const result = groupDraw(event2, event2.draws[0].id);
            expect(result).toStrictEqual([0,3]);
        });

        it("returns the group of second draw", () => {
            const result = groupDraw(event2, event2.draws[1].id);
            expect(result).toStrictEqual([0,3]);
        });

        it("returns the group of third draw", () => {
            const result = groupDraw(event2, event2.draws[2].id);
            expect(result).toStrictEqual([0,3]);
        });

        it("returns the second group of first draw", () => {
            const result = groupDraw(event2, event2.draws[3].id);
            expect(result).toStrictEqual([3,6]);
        });

        it("returns the second group of second draw", () => {
            const result = groupDraw(event2, event2.draws[4].id);
            expect(result).toStrictEqual([3,6]);
        });

        it("returns the second group of third draw", () => {
            const result = groupDraw(event2, event2.draws[5].id);
            expect(result).toStrictEqual([3,6]);
        });

        it("returns the third group of draw alone", () => {
            const result = groupDraw(event2, event2.draws[6].id);
            expect(result).toStrictEqual([6,7]);
        });

        it("returns the fourth group of final draw", () => {
            const result = groupDraw(event2, event2.draws[7].id);
            expect(result).toStrictEqual([7,8]);
        });

        const event3: TEvent = { ...EVENT, draws: [
            {...DRAW, id:'D0'},
            {...DRAW, id:'D1', cont: true},
            {...DRAW, id:'D2', cont: true},
        ]};

        it("returns the single group of first draw", () => {
            const result = groupDraw(event3, event3.draws[0].id);
            expect(result).toStrictEqual([0,3]);
        });

        it("returns the single group of second draw", () => {
            const result = groupDraw(event3, event3.draws[1].id);
            expect(result).toStrictEqual([0,3]);
        });

        it("returns the single group of third draw", () => {
            const result = groupDraw(event3, event3.draws[2].id);
            expect(result).toStrictEqual([0,3]);
        });
    });

    describe("previousGroupIndex", () => {

        const event1: TEvent = { ...EVENT, draws: [
            {...DRAW, id:'D0'},
            {...DRAW, id:'D1'},
        ]};

        it("returns nothing for the first draw", () => {
            const result = previousGroup(event1, event1.draws[0].id);
            expect(result).toBe(undefined)
        });

        it("returns the first draw alone", () => {
            const result = previousGroup(event1, event1.draws[1].id);
            expect(result).toStrictEqual([0,1]);
        });

        const event2: TEvent = { ...EVENT, draws: [
            {...DRAW, id:'D0'},
            {...DRAW, id:'D1', cont: true},
            {...DRAW, id:'D2', cont: true},
            {...DRAW, id:'D3'},
            {...DRAW, id:'D4', cont: true},
            {...DRAW, id:'D5', cont: true},
            {...DRAW, id:'D6' },
            {...DRAW, id:'D7', type:FINAL},
        ]};

        it("returns nothing for first group", () => {
            const result = previousGroup(event2, event2.draws[1].id);
            expect(result).toBe(undefined);
        });

        it("returns the first group for third draw", () => {
            const result = previousGroup(event2, event2.draws[3].id);
            expect(result).toStrictEqual([0,3]);
        });

        it("returns the first group for fourth draw", () => {
            const result = previousGroup(event2, event2.draws[4].id);
            expect(result).toStrictEqual([0,3]);
        });

    });

    describe("nextGroupIndex", () => {

        const event1: TEvent = { ...EVENT, draws: [
            {...DRAW, id:'D0'},
            {...DRAW, id:'D1'},
        ]};

        it("returns the first draw alone", () => {
            const result = nextGroup(event1, event1.draws[0].id);
            expect(result).toStrictEqual([1,2]);
        });

        it("returns nothing for the last draw", () => {
            const result = nextGroup(event1, event1.draws[1].id);
            expect(result).toBe(undefined)
        });

        const event2: TEvent = { ...EVENT, draws: [
            {...DRAW, id:'D0'},
            {...DRAW, id:'D1', cont: true},
            {...DRAW, id:'D2', cont: true},
            {...DRAW, id:'D3'},
            {...DRAW, id:'D4', cont: true},
            {...DRAW, id:'D5', cont: true},
            {...DRAW, id:'D6' },
            {...DRAW, id:'D7', type:FINAL},
        ]};

        it("returns the second group for first draw", () => {
            const result = nextGroup(event2, event2.draws[0].id);
            expect(result).toStrictEqual([3,6]);
        });

        it("returns the first group for third draw", () => {
            const result = nextGroup(event2, event2.draws[2].id);
            expect(result).toStrictEqual([3,6]);
        });

        it("returns nothing for last group", () => {
            const result = nextGroup(event2, event2.draws[7].id);
            expect(result).toBe(undefined);
        });
    });
});