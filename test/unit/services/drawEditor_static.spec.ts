import { DrawEditor } from '../../../src/services/drawEditor';
import { RankFFT } from '../../../src/services/fft/rank';

const enum _DrawType { Normal, Final, PouleSimple, PouleAR }     //TODO: redeclared as custom_typings/draw.d.ts is not working

describe('drawEditor static', () => {

    var player1: Player = {
        id: 'p1',
        name: 'P1',
        rank: 'NC',
        registration: ['e1']
    };

    var event1: TEvent = {
        id: 'e1',
        name: 'TEvent 1',
        sexe: 'H',
        category: 'Senior',
        maxRank: '30/1',
        draws: [
            draw1
        ]
    };

    var draw1: Draw = {
        id: 'd1', name: 'draw1',
        type: <any>_DrawType.Normal,
        minRank: 'NC', maxRank: '40',
        nbColumn: 3, nbOut: 1,
        boxes: [],
        _event: event1
    };

    var tournament1: Tournament = {
        id: 't1', info: { name: 'Tournament 1' },
        players: [
            player1
        ],
        events: [
            event1
        ]
    };
    event1._tournament = tournament1;

    it('should create new draw', () => {
        //TODO DrawEditor.newDraw()
    });

    it('should create new draw from existing', () => {
        //TODO DrawEditor.newDraw()
    });

    it('should init draw', () => {
        //DrawEditor.initDraw()
    });

    it('should reset draw', () => {
        //DrawEditor.resetDraw()
    });

    it('should create new box', () => {
        var box1 = DrawEditor.newBox(draw1, undefined, 1);
        expect(box1.position).toBe(1);
        expect(box1._draw).toBe(draw1);
        expect(box1._player).toBeUndefined();

        box1.aware = true;

        var box2 = DrawEditor.newBox(draw1, box1);
        expect(box2.position).toBe(1);
        expect(box2.aware).toBeTruthy();

        box2 = DrawEditor.newBox(draw1, box1, 2);
        expect(box2.position).toBe(2);
        expect(box2.aware).toBeTruthy();
    });

    it('should init a box', () => {
        var box1: Box = {
            id: 'b1',
            position: 1,
            playerId: player1.id
        };
        DrawEditor.initBox(box1, draw1);
        expect(box1._draw).toBe(draw1);
        expect(box1._player).toBe(player1);
    });

    it('should return the group of a draw', () => {
    });

    it('should return the prev group of a draw', () => {
    });

    it('should return the next group of a draw', () => {
    });

    it('should find a seeded into a draw', () => {
    });

    it('should find a in-player into a draw', () => {
    });

    it('should find a out-player into a draw', () => {
    });

    it('should put a player into a box', () => {
    });

    it('should set the result of a match', () => {
    });

    it('should put a slot of a match', () => {
    });

    it('should remove a slot of a match', () => {
    });

    it('should put marks for a match', () => {
    });

    it('should unschedule a player', () => {
    });

    it('should put a seeded into a box', () => {
    });

    it('should fill correctly a box', () => {
    });

    it('should move a player', () => {
    });

    it('should sort the players by rank (qualif first)', () => {
    });

    it('should retreive registered player for a draw', () => {
    });


}); 