'use strict';

module jat.service {

    export class TournamentLib {

        constructor(
            private drawLib: jat.service.DrawLib
            ) { }

        public newTournament(source?: models.Tournament): models.Tournament {
            var tournament: models.Tournament = <any>{};
            if (angular.isObject(source)) {
                angular.extend(tournament, source);
            }
            this.initTournament(tournament);
            return tournament;
        }

        public initTournament(tournament: models.Tournament): void {
            if (tournament.players) {
                for (var i = tournament.players.length - 1; i >= 0; i--) {
                    //tournament.players[i] = new Player(tournament, tournament.players[i]);
                    this.initPlayer(tournament.players[i], tournament);
                }
            }
            if (tournament.events) {
                for (var i = tournament.events.length - 1; i >= 0; i--) {
                    //tournament.events[i] = new Event(tournament, tournament.events[i]);
                    this.initEvent(tournament.events[i], tournament);
                }
            }
        }


        public newPlayer(parent: models.Tournament, source?: models.Player): models.Player {
            var player: models.Player = <any>{};
            if (angular.isObject(source)) {
                angular.extend(player, source);
            }
            this.initPlayer(player, parent);
            return player;
        }

        public initPlayer(player: models.Player, parent: models.Tournament) {
            player._tournament = parent;
            //player.toString = function () {
            //    return this.name + ' ' + this.rank;
            //};
        }


        public initEvent(event: models.Event, parent: models.Tournament): void {
            event._tournament = parent;
            if (event.draws) {
                for (var i = event.draws.length - 1; i >= 0; i--) {
                    this.drawLib.initDraw(event.draws[i], event);
                }
            }
        }

        public newEvent(parent: models.Tournament, source?: models.Event): models.Event {
            var event: models.Event = <any>{};
            if (angular.isObject(source)) {
                angular.extend(event, source);
            }
            this.initEvent(event, parent);
            return event;
        }

        public getRegistred(event: models.Event): models.Player[] {
            var a: models.Player[] = [];
            var c = event._tournament.players;
            for (var i = 0, n = c.length; i < n; i++) {
                var player = c[i];
                if (player.registration.indexOf(event.id) !== -1) {
                    a.push(player);
                }
            }
            return a;
        }
    }

    angular.module('jat.services.tournamentLib', ['jat.services.drawLib'])
        .factory('tournamentLib', (drawLib:jat.service.DrawLib) => { return new TournamentLib(drawLib); });
}