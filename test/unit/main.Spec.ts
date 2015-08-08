///<reference path="../../lib/typings/jasmine/jasmine.d.ts"/>
///<reference path="../../lib/typings/angularjs/angular-mocks.d.ts"/>
///<reference path="../../lib/typings/ui-bootstrap/ui-bootstrap-mocks.d.ts"/>

'use strict';

describe('main controller', () => {

    var main: jat.main.mainCtrl, $modal: uib.mock.IModalService<string>;

    beforeEach(module('jat.main'));
    beforeEach(module('ui.bootstrap.mock'));    //for $modal mock

    beforeEach(inject(($controller: ng.IControllerService, _$modal_: uib.mock.IModalService<string>) => {
        main = $controller('mainCtrl');
        $modal = _$modal_;
    }));

    describe('Players management', () => {

        var tournament1: models.Tournament = {
            id: 't1', info: { name: 'Tournament 1' },
            players: [],
            events: []
        };

        var player1: models.Player = { id: 'p1', name: 'Eloi', rank: '30/3', registration: [] };

        //clean tournament1
        afterEach(() => tournament1.players.splice(0, tournament1.players.length));

        it('should add player', () => {
            expect(tournament1.players.length).toBe(0);

            //main.select(tournament1);
            //main.addPlayer();
            //$modal.close('Ok');
            //expect(tournament1.players.length).toBe(1);
            //expect(tournament1.players[0].id).toBe('P0');

            //main.addPlayer(player1);
            //$modal.close('Ok');
            //expect(tournament1.players.length).toBe(2);
            //expect(tournament1.players[1].id).toBe('P1');
            //expect(tournament1.players[1].name).toBe('Eloi');
            //expect(tournament1.players[1].rank).toBe('30/3');
        });

        it('should remove player', function () {
            //main.select(tournament1);
            //tournament1.players.push(player1);

            //main.removePlayer(player1);

            expect(tournament1.players.length).toBe(0);
        });

        it('should edit player', function () {
            //main.select(tournament1);
            //tournament1.players.push(player1);

            //main.editPlayer(player1);
            //player1.name = 'Denis';
            //$modal.close('Ok');

            //expect(tournament1.players[0].name).toBe('Eloi');

            //main.doUndo();
            //expect(tournament1.players[0].name).toBe('Denis');
        });
    });

    describe('Events management', () => {

    });

    describe('Draws management', () => {

    });

});
