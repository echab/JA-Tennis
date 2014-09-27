'use strict';
var jat;
(function (jat) {
    (function (main) {
        /** Main controller for the application */
        var mainCtrl = (function () {
            function mainCtrl($modal, selection, mainLib, tournamentLib, drawLib, validation, undo) {
                var _this = this;
                this.$modal = $modal;
                this.selection = selection;
                this.mainLib = mainLib;
                this.tournamentLib = tournamentLib;
                this.drawLib = drawLib;
                this.validation = validation;
                this.undo = undo;
                this.GenerateType = models.GenerateType;
                this.selection.tournament = this.tournamentLib.newTournament();

                this.mainLib.loadTournament('/data/tournament8.json').then(function (data) {
                    _this.mainLib.select(data.events[0].draws[data.events[0].draws.length - 1], 4 /* Draw */);
                });
            }
            //#region tournament
            mainCtrl.prototype.loadTournament = function () {
                //TODO browse for file
                //this.mainLib.loadTournament('xxx.json');
            };
            mainCtrl.prototype.saveTournament = function () {
                this.mainLib.saveTournament(this.selection.tournament, '');
            };

            //#endregion tournament
            mainCtrl.prototype.select = function (item) {
                this.mainLib.select(item);
            };

            //#region player
            mainCtrl.prototype.addPlayer = function () {
                var _this = this;
                var newPlayer = this.tournamentLib.newPlayer(this.selection.tournament);

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
            mainCtrl.prototype.addEvent = function (after) {
                var _this = this;
                var newEvent = this.tournamentLib.newEvent(this.selection.tournament);

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
                        _this.mainLib.addEvent(_this.selection.tournament, newEvent, after); //TODO add event after selected event
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
            mainCtrl.prototype.addDraw = function (after) {
                var _this = this;
                var newDraw = this.drawLib.newDraw(this.selection.event, undefined, after);

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
                    //TODO add event after selected draw
                    if ('Ok' === result) {
                        _this.mainLib.addDraw(newDraw, 0, after);
                    } else if ('Generate' === result) {
                        _this.mainLib.addDraw(newDraw, 1, after);
                    }
                });
            };

            mainCtrl.prototype.editDraw = function (draw) {
                var _this = this;
                var editedDraw = this.drawLib.newDraw(draw._event, draw);

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

            mainCtrl.prototype.lockDraw = function (draw, lock) {
                //TODO
                draw.locked = lock;
            };

            mainCtrl.prototype.validateDraw = function (draw) {
                this.mainLib.validateDraw(draw);
            };

            mainCtrl.prototype.generateDraw = function (draw, generate) {
                this.mainLib.updateDraw(draw, undefined, generate || 1 /* Create */);
            };

            mainCtrl.prototype.updateQualif = function (draw) {
                this.mainLib.updateQualif(draw);
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
                this.mainLib.select(this.undo.undo(), this.undo.getMeta());
            };
            mainCtrl.prototype.doRedo = function () {
                this.mainLib.select(this.undo.redo(), this.undo.getMeta());
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
            'jat.services.knockout',
            'jat.services.roundrobin',
            'jat.services.validation',
            'jat.services.validation.knockout',
            'jat.services.validation.roundrobin',
            'jat.services.validation.fft',
            'jat.player.dialog',
            'jat.player.list',
            'jat.event.dialog',
            'jat.event.list',
            'jat.draw.dialog',
            'jat.draw.list',
            'jat.draw.box',
            'jat.match.dialog',
            'ec.panels',
            'ui.bootstrap']).controller('mainCtrl', mainCtrl);
    })(jat.main || (jat.main = {}));
    var main = jat.main;
})(jat || (jat = {}));
//# sourceMappingURL=main.js.map
