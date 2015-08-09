'use strict';
module jat.match {
    class dialogMatchCtrl {
        player1: models.Player;
        player2: models.Player;
        places: string[];
        matchFormats: { [code: string]: MatchFormat };

        static $inject = [
            'title',
            'match',
            'find',
            'drawLib',
            'matchFormat'
        ];

        constructor(
            private title: string,
            private match: models.Match,
            find: jat.service.Find,
            drawLib: jat.service.DrawLib,
            matchFormat: MatchFormats
            ) {

            var tournament = match._draw._event._tournament;

            var opponents = drawLib.boxesOpponents(match);
            this.player1 = find.byId(tournament.players, opponents.box1.playerId);
            this.player2 = find.byId(tournament.players, opponents.box2.playerId);

            this.places = tournament.places;
            this.matchFormats = matchFormat.list();
        }
    }

    angular.module('jat.match.dialog', ['jat.services.drawLib', 'jat.services.find', 'jat.services.type'])
        .controller('dialogMatchCtrl', dialogMatchCtrl);
}