'use strict';
describe('services.drawLib', function () {
    var drawLib;
    beforeEach(module('jat.services.drawLib'));
    beforeEach(module('jat.services.type'));
    beforeEach(inject(function (_drawLib_) {
        drawLib = _drawLib_;
    }));
    var player1 = {
        id: 'p1',
        name: 'P1',
        rank: 'NC',
        registration: ['e1']
    };
    var event1 = {
        id: 'e1',
        name: 'Event 1',
        sexe: 'H',
        category: 'Senior',
        maxRank: '30/1',
        draws: [
            draw1
        ]
    };
    var draw1 = {
        id: 'd1', name: 'draw1',
        type: models.DrawType.Normal,
        minRank: 'NC', maxRank: '40',
        nbColumn: 3, nbOut: 1,
        boxes: [],
        _event: event1
    };
    var tournament1 = {
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
    it('should create new draw', function () {
        //TODO drawLib.newDraw()
    });
    it('should create new draw from existing', function () {
        //TODO drawLib.newDraw()
    });
    it('should init draw', function () {
        //drawLib.initDraw()
    });
    it('should reset draw', function () {
        //drawLib.resetDraw()
    });
    it('should create new box', function () {
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
    it('should init a box', function () {
        var box1 = {
            id: 'b1',
            position: 1,
            playerId: player1.id
        };
        drawLib.initBox(box1, draw1);
        expect(box1._draw).toBe(draw1);
        expect(box1._player).toBe(player1);
    });
    it('should return the group of a draw', function () {
    });
    it('should return the prev group of a draw', function () {
    });
    it('should return the next group of a draw', function () {
    });
    it('should find a seeded into a draw', function () {
    });
    it('should find a in-player into a draw', function () {
    });
    it('should find a out-player into a draw', function () {
    });
    it('should put a player into a box', function () {
    });
    it('should set the result of a match', function () {
    });
    it('should put a slot of a match', function () {
    });
    it('should remove a slot of a match', function () {
    });
    it('should put marks for a match', function () {
    });
    it('should unschedule a player', function () {
    });
    it('should put a seeded into a box', function () {
    });
    it('should fill correctly a box', function () {
    });
    it('should move a player', function () {
    });
    it('should sort the players by rank (qualif first)', function () {
    });
    it('should retreive registered player for a draw', function () {
    });
});
