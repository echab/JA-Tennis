'use strict';

module jat.service {

    export class TournamentLib {

        constructor(
            private drawLib: jat.service.DrawLib,
            private rank: ServiceRank
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
            delete (<any>player).$$hashKey;   //remove angular id

            this.initPlayer(player, parent);
            return player;
        }

        public initPlayer(player: models.Player, parent: models.Tournament) {
            player._tournament = parent;
            //player.toString = function () {
            //    return this.name + ' ' + this.rank;
            //};
        }


        public newEvent(parent: models.Tournament, source?: models.Event): models.Event {
            var event: models.Event = <any>{};
            if (angular.isObject(source)) {
                angular.extend(event, source);
            }
            delete (<any>event).$$hashKey;   //remove angular id

            this.initEvent(event, parent);
            return event;
        }

        public initEvent(event: models.Event, parent: models.Tournament): void {
            event._tournament = parent;
            if (event.draws) {
                for (var i = event.draws.length - 1; i >= 0; i--) {
                    this.drawLib.initDraw(event.draws[i], event);
                }
            }
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

        public TriJoueurs(players: models.Player[]): void {

            //Tri les joueurs par classement
            var compare1 = (p1: models.Player, p2: models.Player): number => {
                //if numbers, p1 or p2 are PlayerIn
                var isNumber1 = 'number' === typeof p1,
                    isNumber2 = 'number' === typeof p2;
                if (isNumber1 && isNumber2) {
                    return 0;
                }
                if (isNumber1) {
                    return -1;
                }
                if (isNumber2) {
                    return 1;
                }
                return this.rank.compare(p1.rank, p2.rank);
            };
            players.sort(compare1);

            //Mélange les joueurs de même classement
            for (var r0 = 0, r1 = 1; r0 < players.length; r1++) {
                if (r1 === players.length || compare1(players[r0], players[r1])) {
                    //nouvelle plage de classement
                    r1--;

                    //r0: premier joueur de l'intervalle
                    //r1: dernier joueur de même classement
                    for (var i = r0; i < r1; i++) {
                        //echange deux joueurs p et q
                        var p = Math.round(r0 + Math.random() * (r1 - r0));
                        var q = Math.round(r0 + Math.random() * (r1 - r0));
                        if (p != q) {
                            var t = players[p];
                            players[p] = players[q];
                            players[q] = t;
                        }
                    }

                    r0 = ++r1;
                }
            }
        }

        public GetJoueursInscrit(draw: models.Draw): models.Player[] {

            function isInscrit(player: models.Player, event: models.Event): boolean {
                return player.registration.indexOf(event.id) != -1;
            }

            //Récupère les joueurs inscrits
            var players = draw._event._tournament.players,
                ppJoueur: models.Player[] = [], //new short[nPlayer],
                nPlayer = 0;
            for (var i = 0; i < players.length; i++) {
                var pJ = players[i];
                if (isInscrit(pJ, draw._event)) {
                    if (!pJ.rank
                        || this.rank.within(pJ.rank, draw.minRank, draw.maxRank)) {
                        ppJoueur.push(pJ);	//no du joueur
                    }
                }
            }

            return ppJoueur;
        }
    }

    angular.module('jat.services.tournamentLib', ['jat.services.drawLib', 'jat.services.type'])
        .factory('tournamentLib', (drawLib: jat.service.DrawLib, rank: ServiceRank) => {
            return new TournamentLib(drawLib, rank);
        });
}