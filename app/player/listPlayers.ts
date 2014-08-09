'use strict';
module jat.player {

    interface ListPlayersScope extends ng.IScope {
        list: listPlayersCtrl;
    }

    function listPlayersDirective() {
        var dir = {
            templateUrl: 'player/listPlayers.html',
            controller: 'listPlayersCtrl',
            controllerAs: 'list',
            restrict: 'EA',
            scope: true,
            link: (scope: ListPlayersScope, element: JQuery, attrs: any, controller: any) => {
                scope.$watch(attrs.listPlayers, (newValue: models.Player[], oldValue: models.Player[], scope: ListPlayersScope) => {
                    scope.list.players = newValue;
                });
            }
        };
        return dir;
    }

    class listPlayersCtrl {
        players: models.Player[];
        constructor(selection: jat.service.Selection) {
            //console.log("Players controller: cntr");
        }
    }

    angular.module('jat.player.list', [])
        .directive('listPlayers', listPlayersDirective)
        .controller('listPlayersCtrl', listPlayersCtrl)
    ;
}