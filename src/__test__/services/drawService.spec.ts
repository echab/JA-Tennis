import { groupDraw, previousGroup, nextGroup } from "../../services/drawService";
import { Draw, DrawType } from "../../domain/draw";
import { TEvent } from "../../domain/tournament";

const EVENT: TEvent = {id:'E0', name:'event1', sexe:'H', category:'Senior', maxRank:'NC', draws:[]};
const DRAW: Draw = { id:'D0', name:'draw1', type:DrawType.Normal, minRank:'NC', maxRank:'NC', nbColumn:3, nbOut:2, boxes:[]};

const ids = ({id}: {id:string}) => id;

describe("drawService", () =>{

    describe("groupDrawIndex", () => {

        const event1 = { ...EVENT, draws: [
            {...DRAW, id:'D0'},
            {...DRAW, id:'D1'},
            {...DRAW, id:'D2'},
        ]};

        it("returns the first draw alone", () => {
            const result = groupDraw(event1, event1.draws[0]);
            expect(result).toStrictEqual([0,1]);
        });

        it("returns the second draw alone", () => {
            const result = groupDraw(event1, event1.draws[1]);
            expect(result).toStrictEqual([1,2]);
        });

        it("returns the first draw", () => {
            const result = groupDraw(event1, event1.draws[2]);
            expect(result).toStrictEqual([2,3]);
        });

        const event2 = { ...EVENT, draws: [
            {...DRAW, id:'D0'},
            {...DRAW, id:'D1', suite: true},
            {...DRAW, id:'D2', suite: true},
            {...DRAW, id:'D3'},
            {...DRAW, id:'D4', suite: true},
            {...DRAW, id:'D5', suite: true},
            {...DRAW, id:'D6' },
            {...DRAW, id:'D7', type:DrawType.Final},
        ]};

        it("returns the group of first draw", () => {
            const result = groupDraw(event2, event2.draws[0]);
            expect(result).toStrictEqual([0,3]);
        });

        it("returns the group of second draw", () => {
            const result = groupDraw(event2, event2.draws[1]);
            expect(result).toStrictEqual([0,3]);
        });

        it("returns the group of third draw", () => {
            const result = groupDraw(event2, event2.draws[2]);
            expect(result).toStrictEqual([0,3]);
        });


        it("returns the second group of first draw", () => {
            const result = groupDraw(event2, event2.draws[3]);
            expect(result).toStrictEqual([3,6]);
        });

        it("returns the second group of second draw", () => {
            const result = groupDraw(event2, event2.draws[4]);
            expect(result).toStrictEqual([3,6]);
        });

        it("returns the second group of third draw", () => {
            const result = groupDraw(event2, event2.draws[5]);
            expect(result).toStrictEqual([3,6]);
        });

        it("returns the third group of draw alone", () => {
            const result = groupDraw(event2, event2.draws[6]);
            expect(result).toStrictEqual([6,7]);
        });

        it("returns the fourth group of final draw", () => {
            const result = groupDraw(event2, event2.draws[7]);
            expect(result).toStrictEqual([7,8]);
        });

        const event3 = { ...EVENT, draws: [
            {...DRAW, id:'D0'},
            {...DRAW, id:'D1', suite: true},
            {...DRAW, id:'D2', suite: true},
        ]};

        it("returns the single group of first draw", () => {
            const result = groupDraw(event3, event3.draws[0]);
            expect(result).toStrictEqual([0,3]);
        });

        it("returns the single group of second draw", () => {
            const result = groupDraw(event3, event3.draws[1]);
            expect(result).toStrictEqual([0,3]);
        });

        it("returns the single group of third draw", () => {
            const result = groupDraw(event3, event3.draws[2]);
            expect(result).toStrictEqual([0,3]);
        });
    });

    describe("previousGroupIndex", () => {

        const event1 = { ...EVENT, draws: [
            {...DRAW, id:'D0'},
            {...DRAW, id:'D1'},
        ]};

        it("returns nothing for the first draw", () => {
            const result = previousGroup(event1, event1.draws[0]);
            expect(result).toBe(undefined)
        });

        it("returns the first draw alone", () => {
            const result = previousGroup(event1, event1.draws[1]);
            expect(result).toStrictEqual([0,1]);
        });

        const event2 = { ...EVENT, draws: [
            {...DRAW, id:'D0'},
            {...DRAW, id:'D1', suite: true},
            {...DRAW, id:'D2', suite: true},
            {...DRAW, id:'D3'},
            {...DRAW, id:'D4', suite: true},
            {...DRAW, id:'D5', suite: true},
            {...DRAW, id:'D6' },
            {...DRAW, id:'D7', type:DrawType.Final},
        ]};

        it("returns nothing for first group", () => {
            const result = previousGroup(event2, event2.draws[1]);
            expect(result).toBe(undefined);
        });

        it("returns the first group for third draw", () => {
            const result = previousGroup(event2, event2.draws[3]);
            expect(result).toStrictEqual([0,3]);
        });

        it("returns the first group for fourth draw", () => {
            const result = previousGroup(event2, event2.draws[4]);
            expect(result).toStrictEqual([0,3]);
        });

    });

    describe("nextGroupIndex", () => {

        const event1 = { ...EVENT, draws: [
            {...DRAW, id:'D0'},
            {...DRAW, id:'D1'},
        ]};

        it("returns the first draw alone", () => {
            const result = nextGroup(event1, event1.draws[0]);
            expect(result).toStrictEqual([1,2]);
        });

        it("returns nothing for the last draw", () => {
            const result = nextGroup(event1, event1.draws[1]);
            expect(result).toBe(undefined)
        });

        const event2 = { ...EVENT, draws: [
            {...DRAW, id:'D0'},
            {...DRAW, id:'D1', suite: true},
            {...DRAW, id:'D2', suite: true},
            {...DRAW, id:'D3'},
            {...DRAW, id:'D4', suite: true},
            {...DRAW, id:'D5', suite: true},
            {...DRAW, id:'D6' },
            {...DRAW, id:'D7', type:DrawType.Final},
        ]};

        it("returns the second group for first draw", () => {
            const result = nextGroup(event2, event2.draws[0]);
            expect(result).toStrictEqual([3,6]);
        });

        it("returns the first group for third draw", () => {
            const result = nextGroup(event2, event2.draws[2]);
            expect(result).toStrictEqual([3,6]);
        });

        it("returns nothing for last group", () => {
            const result = nextGroup(event2, event2.draws[7]);
            expect(result).toBe(undefined);
        });
    });
});