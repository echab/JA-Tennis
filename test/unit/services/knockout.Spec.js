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
        type: models.DrawType.Normal,
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
