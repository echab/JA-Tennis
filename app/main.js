'use strict';
var jat;
(function (jat) {
    (function (main) {
        var mainCtrl = (function () {
            function mainCtrl($log, $http, $modal, selection, tournamentLib, drawLib, knockoutLib, roundrobinLib, undo, find) {
                this.$log = $log;
                this.$http = $http;
                this.$modal = $modal;
                this.selection = selection;
                this.tournamentLib = tournamentLib;
                this.drawLib = drawLib;
                this.knockoutLib = knockoutLib;
                this.roundrobinLib = roundrobinLib;
                this.undo = undo;
                this.find = find;
                selection.tournament = this.tournamentLib.newTournament();

                this.loadTournament('/data/tournament4.json');
            }
            mainCtrl.prototype.loadTournament = function (url) {
                var _this = this;
                //console.info("Loading tournament1...");
                this.$http.get(url).success(function (data, status) {
                    _this.tournamentLib.initTournament(data);

                    _this.selection = {
                        tournament: data,
                        event: data.events[0],
                        draw: data.events[0].draws[1],
                        player: undefined,
                        match: undefined
                    };
                    //console.info("Tournament loaded.");
                }).error(function (data, status) {
                    //TODO
                });
            };

            mainCtrl.prototype.saveTournament = function (url) {
                var data = {};
                models.copy(this.selection.tournament, data);
                if (!url) {
                    this.$log.info(angular.toJson(data, true));
                    return;
                }
                this.$http.post(url, data).success(function (data, status) {
                    //TODO
                }).error(function (data, status) {
                    //TODO
                });
            };

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
                        _this.doAddPlayer(newPlayer);
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
                        _this.doEditPlayer(editedPlayer, player);
                    } else if ('Del' === result) {
                        _this.removePlayer(player);
                    }
                });
            };

            mainCtrl.prototype.doAddPlayer = function (newPlayer) {
                var c = this.selection.tournament.players;
                newPlayer.id = 'P' + c.length; //TODO generate id

                this.undo.insert(c, -1, newPlayer, "Add " + newPlayer.name); //c.push( newPlayer);
                this.selection.player = newPlayer;
            };

            mainCtrl.prototype.doEditPlayer = function (editedPlayer, player) {
                var isSelected = this.selection.player === player;
                var c = this.selection.tournament.players;
                var i = this.find.indexOf(c, "id", editedPlayer.id, "Player to update not found");
                this.undo.update(c, i, editedPlayer, "Edit " + editedPlayer.name + " " + i); //c[i] = editedPlayer;
                if (isSelected) {
                    this.selection.player = editedPlayer;
                }
            };

            mainCtrl.prototype.removePlayer = function (player) {
                if (this.selection.player === player) {
                    this.selection.player = undefined;
                }
                var c = this.selection.tournament.players;
                var i = this.find.indexOf(c, "id", player.id, "Player to remove not found");
                this.undo.remove(c, i, "Delete " + player.name + " " + i); //c.splice( i, 1);
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
                        _this.doAddEvent(newEvent);
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
                        _this.doEditEvent(editedEvent, event);
                    } else if ('Del' === result) {
                        _this.removeEvent(event);
                    }
                });
            };

            mainCtrl.prototype.doAddEvent = function (newEvent) {
                var c = this.selection.tournament.events;
                newEvent.id = 'E' + c.length; //TODO generate id
                this.undo.insert(c, -1, newEvent, "Add " + newEvent.name); //c.push( newEvent);
                this.selection.event = newEvent;
            };
            mainCtrl.prototype.doEditEvent = function (editedEvent, event) {
                var isSelected = this.selection.event === event;
                var c = this.selection.tournament.events;
                var i = this.find.indexOf(c, "id", editedEvent.id, "Event to edit not found");
                this.undo.update(c, i, editedEvent, "Edit " + editedEvent.name + " " + i); //c[i] = editedEvent;
                if (isSelected) {
                    this.selection.event = editedEvent;
                }
            };

            mainCtrl.prototype.removeEvent = function (event) {
                if (this.selection.event === event) {
                    this.selection.event = undefined;
                }
                var c = this.selection.tournament.events;
                var i = this.find.indexOf(c, "id", event.id, "Event to remove not found");
                this.undo.remove(c, i, "Delete " + c[i].name + " " + i); //c.splice( i, 1);
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
                        _this.updateDraw(newDraw, draw);
                    } else if ('Generate' === result) {
                        _this.updateDraw(newDraw, draw, 1);
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
                        _this.updateDraw(editedDraw, draw);
                    } else if ('Generate' === result) {
                        _this.updateDraw(editedDraw, draw, 1);
                    } else if ('Del' === result) {
                        _this.removeDraw(event, draw);
                    }
                });
            };

            mainCtrl.prototype.refresh = function (draw) {
                draw._refresh = new Date(); //force angular refresh
            };

            mainCtrl.prototype.updateDraw = function (draw, oldDraw, generate) {
                var isSelected = this.selection.draw === oldDraw;
                if (generate) {
                    var nOldDraw = this.drawLib.getnSuite(oldDraw || draw);
                    var draws = this.drawLib.generateDraw(draw, generate);
                    if (!draws || !draws.length) {
                        return;
                    }
                } else {
                    this.drawLib.resize(draw, oldDraw);
                }
                var c = draw._event.draws;
                if (nOldDraw && draws && draws.length) {
                    var first = this.drawLib.groupBegin(oldDraw || draw);
                    var i = this.find.indexOf(c, "id", first.id, "Draw to edit not found");
                    this.undo.splice(c, i, nOldDraw, draws, "Replace " + draw.name);
                    for (var i = 0; i < draws.length; i++) {
                        this.drawLib.initDraw(draws[i], draw._event);
                    }
                    draw = draws[0];
                } else if (!draw.id) {
                    draw.id = 'D' + c.length; //TODO generate id
                    this.undo.insert(c, -1, draw, "Add " + draw.name); //c.push( draw);
                } else {
                    var i = this.find.indexOf(c, "id", draw.id, "Draw to edit not found");
                    this.undo.update(c, i, draw, "Edit " + draw.name + " " + i); //c[i] = draw;
                }
                if (isSelected || generate) {
                    this.selection.draw = draw;
                    this.refresh(draw); //force angular refresh
                }
            };

            mainCtrl.prototype.removeDraw = function (event, draw) {
                if (this.selection.draw === draw) {
                    this.selection.draw = undefined;
                }
                var c = event.draws;
                var i = this.find.indexOf(c, "id", draw.id, "Draw to remove not found");
                this.undo.remove(c, i, "Delete " + draw.name + " " + i); //c.splice( i, 1);
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
                        _this.doEditMatch(editedMatch, match);
                    }
                });
            };

            mainCtrl.prototype.doEditMatch = function (editedMatch, match) {
                var c = match._draw.boxes;
                var i = this.find.indexOf(c, "position", editedMatch.position, "Match to edit not found");
                this.undo.newGroup("Edit match");
                this.undo.update(c, i, editedMatch, "Edit " + editedMatch.position + " " + i); //c[i] = editedMatch;

                //if (!match.playerId && editedMatch.playerId) {
                //    var nextMatch = drawLib.positionMatch(match.position);
                //    //TODO
                //}
                this.undo.endGroup();
            };

            //#endregion match
            mainCtrl.prototype.doUndo = function () {
                this.select(this.undo.undo());
            };
            mainCtrl.prototype.doRedo = function () {
                this.select(this.undo.redo());
            };
            mainCtrl.prototype.select = function (r) {
                if (!r) {
                    return;
                }
                if (r.players && r.events) {
                    this.selection.tournament = r;
                    this.selection.event = undefined;
                    this.selection.draw = undefined;
                } else if (r.draws && r._tournament) {
                    this.selection.tournament = r._tournament;
                    this.selection.event = r;
                    this.selection.draw = r.draws[0];
                } else if (r.boxes && r._event) {
                    this.selection.tournament = r._event._tournament;
                    this.selection.event = r._event;
                    this.selection.draw = r;
                } else if (r.playerId && r._draw) {
                    this.selection.tournament = r._draw._event._tournament;
                    this.selection.event = r._draw._event;
                    this.selection.draw = r._draw;
                } else if (r.name && r._tournament) {
                    this.selection.tournament = r._tournament;
                    this.selection.player = r;
                }
            };
            return mainCtrl;
        })();
        main.mainCtrl = mainCtrl;

        angular.module('jat.main', [
            'jat.services.selection',
            'jat.services.find',
            'jat.services.undo',
            'jat.services.type',
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
