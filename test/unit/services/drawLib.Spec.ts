'use strict';

describe('services.drawLib', () => {
    var drawLib: jat.service.DrawLib;

    beforeEach(module('jat.services.drawLib'));
    beforeEach(module('jat.services.type'));
    beforeEach(inject((_drawLib_: jat.service.DrawLib) => {    //inject before each "it
        drawLib = _drawLib_;
    }));

    var player1: models.Player = {
        id: 'p1',
        name: 'P1',
        rank: 'NC',
        registration: ['e1']
    };

    var event1: models.Event = {
        id: 'e1',
        name: 'Event 1',
        sexe: 'H',
        category: 'Senior',
        maxRank: '30/1',
        draws: [
            draw1
        ]
    };

    var draw1: models.Draw = {
        id: 'd1', name: 'draw1',
        type: models.DrawType.Normal,
        minRank: 'NC', maxRank: '40',
        nbColumn: 3, nbOut: 1,
        boxes: [],
        _event: event1
    };

    var tournament1: models.Tournament = {
        id: 't1', info: { name: 'Tournament 1' },
        players: [
            player1
        ],
        events: [
            event1
        ]
    };
    event1._tournament = tournament1;

    //it('should inject drawLib', () => {
    //    module('jat.services.drawLib');
    //    inject((_drawLib_: jat.service.DrawLib) => {
    //        drawLib = _drawLib_;
    //    });
    //});

    it('should create new draw', () => {
        //TODO drawLib.newDraw()
    });

    it('should create new draw from existing', () => {
        //TODO drawLib.newDraw()
    });

    it('should init draw', () => {
        //drawLib.initDraw()
    });

    it('should reset draw', () => {
        //drawLib.resetDraw()
    });

    it('should create new box', () => {
        var box1 = drawLib.newBox(draw1, undefined, 1);
        expect(box1.position).toBe(1);
        expect(box1._draw).toBe(draw1);
        expect(box1._player).toBeUndefined();

        box1.aware = true;

        var box2 = drawLib.newBox(draw1, box1);
        expect(box2.position).toBe(1);
        expect(box2.aware).toBeTruthy();

        box2 = drawLib.newBox(draw1, box1, 2);
        expect(box2.position).toBe(2);
        expect(box2.aware).toBeTruthy();
    });

    it('should init a box', () => {
        var box1: models.Box = {
            id: 'b1',
            position: 1,
            playerId: player1.id
        };
        drawLib.initBox(box1, draw1);
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