'use strict';
var jat;
(function (jat) {
    (function (_match) {
        var dialogMatchCtrl = (function () {
            function dialogMatchCtrl(title, match, find, drawLib, matchFormat) {
                this.title = title;
                this.match = match;
                var tournament = match._draw._event._tournament;

                var opponents = drawLib.boxesOpponents(match);
                this.player1 = find.byId(tournament.players, opponents.box1.playerId);
                this.player2 = find.byId(tournament.players, opponents.box2.playerId);

                this.places = tournament.places;
                this.matchFormats = matchFormat.list();
            }
            dialogMatchCtrl.$inject = [
                'title',
                'match',
                'find',
                'drawLib',
                'matchFormat'
            ];
            return dialogMatchCtrl;
        })();

        angular.module('jat.match.dialog', ['jat.services.drawLib', 'jat.services.find', 'jat.services.type']).controller('dialogMatchCtrl', dialogMatchCtrl);
    })(jat.match || (jat.match = {}));
    var match = jat.match;
})(jat || (jat = {}));
//# sourceMappingURL=dialogMatch.js.map
