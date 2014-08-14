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
                        scope.list.players = newValue;
                    });
                }
            };
            return dir;
        }

        var listPlayersCtrl = (function () {
            function listPlayersCtrl() {
            }
            return listPlayersCtrl;
        })();

        angular.module('jat.player.list', []).directive('listPlayers', listPlayersDirective).controller('listPlayersCtrl', listPlayersCtrl);
    })(jat.player || (jat.player = {}));
    var player = jat.player;
})(jat || (jat = {}));
//# sourceMappingURL=listPlayers.js.map
