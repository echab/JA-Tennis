/// <reference path="../../../../custom_typings/draw.d.ts" />

import { Roundrobin } from '../../../../src/services/draw/roundrobin';
import { DrawEditor } from '../../../../src/services/drawEditor';
import { TournamentEditor } from '../../../../src/services/tournamentEditor';
import { ranking } from '../../../../src/services/types'

describe('services.roundrobin', () => {
    var roundrobin: Roundrobin;

    beforeEach( () => {    //inject before each "it
        roundrobin = new Roundrobin();
    });

    var draw1: Draw = {
        id: 'd1', name: 'draw1',
        type: DrawType.PouleSimple,
        minRank: 'NC', maxRank: '40',
        nbColumn: 4, nbOut: 1,
        boxes: []
    };

    it('should return minimum column count for a player count', () => {

        expect(roundrobin.nbColumnForPlayers(draw1, 2)).toBe(2);
        expect(roundrobin.nbColumnForPlayers(draw1, 3)).toBe(3);
        expect(roundrobin.nbColumnForPlayers(draw1, 4)).toBe(4);
        expect(roundrobin.nbColumnForPlayers(draw1, 5)).toBe(5);

        expect(roundrobin.nbColumnForPlayers(draw1, 3)).toBe(3);
        expect(roundrobin.nbColumnForPlayers(draw1, 4)).toBe(4);
        expect(roundrobin.nbColumnForPlayers(draw1, 5)).toBe(5);
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

    it('should compute ranking', () => {
        //expect(roundrobin.CalculeScore(draw1)).toBeTruthy();
    });

    it('should set in-player', () => {
        //roundrobin.SetQualifieEntrant()
    });

    it('should set out-player', () => {
        //roundrobin.SetQualifieSortant()
    });

    it('should find in-player', () => {
        //roundrobin.FindQualifieEntrant()
    });

    it('should find out-player', () => {
        //roundrobin.FindQualifieSortant()
    });

});
