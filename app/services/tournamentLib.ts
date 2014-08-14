'use strict';

module jat.service {

    var MINUTES = 60000,
        DAYS = 24 * 60 * MINUTES;

    export class TournamentLib {

        constructor(
            private drawLib: jat.service.DrawLib,
            private rank: ServiceRank,
            private guid: jat.service.Guid
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

            tournament.info = tournament.info || { name: '' };
            tournament.info.slotLength = tournament.info.slotLength || 90 * MINUTES;
            if (tournament.info.start && tournament.info.end) {
                tournament._dayCount = Math.floor((tournament.info.end.getTime() - tournament.info.start.getTime()) / DAYS + 1);
            }
        }


        public newPlayer(parent: models.Tournament, source?: models.Player): models.Player {
            var player: models.Player = <any>{};
            if (angular.isObject(source)) {
                angular.extend(player, source);
            }
            player.id = player.id || this.guid.create('p');
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
            event.id = event.id || this.guid.create('e');
            delete (<any>event).$$hashKey;   //remove angular id

            this.initEvent(event, parent);
            return event;
        }

        public initEvent(event: models.Event, parent: models.Tournament): void {
            event._tournament = parent;

            var c = event.draws;
            if (c) {
                for (var i = c.length - 1; i >= 0; i--) {
                    var draw = c[i];
                    this.drawLib.initDraw(draw, event);

                    //init draws linked list
                    draw._previous = c[i - 1];
                    draw._next = c[i + 1];
                }
            }
        }

        public isRegistred(event: models.Event, player: models.Player): boolean {
            return player.registration.indexOf(event.id) !== -1;
        }

        public getRegistred(event: models.Event): models.Player[] {
            var a: models.Player[] = [];
            var c = event._tournament.players;
            for (var i = 0, n = c.length; i < n; i++) {
                var player = c[i];
                if (this.isRegistred(event, player)) {
                    a.push(player);
                }
            }
            return a;
        }

        public TriJoueurs(players: models.Player[]): void {

            //Tri les joueurs par classement
            var comparePlayersByRank = (p1: models.Player, p2: models.Player): number => {
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
            players.sort(comparePlayersByRank);

            //Mélange les joueurs de même classement
            for (var r0 = 0, r1 = 1; r0 < players.length; r1++) {
                if (r1 === players.length || comparePlayersByRank(players[r0], players[r1])) {
                    //nouvelle plage de classement

                    //r0: premier joueur de l'intervalle
                    //r1: premier joueur de l'intervalle suivant
                    tool.shuffle(players, r0, r1);

                    r0 = r1;
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

        public isSexeCompatible(event: models.Event, sexe: string): boolean {
	        return
		        event.sexe === sexe	//sexe épreuve = sexe joueur
            || (event.sexe === 'M' && !event.typeDouble);	//ou simple mixte
        }
    }

    angular.module('jat.services.tournamentLib', ['jat.services.drawLib', 'jat.services.type', 'jat.services.guid'])
        .factory('tournamentLib', (drawLib: jat.service.DrawLib, rank: ServiceRank, guid: jat.service.Guid) => {
            return new TournamentLib(drawLib, rank, guid);
        });
}