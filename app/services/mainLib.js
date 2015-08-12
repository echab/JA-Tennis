var jat;
(function (jat) {
    var service;
    (function (service) {
        var MainLib = (function () {
            function MainLib($log, $http, $q, $window, selection, tournamentLib, services, drawLib, validation, 
                //private rank: Rank,
                undo, find, guid) {
                this.$log = $log;
                this.$http = $http;
                this.$q = $q;
                this.$window = $window;
                this.selection = selection;
                this.tournamentLib = tournamentLib;
                this.services = services;
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
                this.selection.select(tournament, models.ModelType.Tournament);
                return tournament;
            };
            /** This function load tournament data from an url. */
            MainLib.prototype.loadTournament = function (file_url) {
                var _this = this;
                var deferred = this.$q.defer();
                if (!file_url) {
                    var data = this.$window.localStorage['tournament'];
                    if (data) {
                        var tournament = angular.fromJson(data);
                        this.tournamentLib.initTournament(tournament);
                        this.selection.select(tournament, models.ModelType.Tournament);
                        deferred.resolve(tournament);
                    }
                    else {
                        deferred.reject('nothing in storage');
                    }
                }
                else if (typeof file_url === 'string') {
                    this.$http.get(file_url)
                        .success(function (tournament, status) {
                        tournament._url = file_url;
                        _this.tournamentLib.initTournament(tournament);
                        _this.selection.select(tournament, models.ModelType.Tournament);
                        deferred.resolve(tournament);
                    })
                        .error(function (data, status) {
                        deferred.reject(data);
                    });
                }
                else {
                    var reader = new FileReader();
                    reader.addEventListener('loadend', function () {
                        try {
                            var tournament = angular.fromJson(reader.result);
                            tournament._url = file_url.name; //TODO missing path
                            _this.tournamentLib.initTournament(tournament);
                            _this.selection.select(tournament, models.ModelType.Tournament);
                            deferred.resolve(tournament);
                        }
                        catch (ex) {
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
                this.$http.post(url || tournament._url, data)
                    .success(function (data, status) {
                    //TODO
                })
                    .error(function (data, status) {
                    //TODO
                });
            };
            //#region player
            MainLib.prototype.addPlayer = function (tournament, newPlayer) {
                var c = tournament.players;
                newPlayer.id = this.guid.create('p');
                this.undo.insert(c, -1, newPlayer, "Add " + newPlayer.name, models.ModelType.Player); //c.push( newPlayer);
                this.selection.select(newPlayer, models.ModelType.Player);
            };
            MainLib.prototype.editPlayer = function (editedPlayer, player) {
                var isSelected = this.selection.player === player;
                var c = editedPlayer._tournament.players;
                var i = this.find.indexOf(c, "id", editedPlayer.id, "Player to update not found");
                this.undo.update(c, i, editedPlayer, "Edit " + editedPlayer.name + " " + i, models.ModelType.Player); //c[i] = editedPlayer;
                if (isSelected) {
                    this.selection.select(editedPlayer, models.ModelType.Player);
                }
            };
            MainLib.prototype.removePlayer = function (player) {
                var c = player._tournament.players;
                var i = this.find.indexOf(c, "id", player.id, "Player to remove not found");
                this.undo.remove(c, i, "Delete " + player.name + " " + i, models.ModelType.Player); //c.splice( i, 1);
                if (this.selection.player === player) {
                    this.selection.select(c[i] || c[i - 1], models.ModelType.Player); //select next or previous
                }
            };
            //#endregion player
            //#region event
            MainLib.prototype.addEvent = function (tournament, newEvent, afterEvent) {
                var c = tournament.events;
                var index = afterEvent ? this.find.indexOf(c, 'id', afterEvent.id) + 1 : c.length;
                newEvent.id = this.guid.create('e');
                this.undo.insert(c, index, newEvent, "Add " + newEvent.name, models.ModelType.Event); //c.push( newEvent);
                this.selection.select(newEvent, models.ModelType.Event);
            };
            MainLib.prototype.editEvent = function (editedEvent, event) {
                var isSelected = this.selection.event === event;
                var c = editedEvent._tournament.events;
                var i = this.find.indexOf(c, "id", editedEvent.id, "Event to edit not found");
                this.undo.update(c, i, editedEvent, "Edit " + editedEvent.name + " " + i, models.ModelType.Event); //c[i] = editedEvent;
                if (isSelected) {
                    this.selection.select(editedEvent, models.ModelType.Event);
                }
            };
            MainLib.prototype.removeEvent = function (event) {
                var c = event._tournament.events;
                var i = this.find.indexOf(c, "id", event.id, "Event to remove not found");
                this.undo.remove(c, i, "Delete " + c[i].name + " " + i, models.ModelType.Event); //c.splice( i, 1);
                if (this.selection.event === event) {
                    this.selection.select(c[i] || c[i - 1], models.ModelType.Event);
                }
            };
            //#endregion event
            //#region draw
            MainLib.prototype.addDraw = function (draw, generate, afterDraw) {
                var c = draw._event.draws;
                var afterIndex = afterDraw ? this.find.indexOf(c, 'id', afterDraw.id) : c.length - 1;
                if (generate) {
                    var drawLib = this.services.drawLibFor(draw);
                    var draws = drawLib.generateDraw(draw, generate, afterIndex);
                    if (!draws || !draws.length) {
                        return;
                    }
                    this.undo.splice(c, afterIndex + 1, 0, draws, "Add " + draw.name, models.ModelType.Draw); //c.splice( i, 1, draws);
                    for (var i = 0; i < draws.length; i++) {
                        var drawLib = this.services.drawLibFor(draws[i]);
                        this.drawLib.initDraw(draws[i], draw._event);
                    }
                    this.selection.select(draws[0], models.ModelType.Draw);
                }
                else {
                    draw.id = this.guid.create('d');
                    this.undo.insert(c, afterIndex + 1, draw, "Add " + draw.name, models.ModelType.Draw); //c.push( draw);
                    this.selection.select(draw, models.ModelType.Draw);
                }
            };
            MainLib.prototype.updateDraw = function (draw, oldDraw, generate) {
                var isSelected = this.selection.draw === oldDraw;
                var drawLib = this.services.drawLibFor(draw);
                var group = this.drawLib.group(oldDraw || draw);
                if (generate) {
                    var draws = drawLib.generateDraw(draw, generate, -1);
                    if (!draws || !draws.length) {
                        return;
                    }
                }
                else {
                    drawLib.resize(draw, oldDraw);
                }
                var c = draw._event.draws;
                if (generate && draws && group && draws.length) {
                    var i = this.find.indexOf(c, "id", group[0].id, "Draw to edit not found");
                    this.undo.splice(c, i, group.length, draws, "Generate " + models.GenerateType[generate] + ' ' + draw.name, models.ModelType.Draw);
                    for (var i = 0; i < draws.length; i++) {
                        this.drawLib.initDraw(draws[i], draw._event);
                    }
                    draw = draws[0];
                }
                else {
                    var i = this.find.indexOf(c, "id", draw.id, "Draw to edit not found");
                    this.undo.update(c, i, draw, "Edit " + draw.name + " " + i, models.ModelType.Draw); //c[i] = draw;
                }
                if (isSelected || generate) {
                    this.selection.select(draw, models.ModelType.Draw);
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
                this.undo.remove(c, i, "Delete " + draw.name + " " + i, models.ModelType.Draw); //c.splice( i, 1);
                if (this.selection.draw === draw) {
                    this.selection.select(c[i] || c[i - 1], models.ModelType.Draw); //select next or previous
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
                    _this.undo.update(c, i, editedMatch, "Edit " + editedMatch.position + " " + i, models.ModelType.Match); //c[i] = editedMatch;
                    if (editedMatch.qualifOut) {
                        //report qualified player to next draw
                        var nextGroup = _this.drawLib.nextGroup(editedMatch._draw);
                        if (nextGroup) {
                            var boxIn = _this.drawLib.groupFindPlayerIn(nextGroup, editedMatch.qualifOut);
                            if (boxIn) {
                                //this.undo.update(boxIn, 'playerId', editedMatch.playerId, 'Set player');  //boxIn.playerId = editedMatch.playerId;
                                //this.undo.update(boxIn, '_player', editedMatch._player, 'Set player');  //boxIn._player = editedMatch._player;
                                _this.undo.update(boxIn, 'playerId', editedMatch.playerId, 'Set player', function () { return _this.drawLib.initBox(boxIn, boxIn._draw); }); //boxIn.playerId = editedMatch.playerId;
                            }
                        }
                    }
                    return true;
                });
            };
            //erasePlayer(box: models.Box): void {
            //    //this.undo.newGroup("Erase player", () => {
            //    //    this.undo.update(box, 'playerId', null);  //box.playerId = undefined;
            //    //    this.undo.update(box, '_player', null);  //box._player = undefined;
            //    //    return true;
            //    //}, box);
            //    //this.undo.update(box, 'playerId', null, "Erase player",     //box.playerId = undefined;
            //    //    () => this.drawLib.initBox(box, box._draw)
            //    //    );  
            //    var prev = box.playerId;
            //    this.undo.action((bUndo: boolean) => {
            //        box.playerId = bUndo ? prev : undefined;
            //        this.drawLib.initBox(box, box._draw)
            //        this.selection.select(box, models.ModelType.Box);
            //    }, "Erase player");
            //}
            //eraseScore(match: models.Match): void {
            //    this.undo.newGroup("Erase score", () => {
            //        this.undo.update(match, 'score', '');  //box.score = '';
            //        return true;
            //    }, match);
            //}
            MainLib.prototype.erasePlanning = function (match) {
                var _this = this;
                this.undo.newGroup("Erase player", function () {
                    _this.undo.update(match, 'place', null); //match.place = undefined;
                    _this.undo.update(match, 'date', null); //match.date = undefined;
                    return true;
                }, match);
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
            'jat.services.services',
            'jat.services.drawLib',
            'jat.services.knockout',
            'jat.services.roundrobin',
            'jat.services.validation',
            'jat.services.validation.knockout',
            'jat.services.validation.roundrobin',
            'jat.services.validation.fft'
        ])
            .factory('mainLib', [
            '$log',
            '$http',
            '$q',
            '$window',
            'selection',
            'tournamentLib',
            'services',
            'drawLib',
            'knockout',
            'roundrobin',
            'validation',
            'knockoutValidation',
            'roundrobinValidation',
            'fftValidation',
            //'rank',
            'undo',
            'find',
            'guid',
            function ($log, $http, $q, $window, selection, tournamentLib, services, drawLib, knockout, roundrobin, validation, knockoutValidation, roundrobinValidation, fftValidation, 
                //rank: Rank,
                undo, find, guid) {
                return new MainLib($log, $http, $q, $window, selection, tournamentLib, services, drawLib, validation, undo, find, guid);
            }]);
    })(service = jat.service || (jat.service = {}));
})(jat || (jat = {}));
