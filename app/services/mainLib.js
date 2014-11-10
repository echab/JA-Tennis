var jat;
(function (jat) {
    (function (service) {
        var MainLib = (function () {
            function MainLib($log, $http, $q, $window, selection, tournamentLib, drawLib, validation, //private rank: ServiceRank,
            undo, find, guid) {
                this.$log = $log;
                this.$http = $http;
                this.$q = $q;
                this.$window = $window;
                this.selection = selection;
                this.tournamentLib = tournamentLib;
                this.drawLib = drawLib;
                this.validation = validation;
                this.undo = undo;
                this.find = find;
                this.guid = guid;
            }
            MainLib.prototype.newTournament = function () {
                var tournament = {
                    id: this.guid.create('T'),
                    info: {
                        name: ''
                    },
                    players: [],
                    events: []
                };
                this.select(tournament, 1 /* Tournament */);
                return tournament;
            };

            MainLib.prototype.loadTournament = function (file_url) {
                var _this = this;
                var deferred = this.$q.defer();
                if (!file_url) {
                    var data = this.$window.localStorage['tournament'];
                    if (data) {
                        var tournament = angular.fromJson(data);
                        this.tournamentLib.initTournament(tournament);
                        this.select(tournament, 1 /* Tournament */);
                        deferred.resolve(tournament);
                    } else {
                        deferred.reject('nothing in storage');
                    }
                } else if ('string' === typeof file_url) {
                    this.$http.get(file_url).success(function (tournament, status) {
                        tournament._url = file_url;
                        _this.tournamentLib.initTournament(tournament);
                        _this.select(tournament, 1 /* Tournament */);
                        deferred.resolve(tournament);
                    }).error(function (data, status) {
                        deferred.reject(data);
                    });
                } else {
                    var reader = new FileReader();
                    reader.addEventListener('loadend', function () {
                        try  {
                            var tournament = angular.fromJson(reader.result);
                            tournament._url = file_url;
                            _this.tournamentLib.initTournament(tournament);
                            _this.select(tournament, 1 /* Tournament */);
                            deferred.resolve(tournament);
                        } catch (ex) {
                            deferred.reject(ex.message);
                        }
                    });
                    reader.addEventListener('onerror', function () {
                        return deferred.reject(reader.error.name);
                    });
                    reader.addEventListener('onabort', function () {
                        return deferred.reject('aborted');
                    });

                    reader.readAsText(file_url);
                }
                return deferred.promise;
            };

            MainLib.prototype.saveTournament = function (tournament, url) {
                var data = {};
                tool.copy(tournament, data);
                if (!url) {
                    //this.$log.info(angular.toJson(data, true));
                    this.$window.localStorage['tournament'] = angular.toJson(data);
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
                this.select(newPlayer, 2 /* Player */);
            };

            MainLib.prototype.editPlayer = function (editedPlayer, player) {
                var isSelected = this.selection.player === player;
                var c = editedPlayer._tournament.players;
                var i = this.find.indexOf(c, "id", editedPlayer.id, "Player to update not found");
                this.undo.update(c, i, editedPlayer, "Edit " + editedPlayer.name + " " + i, 2 /* Player */); //c[i] = editedPlayer;
                if (isSelected) {
                    this.select(editedPlayer, 2 /* Player */);
                }
            };

            MainLib.prototype.removePlayer = function (player) {
                var c = player._tournament.players;
                var i = this.find.indexOf(c, "id", player.id, "Player to remove not found");
                this.undo.remove(c, i, "Delete " + player.name + " " + i, 2 /* Player */); //c.splice( i, 1);
                if (this.selection.player === player) {
                    this.select(c[i] || c[i - 1], 2 /* Player */); //select next or previous
                }
            };

            //#endregion player
            //#region event
            MainLib.prototype.addEvent = function (tournament, newEvent, afterEvent) {
                var c = tournament.events;
                var index = afterEvent ? this.find.indexOf(c, 'id', afterEvent.id) + 1 : c.length;

                newEvent.id = this.guid.create('e');
                this.undo.insert(c, index, newEvent, "Add " + newEvent.name, 3 /* Event */); //c.push( newEvent);
                this.select(newEvent, 3 /* Event */);
            };

            MainLib.prototype.editEvent = function (editedEvent, event) {
                var isSelected = this.selection.event === event;
                var c = editedEvent._tournament.events;
                var i = this.find.indexOf(c, "id", editedEvent.id, "Event to edit not found");
                this.undo.update(c, i, editedEvent, "Edit " + editedEvent.name + " " + i, 3 /* Event */); //c[i] = editedEvent;
                if (isSelected) {
                    this.select(editedEvent, 3 /* Event */);
                }
            };

            MainLib.prototype.removeEvent = function (event) {
                var c = event._tournament.events;
                var i = this.find.indexOf(c, "id", event.id, "Event to remove not found");
                this.undo.remove(c, i, "Delete " + c[i].name + " " + i, 3 /* Event */); //c.splice( i, 1);
                if (this.selection.event === event) {
                    this.select(c[i] || c[i - 1], 3 /* Event */);
                }
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
                    this.undo.splice(c, afterIndex + 1, 0, draws, "Add " + draw.name, 4 /* Draw */); //c.splice( i, 1, draws);

                    for (var i = 0; i < draws.length; i++) {
                        this.drawLib.initDraw(draws[i], draw._event);
                    }
                    this.select(draws[0], 4 /* Draw */);
                } else {
                    draw.id = this.guid.create('d');
                    this.undo.insert(c, afterIndex + 1, draw, "Add " + draw.name, 4 /* Draw */); //c.push( draw);
                    this.select(draw, 4 /* Draw */);
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
                    this.select(draw, 4 /* Draw */);
                    this.drawLib.refresh(draw); //force angular refresh
                }
            };

            MainLib.prototype.updateQualif = function (draw) {
                var _this = this;
                this.undo.newGroup('Update qualified', function () {
                    _this.drawLib.updateQualif(draw);
                    return true;
                }, draw);
            };

            MainLib.prototype.removeDraw = function (draw) {
                var c = draw._event.draws;
                var i = this.find.indexOf(c, "id", draw.id, "Draw to remove not found");
                this.undo.remove(c, i, "Delete " + draw.name + " " + i, 4 /* Draw */); //c.splice( i, 1);
                if (this.selection.draw === draw) {
                    this.select(c[i] || c[i - 1], 4 /* Draw */); //select next or previous
                }
            };

            MainLib.prototype.validateDraw = function (draw) {
                this.validation.resetDraw(draw);
                this.validation.validateDraw(draw);
                if (this.selection.draw === draw) {
                    this.drawLib.refresh(draw); //force angular refresh
                }
            };

            //#endregion draw
            //#region match
            MainLib.prototype.editMatch = function (editedMatch, match) {
                var _this = this;
                this.drawLib.initBox(editedMatch, editedMatch._draw);
                var c = match._draw.boxes;
                var i = this.find.indexOf(c, "position", editedMatch.position, "Match to edit not found");
                this.undo.newGroup("Edit match", function () {
                    _this.undo.update(c, i, editedMatch, "Edit " + editedMatch.position + " " + i, 5 /* Match */); //c[i] = editedMatch;
                    if (editedMatch.qualifOut) {
                        //report qualified player to next draw
                        var nextGroup = _this.drawLib.nextGroup(editedMatch._draw);
                        if (nextGroup) {
                            var boxIn = _this.drawLib.FindQualifieEntrant(nextGroup, editedMatch.qualifOut);
                            if (boxIn) {
                                //this.undo.update(boxIn, 'playerId', editedMatch.playerId, 'Set player');  //boxIn.playerId = editedMatch.playerId;
                                //this.undo.update(boxIn, '_player', editedMatch._player, 'Set player');  //boxIn._player = editedMatch._player;
                                _this.undo.update(boxIn, 'playerId', editedMatch.playerId, 'Set player', function () {
                                    return _this.drawLib.initBox(boxIn, boxIn._draw);
                                }); //boxIn.playerId = editedMatch.playerId;
                            }
                        }
                    }
                    return true;
                });
            };
            MainLib.prototype.erasePlayer = function (box) {
                var _this = this;
                //this.undo.newGroup("Erase player", () => {
                //    this.undo.update(box, 'playerId', null);  //box.playerId = undefined;
                //    this.undo.update(box, '_player', null);  //box._player = undefined;
                //    return true;
                //}, box);
                this.undo.update(box, 'playerId', null, "Erase player", function () {
                    return _this.drawLib.initBox(box, box._draw);
                }); //box.playerId = undefined;
            };

            //#endregion match
            MainLib.prototype.select = function (r, type) {
                var sel = this.selection;
                if (r) {
                    if (type === 6 /* Box */ || ('_player' in r && r._draw)) {
                        sel.tournament = r._draw._event._tournament;
                        sel.event = r._draw._event;
                        sel.draw = r._draw;
                        sel.box = r;
                    } else if (type === 4 /* Draw */ || r._event) {
                        sel.tournament = r._event._tournament;
                        sel.event = r._event;
                        sel.draw = r;
                        sel.box = undefined;
                    } else if (type === 3 /* Event */ || (r.draws && r._tournament)) {
                        sel.tournament = r._tournament;
                        sel.event = r;
                        sel.draw = r.draws ? r.draws[0] : undefined;
                        sel.box = undefined;
                    } else if (type === 2 /* Player */ || (r.name && r._tournament)) {
                        sel.tournament = r._tournament;
                        sel.player = r;
                    } else if (type === 1 /* Tournament */ || (r.players && r.events)) {
                        sel.tournament = r;
                        if (sel.tournament.events[0]) {
                            sel.event = sel.tournament.events[0];
                            sel.draw = sel.event && sel.event.draws ? sel.event.draws[sel.event.draws.length - 1] : undefined;
                        } else {
                            sel.event = undefined;
                            sel.draw = undefined;
                        }
                        sel.box = undefined;
                        if (sel.player && sel.player._tournament !== sel.tournament) {
                            sel.player = undefined;
                        }
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
                        case 6 /* Box */:
                            sel.box = undefined;
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
            'jat.services.guid',
            'jat.services.type',
            'jat.services.tournamentLib',
            'jat.services.drawLib',
            'jat.services.knockout',
            'jat.services.roundrobin',
            'jat.services.validation',
            'jat.services.validation.knockout',
            'jat.services.validation.roundrobin',
            'jat.services.validation.fft'
        ]).factory('mainLib', [
            '$log',
            '$http',
            '$q',
            '$window',
            'selection',
            'tournamentLib',
            'drawLib',
            'knockout',
            'roundrobin',
            'validation',
            'knockoutValidation',
            'roundrobinValidation',
            'fftValidation',
            'undo',
            'find',
            'guid',
            function ($log, $http, $q, $window, selection, tournamentLib, drawLib, knockout, roundrobin, validation, knockoutValidation, roundrobinValidation, fftValidation, //rank: ServiceRank,
            undo, find, guid) {
                return new MainLib($log, $http, $q, $window, selection, tournamentLib, drawLib, validation, undo, find, guid);
            }]);
    })(jat.service || (jat.service = {}));
    var service = jat.service;
})(jat || (jat = {}));
//# sourceMappingURL=mainLib.js.map
