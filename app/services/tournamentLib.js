'use strict';
var jat;
(function (jat) {
    (function (service) {
        var TournamentLib = (function () {
            function TournamentLib(drawLib) {
                this.drawLib = drawLib;
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
                this.initPlayer(player, parent);
                return player;
            };

            TournamentLib.prototype.initPlayer = function (player, parent) {
                player._tournament = parent;
                //player.toString = function () {
                //    return this.name + ' ' + this.rank;
                //};
            };

            TournamentLib.prototype.initEvent = function (event, parent) {
                event._tournament = parent;
                if (event.draws) {
                    for (var i = event.draws.length - 1; i >= 0; i--) {
                        this.drawLib.initDraw(event.draws[i], event);
                    }
                }
            };

            TournamentLib.prototype.newEvent = function (parent, source) {
                var event = {};
                if (angular.isObject(source)) {
                    angular.extend(event, source);
                }
                this.initEvent(event, parent);
                return event;
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
            return TournamentLib;
        })();
        service.TournamentLib = TournamentLib;

        angular.module('jat.services.tournamentLib', ['jat.services.drawLib']).factory('tournamentLib', function (drawLib) {
            return new TournamentLib(drawLib);
        });
    })(jat.service || (jat.service = {}));
    var service = jat.service;
})(jat || (jat = {}));
//# sourceMappingURL=tournamentLib.js.map
