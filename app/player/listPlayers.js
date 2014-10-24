'use strict';
var jat;
(function (jat) {
    (function (player) {
        function listPlayersDirective() {
            var dir = {
                templateUrl: 'player/listPlayers.html',
                controller: 'listPlayersCtrl',
                controllerAs: 'list',
                restrict: 'EA',
                scope: true,
                link: function (scope, element, attrs, controller) {
                    scope.$watch(attrs.listPlayers, function (newValue, oldValue, scope) {
                        controller.players = newValue;
                    });
                }
            };
            return dir;
        }

        var listPlayersCtrl = (function () {
            function listPlayersCtrl(selection, find) {
                this.selection = selection;
                this.find = find;
            }
            //eventById: { [id: string]: models.Event };
            listPlayersCtrl.prototype.eventById = function (id) {
                if (this.selection.tournament && this.selection.tournament.events) {
                    return this.find.byId(this.selection.tournament.events, id);
                }
            };

            listPlayersCtrl.$inject = [
                'selection',
                'find'
            ];
            return listPlayersCtrl;
        })();

        angular.module('jat.player.list', ['jat.services.selection', 'jat.services.find']).directive('listPlayers', listPlayersDirective).controller('listPlayersCtrl', listPlayersCtrl);
    })(jat.player || (jat.player = {}));
    var player = jat.player;
})(jat || (jat = {}));
//# sourceMappingURL=listPlayers.js.map
