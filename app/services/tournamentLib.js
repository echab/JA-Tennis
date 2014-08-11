'use strict';
var jat;
(function (jat) {
    (function (service) {
        var TournamentLib = (function () {
            function TournamentLib(drawLib, rank) {
                this.drawLib = drawLib;
                this.rank = rank;
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
            };

            TournamentLib.prototype.newPlayer = function (parent, source) {
                var player = {};
                if (angular.isObject(source)) {
                    angular.extend(player, source);
                }
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

            TournamentLib.prototype.getRegistred = function (event) {
                var a = [];
                var c = event._tournament.players;
                for (var i = 0, n = c.length; i < n; i++) {
                    var player = c[i];
                    if (player.registration.indexOf(event.id) !== -1) {
                        a.push(player);
                    }
                }
                return a;
            };

            TournamentLib.prototype.TriJoueurs = function (players) {
                var _this = this;
                //Tri les joueurs par classement
                var compare1 = function (p1, p2) {
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
                players.sort(compare1);

                for (var r0 = 0, r1 = 1; r0 < players.length; r1++) {
                    if (r1 === players.length || compare1(players[r0], players[r1])) {
                        //nouvelle plage de classement
                        r1--;

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
            return TournamentLib;
        })();
        service.TournamentLib = TournamentLib;

        angular.module('jat.services.tournamentLib', ['jat.services.drawLib', 'jat.services.type']).factory('tournamentLib', function (drawLib, rank) {
            return new TournamentLib(drawLib, rank);
        });
    })(jat.service || (jat.service = {}));
    var service = jat.service;
})(jat || (jat = {}));
//# sourceMappingURL=tournamentLib.js.map
