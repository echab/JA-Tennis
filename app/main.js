'use strict';
var jat;
(function (jat) {
    (function (main) {
        var mainCtrl = (function () {
            function mainCtrl($log, $modal, selection, mainLib, tournamentLib, drawLib, undo) {
                var _this = this;
                this.$log = $log;
                this.$modal = $modal;
                this.selection = selection;
                this.mainLib = mainLib;
                this.tournamentLib = tournamentLib;
                this.drawLib = drawLib;
                this.undo = undo;
                this.selection.tournament = this.tournamentLib.newTournament();

                this.mainLib.loadTournament('/data/tournament4.json').then(function (data) {
                    _this.selection.tournament = data;
                    _this.selection.event = data.events[0];
                    _this.selection.draw = data.events[0].draws[0];
                    _this.selection.player = undefined;
                    _this.selection.match = undefined;
                });
            }
            //#region tournament
            mainCtrl.prototype.loadTournament = function () {
                //TODO browse for file
                //this.mainLib.loadTournament('xxx.json');
            };
            mainCtrl.prototype.saveTournament = function () {
                this.mainLib.saveTournament(this.selection.tournament, 'xxx');
            };

            //#endregion tournament
            //#region player
            mainCtrl.prototype.addPlayer = function (player) {
                var _this = this;
                var newPlayer = this.tournamentLib.newPlayer(this.selection.tournament, player);

                this.$modal.open({
                    templateUrl: 'player/dialogPlayer.html',
                    controller: 'dialogPlayerCtrl as dlg',
                    resolve: {
                        title: function () {
                            return "New player";
                        },
                        player: function () {
                            return newPlayer;
                        },
                        events: function () {
                            return _this.selection.tournament.events;
                        }
                    }
                }).result.then(function (result) {
                    if ('Ok' === result) {
                        _this.mainLib.addPlayer(_this.selection.tournament, newPlayer);
                    }
                });
            };

            mainCtrl.prototype.editPlayer = function (player) {
                var _this = this;
                var editedPlayer = this.tournamentLib.newPlayer(this.selection.tournament, player);

                this.$modal.open({
                    templateUrl: 'player/dialogPlayer.html',
                    controller: 'dialogPlayerCtrl as dlg',
                    resolve: {
                        title: function () {
                            return "Edit player";
                        },
                        player: function () {
                            return editedPlayer;
                        },
                        events: function () {
                            return _this.selection.tournament.events;
                        }
                    }
                }).result.then(function (result) {
                    if ('Ok' === result) {
                        _this.mainLib.editPlayer(editedPlayer, player);
                    } else if ('Del' === result) {
                        _this.mainLib.removePlayer(player);
                    }
                });
            };
            mainCtrl.prototype.removePlayer = function (player) {
                this.mainLib.removePlayer(player);
            };

            //#endregion player
            //#region event
            mainCtrl.prototype.addEvent = function (event) {
                var _this = this;
                var newEvent = this.tournamentLib.newEvent(this.selection.tournament, event);

                this.$modal.open({
                    templateUrl: 'event/dialogEvent.html',
                    controller: 'dialogEventCtrl as dlg',
                    resolve: {
                        title: function () {
                            return "New event";
                        },
                        event: function () {
                            return newEvent;
                        }
                    }
                }).result.then(function (result) {
                    if ('Ok' === result) {
                        _this.mainLib.addEvent(_this.selection.tournament, newEvent);
                    }
                });
            };

            mainCtrl.prototype.editEvent = function (event) {
                var _this = this;
                var editedEvent = this.tournamentLib.newEvent(this.selection.tournament, event);

                this.$modal.open({
                    templateUrl: 'event/dialogEvent.html',
                    controller: 'dialogEventCtrl as dlg',
                    resolve: {
                        title: function () {
                            return "Edit event";
                        },
                        event: function () {
                            return editedEvent;
                        }
                    }
                }).result.then(function (result) {
                    if ('Ok' === result) {
                        _this.mainLib.editEvent(editedEvent, event);
                    } else if ('Del' === result) {
                        _this.mainLib.removeEvent(event);
                    }
                });
            };

            mainCtrl.prototype.removeEvent = function (event) {
                this.mainLib.removeEvent(event);
            };

            //#endregion event
            //#region draw
            mainCtrl.prototype.addDraw = function (event, draw) {
                var _this = this;
                var newDraw = this.drawLib.newDraw(event, draw);

                this.$modal.open({
                    templateUrl: 'draw/dialogDraw.html',
                    controller: 'dialogDrawCtrl as dlg',
                    resolve: {
                        title: function () {
                            return "New draw";
                        },
                        draw: function () {
                            return newDraw;
                        }
                    }
                }).result.then(function (result) {
                    if ('Ok' === result) {
                        _this.mainLib.updateDraw(newDraw, draw);
                    } else if ('Generate' === result) {
                        _this.mainLib.updateDraw(newDraw, draw, 1);
                    }
                });
            };

            mainCtrl.prototype.editDraw = function (event, draw) {
                var _this = this;
                var editedDraw = this.drawLib.newDraw(event, draw);

                this.$modal.open({
                    templateUrl: 'draw/dialogDraw.html',
                    controller: 'dialogDrawCtrl as dlg',
                    resolve: {
                        title: function () {
                            return "Edit draw";
                        },
                        draw: function () {
                            return editedDraw;
                        }
                    }
                }).result.then(function (result) {
                    if ('Ok' === result) {
                        _this.mainLib.updateDraw(editedDraw, draw);
                    } else if ('Generate' === result) {
                        _this.mainLib.updateDraw(editedDraw, draw, 1);
                    } else if ('Del' === result) {
                        _this.mainLib.removeDraw(draw);
                    }
                });
            };

            mainCtrl.prototype.generateDraw = function (draw, generate) {
                if (!draw) {
                    return;
                }
                this.mainLib.updateDraw(draw, undefined, generate || 1);
            };

            mainCtrl.prototype.removeDraw = function (draw) {
                this.mainLib.removeDraw(draw);
            };

            //#endregion draw
            //#region match
            mainCtrl.prototype.editMatch = function (match) {
                var _this = this;
                var editedMatch = this.drawLib.newBox(match._draw, match);

                this.$modal.open({
                    templateUrl: 'draw/dialogMatch.html',
                    controller: 'dialogMatchCtrl as dlg',
                    resolve: {
                        title: function () {
                            return "Edit match";
                        },
                        match: function () {
                            return editedMatch;
                        }
                    }
                }).result.then(function (result) {
                    if ('Ok' === result) {
                        _this.mainLib.editMatch(editedMatch, match);
                    }
                });
            };

            //#endregion match
            mainCtrl.prototype.doUndo = function () {
                this.mainLib.select(this.undo.undo());
            };
            mainCtrl.prototype.doRedo = function () {
                this.mainLib.select(this.undo.redo());
            };
            return mainCtrl;
        })();
        main.mainCtrl = mainCtrl;

        angular.module('jat.main', [
            'jat.services.mainLib',
            'jat.services.selection',
            'jat.services.undo',
            'jat.services.tournamentLib',
            'jat.services.drawLib',
            'jat.services.knockoutLib',
            'jat.services.roundrobinLib',
            'jat.player.dialog',
            'jat.player.list',
            'jat.event.dialog',
            'jat.event.list',
            'jat.draw.dialog',
            'jat.draw.list',
            'jat.draw.box',
            'jat.match.dialog',
            'ui.bootstrap']).controller('mainCtrl', mainCtrl);
    })(jat.main || (jat.main = {}));
    var main = jat.main;
})(jat || (jat = {}));
//# sourceMappingURL=main.js.map
