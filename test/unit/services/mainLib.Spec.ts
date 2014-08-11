'use strict';

describe('services.mainLib', () => {

    var main: jat.service.MainLib,
        undo: jat.service.Undo,
        find: jat.service.Find;

    beforeEach(module('jat.services.mainLib'));

    beforeEach(inject((_mainLib_: jat.service.MainLib, _undo_: jat.service.Undo, _find_: jat.service.Find) => {
        main = _mainLib_;
        undo = _undo_;
        find = _find_;
    }));

    describe('Load/save', () => {

        it('should load a tournament from url', () => {

        });

    });

    describe('Players management', () => {

        var tournament1: models.Tournament = {
            id: 't1', info: { name: 'Tournament 1' },
            players: [],
            events: []
        };

        var player1: models.Player = { id: 'p1', name: 'Eloi', rank: '30/3', registration: [], _tournament: tournament1 };
        var player2: models.Player = { id: 'p2', name: 'Denis', rank: '4/6', registration: [], _tournament: tournament1 };

        //clean tournament1
        afterEach(() => tournament1.players.splice(0, tournament1.players.length));

        it('should add player', () => {
            expect(tournament1.players.length).toBe(0);

            //main.select(tournament1);
            //main.addPlayer();
            //expect(tournament1.players.length).toBe(1);
            //expect(tournament1.players[0].id).toBe('P0');

            main.addPlayer(tournament1, player1);
            expect(tournament1.players.length).toBe(1);
            expect(tournament1.players[0].id).toBe('P0');
            expect(tournament1.players[0].name).toBe('Eloi');
            expect(tournament1.players[0].rank).toBe('30/3');
        });

        it('should remove player', function () {
            main.select(tournament1);
            tournament1.players.push(player1);

            main.removePlayer(player1);

            expect(tournament1.players.length).toBe(0);
        });

        it('should edit player', function () {
            main.select(tournament1);
            tournament1.players.push(player1);

            main.editPlayer(player1, player2);

            expect(tournament1.players[0].name).toBe('Eloi');

            //main.doUndo();
            //expect(tournament1.players[0].name).toBe('Denis');
        });
    });

    describe('Events management', () => {

    });

    describe('Draws management', () => {

        var event1: models.Event = {
            id: 'e1', name: 'Simple messieurs', sexe: 'H', category: 'Senior', maxRank: '30/1',
            draws: []
        };
        var tournament1: models.Tournament = {
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

        describe('Draw generation new', () => {

            //clean event
            afterEach(() => event1.draws.splice(0, event1.draws.length));

            it('should add a first knockout draw', () => {

                main.addDraw({ id: 'd1', name: 'draw1', type: models.DrawType.Normal, minRank: 'NC', maxRank: 'NC', nbColumn: 3, nbOut: 1, boxes: undefined, _event: event1 });

                expect(event1.draws.length).toBe(1);
                var draw1 = event1.draws[0];
                expect(draw1.name).toBe('draw1');
            });

            it('should generate a first knockout draw', () => {

                main.addDraw({ id: 'd1', name: 'draw1', type: models.DrawType.Normal, minRank: 'NC', maxRank: 'NC', nbColumn: 3, nbOut: 1, boxes: undefined, _event: event1 }, models.GenerateType.Create);

                expect(event1.draws.length).toBe(1);
                var draw1 = event1.draws[0];
                expect(draw1.type).toBe(models.DrawType.Normal);
                expect(draw1.boxes).toBeDefined();
                expect(draw1.boxes.length).toBe(7);

                var boxIn = <models.PlayerIn>find.by(draw1.boxes, 'position', 6);
                expect(boxIn._player.rank).toBe('NC');

                boxIn = <models.PlayerIn>find.by(draw1.boxes, 'position', 5);
                expect(boxIn._player.rank).toBe('NC');

                boxIn = <models.PlayerIn>find.by(draw1.boxes, 'position', 4);
                expect(boxIn._player.rank).toBe('NC');

                boxIn = <models.PlayerIn>find.by(draw1.boxes, 'position', 3);
                expect(boxIn._player.rank).toBe('NC');

                var boxOut = <models.Match>find.by(draw1.boxes, 'position', 0);
                expect(boxOut.qualifOut).toBe(1);
            });

            it('should generate a first knockout draw with 2 Q', () => {

                main.addDraw({ id: 'd1', name: 'draw1', type: models.DrawType.Normal, minRank: 'NC', maxRank: 'NC', nbColumn: 2, nbOut: 2, boxes: undefined, _event: event1 }, models.GenerateType.Create);

                expect(event1.draws.length).toBe(1);
                var draw1 = event1.draws[0];
                expect(draw1.type).toBe(models.DrawType.Normal);
                expect(draw1.boxes).toBeDefined();
                expect(draw1.boxes.length).toBe(6);

                var boxIn = <models.PlayerIn>find.by(draw1.boxes, 'position', 6);
                expect(boxIn._player.rank).toBe('NC');

                boxIn = <models.PlayerIn>find.by(draw1.boxes, 'position', 5);
                expect(boxIn._player.rank).toBe('NC');

                boxIn = <models.PlayerIn>find.by(draw1.boxes, 'position', 4);
                expect(boxIn._player.rank).toBe('NC');

                boxIn = <models.PlayerIn>find.by(draw1.boxes, 'position', 3);
                expect(boxIn._player.rank).toBe('NC');

                var boxOut = <models.Match>find.by(draw1.boxes, 'position', 2);
                expect(boxOut.qualifOut).toBe(1);

                boxOut = <models.Match>find.by(draw1.boxes, 'position', 1);
                expect(boxOut.qualifOut).toBe(2);
            });

            it('should generate a first roundrobin draw', () => {

                main.addDraw({ id: 'd1', name: 'poule', type: models.DrawType.PouleSimple, minRank: 'NC', maxRank: 'NC', nbColumn: 4, nbOut: 1, boxes: undefined, _event: event1 }, models.GenerateType.Create);

                expect(event1.draws.length).toBe(1);
                var draw1 = event1.draws[0];
                expect(draw1.type).toBe(models.DrawType.PouleSimple);
                expect(draw1.suite).toBeFalsy();
                expect(draw1.boxes).toBeDefined();
                expect(draw1.boxes.length).toBe(10);

                var boxIn = <models.PlayerIn>find.by(draw1.boxes, 'position', 19);
                expect(boxIn._player.rank).toBe('NC');
                expect(boxIn.seeded).toBe(1);

                boxIn = <models.PlayerIn>find.by(draw1.boxes, 'position', 18);
                expect(boxIn._player.rank).toBe('NC');

                boxIn = <models.PlayerIn>find.by(draw1.boxes, 'position', 17);
                expect(boxIn._player.rank).toBe('NC');

                boxIn = <models.PlayerIn>find.by(draw1.boxes, 'position', 16);
                expect(boxIn._player.rank).toBe('NC');
            });

            it('should generate first two roundrobin draw', () => {

                main.addDraw({ id: 'd1', name: 'poule', type: models.DrawType.PouleSimple, minRank: 'NC', maxRank: 'NC', nbColumn: 2, nbOut: 1, boxes: undefined, _event: event1 }, models.GenerateType.Create);

                expect(event1.draws.length).toBe(2);

                var draw1 = event1.draws[0];
                expect(draw1.type).toBe(models.DrawType.PouleSimple);
                expect(draw1.suite).toBeFalsy();
                expect(draw1.boxes).toBeDefined();
                expect(draw1.boxes.length).toBe(3);

                var boxIn = <models.PlayerIn>find.by(draw1.boxes, 'position', 5);
                expect(boxIn._player.rank).toBe('NC');
                expect(boxIn.seeded).toBe(1);

                boxIn = <models.PlayerIn>find.by(draw1.boxes, 'position', 4);
                expect(boxIn._player.rank).toBe('NC');

                var draw2 = event1.draws[1];
                expect(draw2.type).toBe(models.DrawType.PouleSimple);
                expect(draw2.suite).toBeTruthy();
                expect(draw2.boxes).toBeDefined();
                expect(draw2.boxes.length).toBe(3);

                boxIn = <models.PlayerIn>find.by(draw2.boxes, 'position', 5);
                expect(boxIn._player.rank).toBe('NC');
                expect(boxIn.seeded).toBe(2);

                boxIn = <models.PlayerIn>find.by(draw2.boxes, 'position', 4);
                expect(boxIn._player.rank).toBe('NC');
            });

            it('should generate a second knockout draw', () => {

                main.addDraw({ id: 'd0', name: 'draw1', type: models.DrawType.Normal, minRank: 'NC', maxRank: 'NC', nbColumn: 4, nbOut: 1, boxes: undefined, _event: event1 }, models.GenerateType.Create);
                var draw1 = event1.draws[0];
                main.addDraw({ id: 'd1', name: 'draw2', type: models.DrawType.Normal, minRank: '40', maxRank: '30/2', nbColumn: 3, nbOut: 1, boxes: undefined, _event: event1, _previous: draw1 }, models.GenerateType.Create);

                expect(event1.draws.length).toBe(2);
                var draw = event1.draws[1];
                expect(draw.type).toBe(models.DrawType.Normal);
                expect(draw.boxes).toBeDefined();
                expect(draw.boxes.length).toBe(5);

                var boxIn = <models.PlayerIn> find.by(draw.boxes, 'position', 3);
                expect(boxIn._player.rank).toBe('30/5');

                boxIn = find.by(draw.boxes, 'position', 4);
                expect(boxIn.qualifIn).toBe(-1);

                boxIn = find.by(draw.boxes, 'position', 2);
                expect(boxIn._player.rank).toBe('30/3');
                expect(boxIn.seeded).toBe(1);

                var boxOut = <models.Match>find.by(draw.boxes, 'position', 0);
                expect(boxOut.qualifOut).toBe(1);
            });

            it('should generate after a round a second knockout draw', () => {

                main.addDraw({ id: 'd0', name: 'poule', type: models.DrawType.PouleSimple, minRank: 'NC', maxRank: 'NC', nbColumn: 4, nbOut: 1, boxes: undefined, _event: event1 }, models.GenerateType.Create);
                var draw1 = event1.draws[0];
                main.addDraw({ id: 'd1', name: 'draw2', type: models.DrawType.Normal, minRank: '40', maxRank: '30/2', nbColumn: 3, nbOut: 1, boxes: undefined, _event: event1, _previous: draw1 }, models.GenerateType.Create);

                expect(event1.draws.length).toBe(2);
                var draw = event1.draws[1];
                expect(draw.type).toBe(models.DrawType.Normal);
                expect(draw.boxes).toBeDefined();
                expect(draw.boxes.length).toBe(5);

                var boxIn = <models.PlayerIn> find.by(draw.boxes, 'position', 3);
                expect(boxIn._player.rank).toBe('30/5');

                boxIn = find.by(draw.boxes, 'position', 4);
                expect(boxIn.qualifIn).toBe(-1);

                boxIn = find.by(draw.boxes, 'position', 2);
                expect(boxIn._player.rank).toBe('30/3');
                expect(boxIn.seeded).toBe(1);

                var boxOut = <models.Match>find.by(draw.boxes, 'position', 0);
                expect(boxOut.qualifOut).toBe(1);

                var r = undo.undo();
                expect(event1.draws.length).toBe(1);
                expect(event1.draws[0]).toBe(draw1);
                expect(r).toBeUndefined();
            });

        });

        describe('Draw generation mix', () => {

        });

    });

});
