var jat;
(function (jat) {
    (function (service) {
        var MainLib = (function () {
            function MainLib($log, $http, $q, selection, tournamentLib, drawLib, //private rank: ServiceRank,
            undo, find, guid) {
                this.$log = $log;
                this.$http = $http;
                this.$q = $q;
                this.selection = selection;
                this.tournamentLib = tournamentLib;
                this.drawLib = drawLib;
                this.undo = undo;
                this.find = find;
                this.guid = guid;
            }
            /** This function load tournament data from an url. */
            MainLib.prototype.loadTournament = function (url) {
                var _this = this;
                var deferred = this.$q.defer();
                this.$http.get(url).success(function (data, status) {
                    _this.tournamentLib.initTournament(data);

                    data._url = url;

                    _this.selection.tournament = data;
                    _this.selection.event = data.events[0];
                    _this.selection.draw = data.events[0] ? data.events[0].draws[0] : undefined;
                    _this.selection.player = undefined;
                    _this.selection.match = undefined;

                    deferred.resolve(data);
                }).error(function (data, status) {
                    deferred.reject(data);
                });

                return deferred.promise;
            };

            MainLib.prototype.saveTournament = function (tournament, url) {
                var data = {};
                models.copy(tournament, data);
                if (!url) {
                    this.$log.info(angular.toJson(data, true));
                    return;
                }
                this.$http.post(url || tournament._url, data).success(function (data, status) {
                    //TODO
                }).error(function (data, status) {
                    //TODO
                });
            };

            //#region player
            MainLib.prototype.addPlayer = function (tournament, newPlayer) {
                var c = tournament.players;
                newPlayer.id = this.guid.create('p');

                this.undo.insert(c, -1, newPlayer, "Add " + newPlayer.name, 2 /* Player */); //c.push( newPlayer);
                this.selection.player = newPlayer;
            };

            MainLib.prototype.editPlayer = function (editedPlayer, player) {
                var isSelected = this.selection.player === player;
                var c = this.selection.tournament.players;
                var i = this.find.indexOf(c, "id", editedPlayer.id, "Player to update not found");
                this.undo.update(c, i, editedPlayer, "Edit " + editedPlayer.name + " " + i, 2 /* Player */); //c[i] = editedPlayer;
                if (isSelected) {
                    this.selection.player = editedPlayer;
                }
            };

            MainLib.prototype.removePlayer = function (player) {
                var c = player._tournament.players;
                var i = this.find.indexOf(c, "id", player.id, "Player to remove not found");
                if (this.selection.player === player) {
                    this.selection.player = c[i + 1] || c[i - 1]; //select next or previous
                }
                this.undo.remove(c, i, "Delete " + player.name + " " + i, 2 /* Player */); //c.splice( i, 1);
                this.select(c[i] || c[i + 1], 2 /* Player */);
            };

            //#endregion player
            //#region event
            MainLib.prototype.addEvent = function (tournament, newEvent, afterEvent) {
                var c = tournament.events;
                var index = afterEvent ? this.find.indexOf(c, 'id', afterEvent.id) + 1 : c.length;

                newEvent.id = this.guid.create('e');
                this.undo.insert(c, index, newEvent, "Add " + newEvent.name, 3 /* Event */); //c.push( newEvent);
                this.selection.event = newEvent;
            };

            MainLib.prototype.editEvent = function (editedEvent, event) {
                var isSelected = this.selection.event === event;
                var c = this.selection.tournament.events;
                var i = this.find.indexOf(c, "id", editedEvent.id, "Event to edit not found");
                this.undo.update(c, i, editedEvent, "Edit " + editedEvent.name + " " + i, 3 /* Event */); //c[i] = editedEvent;
                if (isSelected) {
                    this.selection.event = editedEvent;
                }
            };

            MainLib.prototype.removeEvent = function (event) {
                var c = event._tournament.events;
                var i = this.find.indexOf(c, "id", event.id, "Event to remove not found");
                if (this.selection.event === event) {
                    this.selection.event = c[i + 1] || c[i - 2]; //select next or previous
                }
                this.undo.remove(c, i, "Delete " + c[i].name + " " + i, 3 /* Event */); //c.splice( i, 1);
                this.select(c[i] || c[i + 1], 3 /* Event */);
            };

            //#endregion event
            //#region draw
            MainLib.prototype.addDraw = function (draw, generate, afterDraw) {
                var c = draw._event.draws;
                var afterIndex = afterDraw ? this.find.indexOf(c, 'id', afterDraw.id) : c.length - 1;

                if (generate) {
                    var draws = this.drawLib.generateDraw(draw, generate, afterIndex);
                    if (!draws || !draws.length) {
                        return;
                    }
                    this.undo.splice(c, afterIndex + 1, 0, draws, "Add " + draw.name, 4 /* Draw */);

                    for (var i = 0; i < draws.length; i++) {
                        this.drawLib.initDraw(draws[i], draw._event);
                    }
                    this.selection.draw = draws[0];
                } else {
                    draw.id = this.guid.create('d');
                    this.undo.insert(c, afterIndex + 1, draw, "Add " + draw.name, 4 /* Draw */); //c.push( draw);
                    this.selection.draw = draw;
                }
            };

            MainLib.prototype.updateDraw = function (draw, oldDraw, generate) {
                var isSelected = this.selection.draw === oldDraw;
                var group = this.drawLib.group(oldDraw || draw);
                if (generate) {
                    var draws = this.drawLib.generateDraw(draw, generate, -1);
                    if (!draws || !draws.length) {
                        return;
                    }
                } else {
                    this.drawLib.resize(draw, oldDraw);
                }
                var c = draw._event.draws;
                if (generate && draws && group && draws.length) {
                    var i = this.find.indexOf(c, "id", group[0].id, "Draw to edit not found");
                    this.undo.splice(c, i, group.length, draws, "Generate " + models.GenerateType[generate] + ' ' + draw.name, 4 /* Draw */);

                    for (var i = 0; i < draws.length; i++) {
                        this.drawLib.initDraw(draws[i], draw._event);
                    }
                    draw = draws[0];
                } else {
                    var i = this.find.indexOf(c, "id", draw.id, "Draw to edit not found");
                    this.undo.update(c, i, draw, "Edit " + draw.name + " " + i, 4 /* Draw */); //c[i] = draw;
                }
                if (isSelected || generate) {
                    this.selection.draw = draw;
                    this.refresh(draw); //force angular refresh
                }
            };

            MainLib.prototype.removeDraw = function (draw) {
                var c = draw._event.draws;
                var i = this.find.indexOf(c, "id", draw.id, "Draw to remove not found");
                if (this.selection.draw === draw) {
                    this.selection.draw = c[i] || c[i - 1]; //select next or previous
                }
                this.undo.remove(c, i, "Delete " + draw.name + " " + i, 4 /* Draw */); //c.splice( i, 1);
                this.select(c[i] || c[i + 1], 4 /* Draw */);
            };

            MainLib.prototype.refresh = function (draw) {
                draw._refresh = new Date(); //force angular refresh
            };

            //#endregion draw
            //#region match
            MainLib.prototype.editMatch = function (editedMatch, match) {
                var c = match._draw.boxes;
                var i = this.find.indexOf(c, "position", editedMatch.position, "Match to edit not found");
                this.undo.newGroup("Edit match");
                this.undo.update(c, i, editedMatch, "Edit " + editedMatch.position + " " + i, 5 /* Match */); //c[i] = editedMatch;

                //if (!match.playerId && editedMatch.playerId) {
                //    var nextMatch = drawLib.positionMatch(match.position);
                //    //TODO
                //}
                this.undo.endGroup();
            };

            //#endregion match
            MainLib.prototype.doUndo = function () {
                this.select(this.undo.undo(), this.undo.getMeta());
            };
            MainLib.prototype.doRedo = function () {
                this.select(this.undo.redo(), this.undo.getMeta());
            };

            MainLib.prototype.select = function (r, type) {
                var sel = this.selection;
                if (r) {
                    if (r.playerId && r._draw) {
                        sel.tournament = r._draw._event._tournament;
                        sel.event = r._draw._event;
                        sel.draw = r._draw;
                        sel.match = r;
                    } else if (r._event) {
                        sel.tournament = r._event._tournament;
                        sel.event = r._event;
                        sel.draw = r;
                        sel.match = undefined;
                    } else if (r.draws && r._tournament) {
                        sel.tournament = r._tournament;
                        sel.event = r;
                        sel.draw = r.draws[0];
                        sel.match = undefined;
                    } else if (r.name && r._tournament) {
                        sel.tournament = r._tournament;
                        sel.player = r;
                    } else if (r.players && r.events) {
                        sel.tournament = r;
                        sel.event = undefined;
                        sel.draw = undefined;
                        sel.match = undefined;
                        sel.player = undefined;
                    }
                } else if (type) {
                    switch (type) {
                        case 1 /* Tournament */:
                            sel.tournament = undefined;
                            sel.player = undefined;
                        case 3 /* Event */:
                            sel.event = undefined;
                        case 4 /* Draw */:
                            sel.draw = undefined;
                        case 5 /* Match */:
                            sel.match = undefined;
                            break;
                        case 2 /* Player */:
                            sel.player = undefined;
                    }
                }
            };
            return MainLib;
        })();
        service.MainLib = MainLib;

        angular.module('jat.services.mainLib', [
            'jat.services.selection',
            'jat.services.find',
            'jat.services.undo',
            'jat.services.type',
            'jat.services.tournamentLib',
            'jat.services.drawLib',
            'jat.services.knockout',
            'jat.services.roundrobin'
        ]).factory('mainLib', function ($log, $http, $q, selection, tournamentLib, drawLib, knockout, roundrobin, //rank: ServiceRank,
        undo, find, guid) {
            return new MainLib($log, $http, $q, selection, tournamentLib, drawLib, undo, find, guid);
        });
    })(jat.service || (jat.service = {}));
    var service = jat.service;
})(jat || (jat = {}));
//# sourceMappingURL=mainLib.js.map
