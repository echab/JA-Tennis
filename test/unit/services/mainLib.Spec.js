﻿'use strict';
describe('services.mainLib', function () {
    var main;

    beforeEach(module('jat.services.mainLib'));

    beforeEach(inject(function (_mainLib_) {
        main = _mainLib_;
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

        var player1 = { id: 'p1', name: 'Eloi', rank: '30/3', registration: [] };
        var player2 = { id: 'p2', name: 'Denis', rank: '4/6', registration: [] };

        //clean tournament1
        afterEach(function () {
            return tournament1.players.splice(0, tournament1.players.length);
        });

        it('should add player', function () {
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

    describe('Events management', function () {
    });

    describe('Draws management', function () {
    });
});
//# sourceMappingURL=mainLib.Spec.js.map
