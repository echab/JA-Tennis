/// <reference path="../../../../custom_typings/draw.d.ts" />

import { Knockout } from '../../../../src/services/draw/knockout';
import { KnockoutLib as knockoutLib } from '../../../../src/services/draw/knockoutLib';
import { DrawEditor } from '../../../../src/services/drawEditor';
import { TournamentEditor } from '../../../../src/services/tournamentEditor';
import { rank } from '../../../../src/services/types'

describe('services.knockout', () => {
    var knockout: Knockout;

    beforeEach(() => {    //inject before each "it
        knockout = new Knockout();
    });

    var draw1: Draw = {
        id: 'd1', name: 'draw1',
        type: DrawType.Normal,
        minRank: 'NC', maxRank: '40',
        nbColumn: 3, nbOut: 1,
        boxes: []
    };

    it('should return minimum column count for a player count', () => {

        expect(knockout.nbColumnForPlayers(<Draw>{ nbOut: 1 }, 2)).toBe(2);
        expect(knockout.nbColumnForPlayers(<Draw>{ nbOut: 1 }, 3)).toBe(3);
        expect(knockout.nbColumnForPlayers(<Draw>{ nbOut: 1 }, 4)).toBe(3);
        expect(knockout.nbColumnForPlayers(<Draw>{ nbOut: 1 }, 5)).toBe(4);

        expect(knockout.nbColumnForPlayers(<Draw>{ nbOut: 2 }, 3)).toBe(2);
        expect(knockout.nbColumnForPlayers(<Draw>{ nbOut: 2 }, 4)).toBe(2);
        expect(knockout.nbColumnForPlayers(<Draw>{ nbOut: 2 }, 5)).toBe(3);
    });

    it('should compute partieQ', () => {
        expect(knockout.iPartieQ(0, 1)).toBe(0);
        expect(knockout.iPartieQ(1, 1)).toBe(0);
        expect(knockout.iPartieQ(2, 1)).toBe(0);
        expect(knockout.iPartieQ(3, 1)).toBe(0);
        expect(knockout.iPartieQ(4, 1)).toBe(0);
        expect(knockout.iPartieQ(5, 1)).toBe(0);
        expect(knockout.iPartieQ(6, 1)).toBe(0);

        //expect(() => knockout.iPartieQ(0, 2)).toThrow('Assertion is false');
        expect(knockout.iPartieQ(1, 2)).toBe(0);
        expect(knockout.iPartieQ(2, 2)).toBe(1);
        expect(knockout.iPartieQ(3, 2)).toBe(0);
        expect(knockout.iPartieQ(4, 2)).toBe(0);
        expect(knockout.iPartieQ(5, 2)).toBe(1);
        expect(knockout.iPartieQ(6, 2)).toBe(1);

        //expect(() => knockout.iPartieQ(0, 3)).toThrow('Assertion is false');
        //expect(() => knockout.iPartieQ(1, 3)).toThrow('Assertion is false');
        //expect(() => knockout.iPartieQ(2, 3)).toThrow('Assertion is false');
        expect(knockout.iPartieQ(3, 3)).toBe(-1);
        expect(knockout.iPartieQ(4, 3)).toBe(0);
        expect(knockout.iPartieQ(5, 3)).toBe(1);
        expect(knockout.iPartieQ(6, 3)).toBe(2);
        expect(knockout.iPartieQ(7, 3)).toBe(-1);
        expect(knockout.iPartieQ(8, 3)).toBe(-1);
        expect(knockout.iPartieQ(9, 3)).toBe(0);
        expect(knockout.iPartieQ(10, 3)).toBe(0);
        expect(knockout.iPartieQ(11, 3)).toBe(1);
        expect(knockout.iPartieQ(12, 3)).toBe(1);
        expect(knockout.iPartieQ(13, 3)).toBe(2);
        expect(knockout.iPartieQ(14, 3)).toBe(2);

        //expect(() => knockout.iPartieQ(1, 4)).toThrow('Assertion is false');
        //expect(() => knockout.iPartieQ(2, 4)).toThrow('Assertion is false');
        expect(knockout.iPartieQ(3, 4)).toBe(0);
        expect(knockout.iPartieQ(4, 4)).toBe(1);
        expect(knockout.iPartieQ(5, 4)).toBe(2);
        expect(knockout.iPartieQ(6, 4)).toBe(3);
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
        expect(knockout.computeScore(draw1)).toBeTruthy();
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
