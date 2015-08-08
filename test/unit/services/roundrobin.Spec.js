'use strict';
describe('services.roundrobin', function () {
    var roundrobin;
    beforeEach(module('jat.services.roundrobin'));
    beforeEach(module('jat.services.type'));
    beforeEach(inject(function (_roundrobin_) {
        roundrobin = _roundrobin_;
    }));
    var draw1 = {
        id: 'd1', name: 'draw1',
        type: models.DrawType.PouleSimple,
        minRank: 'NC', maxRank: '40',
        nbColumn: 4, nbOut: 1,
        boxes: []
    };
    it('should return minimum column count for a player count', function () {
        expect(roundrobin.nbColumnForPlayers(draw1, 2)).toBe(2);
        expect(roundrobin.nbColumnForPlayers(draw1, 3)).toBe(3);
        expect(roundrobin.nbColumnForPlayers(draw1, 4)).toBe(4);
        expect(roundrobin.nbColumnForPlayers(draw1, 5)).toBe(5);
        expect(roundrobin.nbColumnForPlayers(draw1, 3)).toBe(3);
        expect(roundrobin.nbColumnForPlayers(draw1, 4)).toBe(4);
        expect(roundrobin.nbColumnForPlayers(draw1, 5)).toBe(5);
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
    it('should compute ranking', function () {
        //expect(roundrobin.CalculeScore(draw1)).toBeTruthy();
    });
    it('should set in-player', function () {
        //roundrobin.SetQualifieEntrant()
    });
    it('should set out-player', function () {
        //roundrobin.SetQualifieSortant()
    });
    it('should find in-player', function () {
        //roundrobin.FindQualifieEntrant()
    });
    it('should find out-player', function () {
        //roundrobin.FindQualifieSortant()
    });
});
