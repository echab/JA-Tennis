'use strict';

describe('services.knockout', () => {
    var knockout: jat.service.Knockout;

    beforeEach(module('jat.services.knockout'));
    beforeEach(module('jat.services.type'));
    beforeEach(inject((_knockoutLib_: jat.service.Knockout) => {    //inject before each "it
        knockout = _knockoutLib_;
    }));

    var draw1: models.Draw = {
        id: 'd1', name: 'draw1',
        type: models.DrawType.Normal,
        minRank: 'NC', maxRank: '40',
        nbColumn: 3, nbOut: 1,
        boxes: []
    };

    it('should return minimum column count for a player count', () => {

        expect(knockout.nbColumnForPlayers(<models.Draw>{ nbOut: 1 }, 2)).toBe(2);
        expect(knockout.nbColumnForPlayers(<models.Draw>{ nbOut: 1 }, 3)).toBe(3);
        expect(knockout.nbColumnForPlayers(<models.Draw>{ nbOut: 1 }, 4)).toBe(3);
        expect(knockout.nbColumnForPlayers(<models.Draw>{ nbOut: 1 }, 5)).toBe(4);

        expect(knockout.nbColumnForPlayers(<models.Draw>{ nbOut: 2 }, 3)).toBe(2);
        expect(knockout.nbColumnForPlayers(<models.Draw>{ nbOut: 2 }, 4)).toBe(2);
        expect(knockout.nbColumnForPlayers(<models.Draw>{ nbOut: 2 }, 5)).toBe(3);
    });

    it('should resize', () => {
        //TODO
    });

    it('should generate draw from registred players', () => {
        //TODO
    });

    it('should generate draw from existing players (mix)', () => {
        //TODO
    });

    it('should generate draw from existing players (plus echelonné)', () => {
        //TODO
    });

    it('should generate draw from existing players (plus en ligne)', () => {
        //TODO
    });

    it('should compute ranking', () => {
        expect(knockout.CalculeScore(draw1)).toBeTruthy();
    });

    it('should set in-player', () => {
        //knockout.SetQualifieEntrant()
    });

    it('should set out-player', () => {
        //knockout.SetQualifieSortant()
    });

    it('should find in-player', () => {
        //knockout.FindQualifieEntrant()
    });

    it('should find out-player', () => {
        //knockout.FindQualifieSortant()
    });

});
