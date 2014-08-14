'use strict';
describe('services.mainLib', function () {
    var main, drawLib, undo, find, math;

    beforeEach(module('jat.services.mainLib'));
    beforeEach(module('jat.services.guid.mock'));
    beforeEach(module('math.mock'));

    beforeEach(inject(function (_mainLib_, _drawLib_, _undo_, _find_, _guid_, _math_) {
        main = _mainLib_;
        drawLib = _drawLib_;
        undo = _undo_;
        find = _find_;
        math = _math_;
    }));

    describe('Load/save', function () {
        it('should load a tournament from url', function () {
        });
    });

    describe('Players management', function () {
        var tournament1 = {
            id: 't1', info: { name: 'Tournament 1' },
            players: [],
            events: []
        };

        var player1 = { id: 'p1', name: 'Eloi', rank: '30/3', registration: [], _tournament: tournament1 };
        var player2 = { id: 'p2', name: 'Denis', rank: '4/6', registration: [], _tournament: tournament1 };

        //clean tournament1
        afterEach(function () {
            return tournament1.players.splice(0, tournament1.players.length);
        });

        it('should add player', function () {
            main.addPlayer(tournament1, player1);

            expect(tournament1.players.length).toBe(1);
            expect(tournament1.players[0].name).toBe('Eloi');
            expect(tournament1.players[0].rank).toBe('30/3');
        });

        it('should remove player', function () {
            //main.select(tournament1);
            tournament1.players.push(player1);

            main.removePlayer(player1);

            expect(tournament1.players.length).toBe(0);
        });

        it('should edit player', function () {
            //main.select(tournament1);
            tournament1.players.push(player1);

            main.editPlayer(player1, player2);

            expect(tournament1.players[0].name).toBe('Eloi');
            //main.doUndo();
            //expect(tournament1.players[0].name).toBe('Denis');
        });
    });

    describe('Events management', function () {
    });

    describe('Draws management', function () {
        var event1 = {
            id: 'e1', name: 'Simple messieurs', sexe: 'H', category: 'Senior', maxRank: '30/1',
            draws: []
        };
        var tournament1 = {
            id: 't1', info: { name: 'Tournament 1' },
            players: [
                { id: 'p1', name: 'Albert', rank: 'NC', registration: ['e1'] },
                { id: 'p2', name: 'Bernard', rank: 'NC', registration: ['e1'] },
                { id: 'p3', name: 'Claude', rank: 'NC', registration: ['e1'] },
                { id: 'p4', name: 'Daniel', rank: 'NC', registration: ['e1'] },
                { id: 'p5', name: 'Eloi', rank: '30/3', registration: ['e1'] },
                { id: 'p6', name: 'Frank', rank: '30/5', registration: ['e1'] }
            ],
            events: [event1]
        };
        event1._tournament = tournament1;

        describe('Draw generation new', function () {
            beforeEach(function () {
                return math.randomReturns([0.1, 0.8, 0.2]);
            });

            //clean event
            afterEach(function () {
                return event1.draws.splice(0, event1.draws.length);
            });

            it('should add a first knockout draw', function () {
                main.addDraw({ id: 'd1', name: 'draw1', type: 0 /* Normal */, minRank: 'NC', maxRank: 'NC', nbColumn: 3, nbOut: 1, boxes: undefined, _event: event1 });

                expect(event1.draws.length).toBe(1);
                var draw1 = event1.draws[0];
                expect(draw1.name).toBe('draw1');
            });

            it('should generate a first knockout draw', function () {
                main.addDraw({ id: 'd1', name: 'draw1', type: 0 /* Normal */, minRank: 'NC', maxRank: 'NC', nbColumn: 3, nbOut: 1, boxes: undefined, _event: event1 }, 1 /* Create */);

                expect(event1.draws.length).toBe(1);
                var draw1 = event1.draws[0];
                expect(draw1.type).toBe(0 /* Normal */);
                expect(draw1.boxes).toBeDefined();
                expect(draw1.boxes.length).toBe(7);

                var boxIn = find.by(draw1.boxes, 'position', 6);
                expect(boxIn._player.name).toBe('Claude');

                boxIn = find.by(draw1.boxes, 'position', 5);
                expect(boxIn._player.name).toBe('Bernard');

                boxIn = find.by(draw1.boxes, 'position', 4);
                expect(boxIn._player.name).toBe('Daniel');

                boxIn = find.by(draw1.boxes, 'position', 3);
                expect(boxIn._player.name).toBe('Albert');

                var boxOut = find.by(draw1.boxes, 'position', 0);
                expect(boxOut.qualifOut).toBe(1);
            });

            it('should generate a first knockout draw with 2 Q', function () {
                main.addDraw({ id: 'd1', name: 'draw1', type: 0 /* Normal */, minRank: 'NC', maxRank: 'NC', nbColumn: 2, nbOut: 2, boxes: undefined, _event: event1 }, 1 /* Create */);

                expect(event1.draws.length).toBe(1);
                var draw1 = event1.draws[0];
                expect(draw1.type).toBe(0 /* Normal */);
                expect(draw1.boxes).toBeDefined();
                expect(draw1.boxes.length).toBe(6);

                var boxIn = find.by(draw1.boxes, 'position', 6);
                expect(boxIn._player.name).toBe('Claude');

                boxIn = find.by(draw1.boxes, 'position', 5);
                expect(boxIn._player.name).toBe('Bernard');

                boxIn = find.by(draw1.boxes, 'position', 4);
                expect(boxIn._player.name).toBe('Daniel');

                boxIn = find.by(draw1.boxes, 'position', 3);
                expect(boxIn._player.name).toBe('Albert');

                var boxOut = find.by(draw1.boxes, 'position', 2);
                expect(boxOut.qualifOut).toBe(1);

                boxOut = find.by(draw1.boxes, 'position', 1);
                expect(boxOut.qualifOut).toBe(2);
            });

            it('should generate a first roundrobin draw', function () {
                main.addDraw({ id: 'd1', name: 'poule', type: 2 /* PouleSimple */, minRank: 'NC', maxRank: 'NC', nbColumn: 4, nbOut: 1, boxes: undefined, _event: event1 }, 1 /* Create */);

                expect(event1.draws.length).toBe(1);
                var draw1 = event1.draws[0];
                expect(draw1.type).toBe(2 /* PouleSimple */);
                expect(draw1.suite).toBeFalsy();
                expect(draw1.boxes).toBeDefined();
                expect(draw1.boxes.length).toBe(10);

                var boxIn = find.by(draw1.boxes, 'position', 19);
                expect(boxIn._player.name).toBe('Bernard');
                expect(boxIn.seeded).toBe(1);

                boxIn = find.by(draw1.boxes, 'position', 18);
                expect(boxIn._player.name).toBe('Daniel');

                boxIn = find.by(draw1.boxes, 'position', 17);
                expect(boxIn._player.name).toBe('Albert');

                boxIn = find.by(draw1.boxes, 'position', 16);
                expect(boxIn._player.name).toBe('Claude');
            });

            it('should generate first two roundrobin draw', function () {
                main.addDraw({ id: 'd1', name: 'poule', type: 2 /* PouleSimple */, minRank: 'NC', maxRank: 'NC', nbColumn: 2, nbOut: 1, boxes: undefined, _event: event1 }, 1 /* Create */);

                expect(event1.draws.length).toBe(2);

                var draw1 = event1.draws[0];
                expect(draw1.type).toBe(2 /* PouleSimple */);
                expect(draw1.suite).toBeFalsy();
                expect(draw1.boxes).toBeDefined();
                expect(draw1.boxes.length).toBe(3);

                var boxIn = find.by(draw1.boxes, 'position', 5);
                expect(boxIn._player.name).toBe('Bernard');
                expect(boxIn.seeded).toBe(1);

                boxIn = find.by(draw1.boxes, 'position', 4);
                expect(boxIn._player.name).toBe('Albert');

                var draw2 = event1.draws[1];
                expect(draw2.type).toBe(2 /* PouleSimple */);
                expect(draw2.suite).toBeTruthy();
                expect(draw2.boxes).toBeDefined();
                expect(draw2.boxes.length).toBe(3);

                boxIn = find.by(draw2.boxes, 'position', 5);
                expect(boxIn._player.name).toBe('Daniel');
                expect(boxIn.seeded).toBe(2);

                boxIn = find.by(draw2.boxes, 'position', 4);
                expect(boxIn._player.name).toBe('Claude');
            });

            it('should generate a second knockout draw', function () {
                main.addDraw({ id: 'd0', name: 'draw1', type: 0 /* Normal */, minRank: 'NC', maxRank: 'NC', nbColumn: 4, nbOut: 1, boxes: undefined, _event: event1 }, 1 /* Create */);
                var draw1 = event1.draws[0];

                main.addDraw({ id: 'd1', name: 'draw2', type: 0 /* Normal */, minRank: '40', maxRank: '30/2', nbColumn: 3, nbOut: 1, boxes: undefined, _event: event1, _previous: draw1 }, 1 /* Create */);

                expect(event1.draws.length).toBe(2);
                var draw = event1.draws[1];
                expect(draw.type).toBe(0 /* Normal */);
                expect(draw.boxes).toBeDefined();
                expect(draw.boxes.length).toBe(5);

                var boxIn = find.by(draw.boxes, 'position', 3);
                expect(boxIn._player.name).toBe('Frank');
                expect(boxIn._player.rank).toBe('30/5');

                boxIn = find.by(draw.boxes, 'position', 4);
                expect(boxIn.qualifIn).toBe(-1);

                boxIn = find.by(draw.boxes, 'position', 2);
                expect(boxIn._player.name).toBe('Eloi');
                expect(boxIn._player.rank).toBe('30/3');
                expect(boxIn.seeded).toBe(1);

                var boxOut = find.by(draw.boxes, 'position', 0);
                expect(boxOut.qualifOut).toBe(1);
            });

            it('should generate after a round a second knockout draw', function () {
                main.addDraw({ id: 'd0', name: 'poule', type: 2 /* PouleSimple */, minRank: 'NC', maxRank: 'NC', nbColumn: 4, nbOut: 1, boxes: undefined, _event: event1 }, 1 /* Create */);
                var draw1 = event1.draws[0];
                main.addDraw({ id: 'd1', name: 'draw2', type: 0 /* Normal */, minRank: '40', maxRank: '30/2', nbColumn: 3, nbOut: 1, boxes: undefined, _event: event1, _previous: draw1 }, 1 /* Create */);

                expect(event1.draws.length).toBe(2);
                var draw = event1.draws[1];
                expect(draw.type).toBe(0 /* Normal */);
                expect(draw.boxes).toBeDefined();
                expect(draw.boxes.length).toBe(5);

                var boxIn = find.by(draw.boxes, 'position', 3);
                expect(boxIn._player.rank).toBe('30/5');

                boxIn = find.by(draw.boxes, 'position', 4);
                expect(boxIn.qualifIn).toBe(-1);

                boxIn = find.by(draw.boxes, 'position', 2);
                expect(boxIn._player.rank).toBe('30/3');
                expect(boxIn.seeded).toBe(1);

                var boxOut = find.by(draw.boxes, 'position', 0);
                expect(boxOut.qualifOut).toBe(1);

                var r = undo.undo();
                expect(event1.draws.length).toBe(1);
                expect(event1.draws[0]).toBe(draw1);
                expect(r).toBeUndefined();
            });

            it('should generate a knockout draw with 6 players and 3 outs', function () {
                tournament1.players.push({ id: 'p7', name: 'Gérard', rank: 'NC', registration: ['e1'] });
                tournament1.players.push({ id: 'p8', name: 'Henri', rank: 'NC', registration: ['e1'] });
                math.randomReturns([0.7, 0.1, 0.4, 0.8, 0.6, 0.3, 0.2, 0.5]);

                main.addDraw({ id: 'd0', name: 'draw6', type: 0 /* Normal */, minRank: 'NC', maxRank: 'NC', nbColumn: 2, nbOut: 3, boxes: undefined, _event: event1 }, 1 /* Create */);

                expect(event1.draws.length).toBe(1);

                var draw = event1.draws[0];
                expect(draw.boxes.length).toBe(9);

                var boxIn = find.by(draw.boxes, 'position', 14);
                expect(boxIn._player.name).toBe('Gérard');

                boxIn = find.by(draw.boxes, 'position', 13);
                expect(boxIn._player.name).toBe('Henri');

                boxIn = find.by(draw.boxes, 'position', 12);
                expect(boxIn._player.name).toBe('Daniel');

                boxIn = find.by(draw.boxes, 'position', 11);
                expect(boxIn._player.name).toBe('Claude');

                boxIn = find.by(draw.boxes, 'position', 10);
                expect(boxIn._player.name).toBe('Bernard');

                boxIn = find.by(draw.boxes, 'position', 9);
                expect(boxIn._player.name).toBe('Albert');

                var boxOut = find.by(draw.boxes, 'position', 6);
                expect(boxOut.qualifOut).toBe(1);

                boxOut = find.by(draw.boxes, 'position', 5);
                expect(boxOut.qualifOut).toBe(2);

                boxOut = find.by(draw.boxes, 'position', 4);
                expect(boxOut.qualifOut).toBe(3);

                tournament1.players.splice(6, 2); //remove two additional players
            });
        });

        describe('Draw generation mix', function () {
            beforeEach(function () {
                return math.randomReturns([0.1, 0.8, 0.2]);
            });

            //clean event
            afterEach(function () {
                return event1.draws.splice(0, event1.draws.length);
            });

            it('should mix a knockout draw', function () {
                main.addDraw({ id: 'd0', name: 'draw1', type: 0 /* Normal */, minRank: 'NC', maxRank: 'NC', nbColumn: 4, nbOut: 1, boxes: undefined, _event: event1 }, 1 /* Create */);
                var draw1 = event1.draws[0];

                var draw = drawLib.newDraw(draw1._event, draw1);
                math.randomReturns([0.6, 0.2, 0.3]);
                main.updateDraw(draw, draw1, 4 /* Mix */);

                expect(draw.boxes.length).toBe(7);

                var boxIn = find.by(draw.boxes, 'position', 6);
                expect(boxIn._player.name).toBe('Claude');

                boxIn = find.by(draw.boxes, 'position', 5);
                expect(boxIn._player.name).toBe('Bernard');

                boxIn = find.by(draw.boxes, 'position', 4);
                expect(boxIn._player.name).toBe('Daniel');

                boxIn = find.by(draw.boxes, 'position', 3);
                expect(boxIn._player.name).toBe('Albert');
            });

            it('should mix a round robin draw', function () {
                main.addDraw({ id: 'd0', name: 'draw1', type: 2 /* PouleSimple */, minRank: 'NC', maxRank: 'NC', nbColumn: 4, nbOut: 1, boxes: undefined, _event: event1 }, 1 /* Create */);
                var draw1 = event1.draws[0];

                var draw = drawLib.newDraw(draw1._event, draw1);
                math.randomReturns([0.1, 0.2, 0.7]);
                main.updateDraw(draw, draw1, 4 /* Mix */);

                expect(draw.boxes.length).toBe(10);

                var boxIn = find.by(draw.boxes, 'position', 19);
                expect(boxIn._player.name).toBe('Claude');

                boxIn = find.by(draw.boxes, 'position', 18);
                expect(boxIn._player.name).toBe('Daniel');

                boxIn = find.by(draw.boxes, 'position', 17);
                expect(boxIn._player.name).toBe('Bernard');

                boxIn = find.by(draw.boxes, 'position', 16);
                expect(boxIn._player.name).toBe('Albert');
            });
        });

        describe('Draw update', function () {
            beforeEach(function () {
                return math.randomReturns([0.1, 0.8, 0.2]);
            });

            //clean event
            afterEach(function () {
                return event1.draws.splice(0, event1.draws.length);
            });

            it('should resize a knockout draw', function () {
                main.addDraw({ id: 'd0', name: 'draw1', type: 0 /* Normal */, minRank: 'NC', maxRank: 'NC', nbColumn: 4, nbOut: 1, boxes: undefined, _event: event1 }, 1 /* Create */);
                var draw1 = event1.draws[0];

                var draw = drawLib.newDraw(draw1._event, draw1);
                draw.nbColumn = 2;
                draw.nbOut = 2;

                main.updateDraw(draw, draw1);

                expect(draw.boxes.length).toBe(7);

                it('should move the qualif out', function () {
                    var boxOut = find.by(draw.boxes, 'position', 2);
                    expect(boxOut.qualifOut).toBe(1);

                    boxOut = find.by(draw.boxes, 'position', 1);
                    expect(boxOut.qualifOut).toBe(2);
                });

                var boxIn = find.by(draw.boxes, 'position', 6);
                expect(boxIn._player.name).toBe('Claude');

                boxIn = find.by(draw.boxes, 'position', 5);
                expect(boxIn._player.name).toBe('Bernard');

                boxIn = find.by(draw.boxes, 'position', 4);
                expect(boxIn._player.name).toBe('Daniel');

                boxIn = find.by(draw.boxes, 'position', 3);
                expect(boxIn._player.name).toBe('Albert');
            });

            it('should resize (expand) a round robin draw', function () {
                main.addDraw({ id: 'd0', name: 'poule', type: 2 /* PouleSimple */, minRank: 'NC', maxRank: 'NC', nbColumn: 2, nbOut: 1, boxes: undefined, _event: event1 }, 1 /* Create */);
                var draw1 = event1.draws[0];
                expect(draw1.boxes.length).toBe(3);

                var draw = drawLib.newDraw(draw1._event, draw1);
                draw.nbColumn = 3;

                main.updateDraw(draw, draw1);

                expect(draw.boxes.length).toBe(6);

                var boxIn = find.by(draw1.boxes, 'position', 11);
                expect(boxIn._player.name).toBe('Bernard');
                expect(boxIn.seeded).toBe(1);

                boxIn = find.by(draw1.boxes, 'position', 10);
                expect(boxIn._player.name).toBe('Albert');

                boxIn = find.by(draw1.boxes, 'position', 9);
                expect(boxIn._player).toBeUndefined();
            });

            it('should resize (shrink) a round robin draw', function () {
                main.addDraw({ id: 'd0', name: 'poule', type: 2 /* PouleSimple */, minRank: 'NC', maxRank: 'NC', nbColumn: 3, nbOut: 1, boxes: undefined, _event: event1 }, 1 /* Create */);
                var draw1 = event1.draws[0];
                expect(draw1.boxes.length).toBe(6);

                var draw = drawLib.newDraw(draw1._event, draw1);
                draw.nbColumn = 2;

                main.updateDraw(draw, draw1);

                expect(draw.boxes.length).toBe(3);

                var boxIn = find.by(draw1.boxes, 'position', 5);
                expect(boxIn._player.name).toBe('Bernard');
                expect(boxIn.seeded).toBe(1);

                boxIn = find.by(draw1.boxes, 'position', 4);
                expect(boxIn._player.name).toBe('Albert');
            });
        });
    });
});
//# sourceMappingURL=mainLib.Spec.js.map
