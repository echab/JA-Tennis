'use strict';
describe('services.knockout', function () {
    var knockout;

    beforeEach(module('jat.services.knockout'));
    beforeEach(module('jat.services.type'));
    beforeEach(inject(function (_knockout_) {
        knockout = _knockout_;
    }));

    var draw1 = {
        id: 'd1', name: 'draw1',
        type: 0 /* Normal */,
        minRank: 'NC', maxRank: '40',
        nbColumn: 3, nbOut: 1,
        boxes: []
    };

    it('should return minimum column count for a player count', function () {
        expect(knockout.nbColumnForPlayers({ nbOut: 1 }, 2)).toBe(2);
        expect(knockout.nbColumnForPlayers({ nbOut: 1 }, 3)).toBe(3);
        expect(knockout.nbColumnForPlayers({ nbOut: 1 }, 4)).toBe(3);
        expect(knockout.nbColumnForPlayers({ nbOut: 1 }, 5)).toBe(4);

        expect(knockout.nbColumnForPlayers({ nbOut: 2 }, 3)).toBe(2);
        expect(knockout.nbColumnForPlayers({ nbOut: 2 }, 4)).toBe(2);
        expect(knockout.nbColumnForPlayers({ nbOut: 2 }, 5)).toBe(3);
    });

    it('should compute partieQ', function () {
        expect(jat.service.iPartieQ(0, 1)).toBe(0);
        expect(jat.service.iPartieQ(1, 1)).toBe(0);
        expect(jat.service.iPartieQ(2, 1)).toBe(0);
        expect(jat.service.iPartieQ(3, 1)).toBe(0);
        expect(jat.service.iPartieQ(4, 1)).toBe(0);
        expect(jat.service.iPartieQ(5, 1)).toBe(0);
        expect(jat.service.iPartieQ(6, 1)).toBe(0);

        //expect(() => jat.service.iPartieQ(0, 2)).toThrow('Assertion is false');
        expect(jat.service.iPartieQ(1, 2)).toBe(0);
        expect(jat.service.iPartieQ(2, 2)).toBe(1);
        expect(jat.service.iPartieQ(3, 2)).toBe(0);
        expect(jat.service.iPartieQ(4, 2)).toBe(0);
        expect(jat.service.iPartieQ(5, 2)).toBe(1);
        expect(jat.service.iPartieQ(6, 2)).toBe(1);

        //expect(() => jat.service.iPartieQ(0, 3)).toThrow('Assertion is false');
        //expect(() => jat.service.iPartieQ(1, 3)).toThrow('Assertion is false');
        //expect(() => jat.service.iPartieQ(2, 3)).toThrow('Assertion is false');
        expect(jat.service.iPartieQ(3, 3)).toBe(-1);
        expect(jat.service.iPartieQ(4, 3)).toBe(0);
        expect(jat.service.iPartieQ(5, 3)).toBe(1);
        expect(jat.service.iPartieQ(6, 3)).toBe(2);
        expect(jat.service.iPartieQ(7, 3)).toBe(-1);
        expect(jat.service.iPartieQ(8, 3)).toBe(-1);
        expect(jat.service.iPartieQ(9, 3)).toBe(0);
        expect(jat.service.iPartieQ(10, 3)).toBe(0);
        expect(jat.service.iPartieQ(11, 3)).toBe(1);
        expect(jat.service.iPartieQ(12, 3)).toBe(1);
        expect(jat.service.iPartieQ(13, 3)).toBe(2);
        expect(jat.service.iPartieQ(14, 3)).toBe(2);

        //expect(() => jat.service.iPartieQ(1, 4)).toThrow('Assertion is false');
        //expect(() => jat.service.iPartieQ(2, 4)).toThrow('Assertion is false');
        expect(jat.service.iPartieQ(3, 4)).toBe(0);
        expect(jat.service.iPartieQ(4, 4)).toBe(1);
        expect(jat.service.iPartieQ(5, 4)).toBe(2);
        expect(jat.service.iPartieQ(6, 4)).toBe(3);
    });

    it('should resize', function () {
        //TODO
    });

    it('should generate draw from registred players', function () {
        //TODO
    });

    it('should generate draw from existing players (mix)', function () {
        //TODO
    });

    it('should generate draw from existing players (plus echelonné)', function () {
        //TODO
    });

    it('should generate draw from existing players (plus en ligne)', function () {
        //TODO
    });

    it('should compute ranking', function () {
        expect(knockout.CalculeScore(draw1)).toBeTruthy();
    });

    it('should set in-player', function () {
        //knockout.SetQualifieEntrant()
    });

    it('should set out-player', function () {
        //knockout.SetQualifieSortant()
    });

    it('should find in-player', function () {
        //knockout.FindQualifieEntrant()
    });

    it('should find out-player', function () {
        //knockout.FindQualifieSortant()
    });
});
//# sourceMappingURL=knockout.Spec.js.map
