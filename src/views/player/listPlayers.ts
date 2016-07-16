'use strict';
module jat.player {

    function listPlayersDirective(): ng.IDirective {
        var dir = {
            templateUrl: 'views/player/listPlayers.html',
            controller: 'listPlayersCtrl',
            controllerAs: 'list',
            restrict: 'EA',
            scope: true,
            link: (scope: ng.IScope, element: JQuery, attrs: any, controller: listPlayersCtrl) => {
                scope.$watch(attrs.listPlayers, (newValue: Player[], oldValue: Player[], scope: ng.IScope) => {
                    controller.players = newValue;
                });
            }
        };
        return dir;
    }

    class listPlayersCtrl {
        players: Player[];
        //eventById: { [id: string]: TEvent };

        eventById(id: string): TEvent {
            if (this.selection.tournament && this.selection.tournament.events) {
                return Find.byId(this.selection.tournament.events, id);
            }
        }

        static $inject = [
            'selection',
            'find'
        ];

        constructor(
            private selection: jat.service.Selection,
            private find: jat.service.Find) {
        }
    }

    angular.module('jat.player.list', ['jat.services.selection', 'jat.services.find'])
        .directive('listPlayers', listPlayersDirective)
        .controller('listPlayersCtrl', listPlayersCtrl)
    ;
}