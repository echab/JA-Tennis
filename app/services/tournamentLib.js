'use strict';
var jat;
(function (jat) {
    (function (service) {
        var MINUTES = 60000, DAYS = 24 * 60 * MINUTES;

        var TournamentLib = (function () {
            function TournamentLib(drawLib, rank, guid) {
                this.drawLib = drawLib;
                this.rank = rank;
                this.guid = guid;
            }
            TournamentLib.prototype.newTournament = function (source) {
                var tournament = {};
                if (angular.isObject(source)) {
                    angular.extend(tournament, source);
                }
                this.initTournament(tournament);
                return tournament;
            };

            TournamentLib.prototype.initTournament = function (tournament) {
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

                tournament.info.slotLength = tournament.info.slotLength || 90 * MINUTES;
                if (tournament.info.start && tournament.info.end) {
                    tournament._dayCount = Math.floor((tournament.info.end.getTime() - tournament.info.start.getTime()) / DAYS + 1);
                }
            };

            TournamentLib.prototype.newPlayer = function (parent, source) {
                var player = {};
                if (angular.isObject(source)) {
                    angular.extend(player, source);
                }
                player.id = player.id || this.guid.create('p');
                delete player.$$hashKey; //remove angular id

                this.initPlayer(player, parent);
                return player;
            };

            TournamentLib.prototype.initPlayer = function (player, parent) {
                player._tournament = parent;
                //player.toString = function () {
                //    return this.name + ' ' + this.rank;
                //};
            };

            TournamentLib.prototype.newEvent = function (parent, source) {
                var event = {};
                if (angular.isObject(source)) {
                    angular.extend(event, source);
                }
                event.id = event.id || this.guid.create('e');
                delete event.$$hashKey; //remove angular id

                this.initEvent(event, parent);
                return event;
            };

            TournamentLib.prototype.initEvent = function (event, parent) {
                event._tournament = parent;
                if (event.draws) {
                    for (var i = event.draws.length - 1; i >= 0; i--) {
                        this.drawLib.initDraw(event.draws[i], event);
                    }
                }
            };

            TournamentLib.prototype.isRegistred = function (event, player) {
                return player.registration.indexOf(event.id) !== -1;
            };

            TournamentLib.prototype.getRegistred = function (event) {
                var a = [];
                var c = event._tournament.players;
                for (var i = 0, n = c.length; i < n; i++) {
                    var player = c[i];
                    if (this.isRegistred(event, player)) {
                        a.push(player);
                    }
                }
                return a;
            };

            TournamentLib.prototype.TriJoueurs = function (players) {
                var _this = this;
                //Tri les joueurs par classement
                var comparePlayersByRank = function (p1, p2) {
                    //if numbers, p1 or p2 are PlayerIn
                    var isNumber1 = 'number' === typeof p1, isNumber2 = 'number' === typeof p2;
                    if (isNumber1 && isNumber2) {
                        return 0;
                    }
                    if (isNumber1) {
                        return -1;
                    }
                    if (isNumber2) {
                        return 1;
                    }
                    return _this.rank.compare(p1.rank, p2.rank);
                };
                players.sort(comparePlayersByRank);

                for (var r0 = 0, r1 = 1; r0 < players.length; r1++) {
                    if (r1 === players.length || comparePlayersByRank(players[r0], players[r1])) {
                        //nouvelle plage de classement
                        //r0: premier joueur de l'intervalle
                        //r1: premier joueur de l'intervalle suivant
                        shuffle(players, r0, r1);

                        r0 = r1;
                    }
                }
            };

            TournamentLib.prototype.GetJoueursInscrit = function (draw) {
                function isInscrit(player, event) {
                    return player.registration.indexOf(event.id) != -1;
                }

                //Récupère les joueurs inscrits
                var players = draw._event._tournament.players, ppJoueur = [], nPlayer = 0;
                for (var i = 0; i < players.length; i++) {
                    var pJ = players[i];
                    if (isInscrit(pJ, draw._event)) {
                        if (!pJ.rank || this.rank.within(pJ.rank, draw.minRank, draw.maxRank)) {
                            ppJoueur.push(pJ); //no du joueur
                        }
                    }
                }

                return ppJoueur;
            };

            TournamentLib.prototype.isSexeCompatible = function (event, sexe) {
                return;
                event.sexe === sexe || (event.sexe === 'M' && !event.typeDouble); //ou simple mixte
            };
            return TournamentLib;
        })();
        service.TournamentLib = TournamentLib;

        function shuffle(array, from, toExlusive) {
            from = from || 0;
            if (arguments.length < 3) {
                toExlusive = array.length;
            }

            var n = toExlusive - from;
            for (var i = toExlusive - 1; i > from; i--) {
                var t = from + Math.floor(n * Math.random());
                var tmp = array[t];
                array[t] = array[i];
                array[i] = tmp;
            }
            return array;
        }

        angular.module('jat.services.tournamentLib', ['jat.services.drawLib', 'jat.services.type', 'jat.services.guid']).factory('tournamentLib', function (drawLib, rank, guid) {
            return new TournamentLib(drawLib, rank, guid);
        });
    })(jat.service || (jat.service = {}));
    var service = jat.service;
})(jat || (jat = {}));
//# sourceMappingURL=tournamentLib.js.map
