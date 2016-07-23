'use strict';
module jat.match {
    class dialogMatchCtrl {
        player1: Player;
        player2: Player;
        places: string[];
        matchFormats: { [code: string]: MatchFormat };

        static $inject = [
            'title',
            'match',
            'services',
            'find',
            'matchFormat'
        ];

        constructor(
            private title: string,
            private match: Match,
            private services: jat.service.Services,
            find: jat.service.Find,
            matchFormat: MatchFormats
            ) {

            var tournament = match._draw._event._tournament;

            var drawLib = services.drawLibFor(match._draw);
            
            var opponents = drawLib.boxesOpponents(match);
            this.player1 = find.byId(tournament.players, opponents.box1.playerId);
            this.player2 = find.byId(tournament.players, opponents.box2.playerId);

            this.places = tournament.places;
            this.matchFormats = matchFormat.list();
        }
    }

    angular.module('jat.match.dialog', ['jat.services.services', 'jat.services.drawLib', 'jat.services.find', 'jat.services.type'])
        .controller('dialogMatchCtrl', dialogMatchCtrl);
}