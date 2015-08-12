'use strict';
var jat;
(function (jat) {
    var match;
    (function (match_1) {
        var dialogMatchCtrl = (function () {
            function dialogMatchCtrl(title, match, services, find, matchFormat) {
                this.title = title;
                this.match = match;
                this.services = services;
                var tournament = match._draw._event._tournament;
                var drawLib = services.drawLibFor(match._draw);
                var opponents = drawLib.boxesOpponents(match);
                this.player1 = find.byId(tournament.players, opponents.box1.playerId);
                this.player2 = find.byId(tournament.players, opponents.box2.playerId);
                this.places = tournament.places;
                this.matchFormats = matchFormat.list();
            }
            dialogMatchCtrl.$inject = [
                'title',
                'match',
                'services',
                'find',
                'matchFormat'
            ];
            return dialogMatchCtrl;
        })();
        angular.module('jat.match.dialog', ['jat.services.services', 'jat.services.drawLib', 'jat.services.find', 'jat.services.type'])
            .controller('dialogMatchCtrl', dialogMatchCtrl);
    })(match = jat.match || (jat.match = {}));
})(jat || (jat = {}));
