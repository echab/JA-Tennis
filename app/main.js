'use strict';
var jat;
(function (jat) {
    var main;
    (function (main) {
        /** Main controller for the application */
        var mainCtrl = (function () {
            function mainCtrl($modal, selection, mainLib, tournamentLib, drawLib, validation, undo, $window, $timeout) {
                var _this = this;
                this.$modal = $modal;
                this.selection = selection;
                this.mainLib = mainLib;
                this.tournamentLib = tournamentLib;
                this.drawLib = drawLib;
                this.validation = validation;
                this.undo = undo;
                this.$window = $window;
                this.$timeout = $timeout;
                this.GenerateType = models.GenerateType;
                this.ModelType = models.ModelType;
                this.Mode = models.Mode;
                this.selection.tournament = this.tournamentLib.newTournament();
                var filename = '/data/tournament8.json';
                //var filename = '/data/to2006.json';
                //Load saved tournament if exists
                //this.mainLib.loadTournament().then((data) => {
                //}, (reason) => {
                this.mainLib.loadTournament(filename).then(function (data) {
                });
                //});
                //Auto save tournament on exit
                var onBeforeUnloadHandler = function (event) {
                    _this.mainLib.saveTournament(_this.selection.tournament);
                };
                if ($window.addEventListener) {
                    $window.addEventListener('beforeunload', onBeforeUnloadHandler);
                }
                else {
                    $window.onbeforeunload = onBeforeUnloadHandler;
                }
            }
            //#region tournament
            mainCtrl.prototype.newTournament = function () {
                //TODO confirmation
                //TODO undo
                this.mainLib.newTournament();
                this.editTournament(this.selection.tournament);
            };
            mainCtrl.prototype.loadTournament = function (file) {
                this.mainLib.loadTournament(file);
            };
            mainCtrl.prototype.saveTournament = function () {
                this.mainLib.saveTournament(this.selection.tournament, '');
            };
            mainCtrl.prototype.editTournament = function (tournament) {
                var _this = this;
                var editedInfo = this.tournamentLib.newInfo(this.selection.tournament.info);
                this.$modal.open({
                    templateUrl: 'tournament/dialogInfo.html',
                    controller: 'dialogInfoCtrl as dlg',
                    resolve: {
                        title: function () { return "Edit info"; },
                        info: function () { return editedInfo; }
                    }
                }).result.then(function (result) {
                    if ('Ok' === result) {
                        //this.mainLib.editInfo(editedInfo, this.selection.tournament.info);
                        var c = _this.selection.tournament;
                        _this.undo.update(_this.selection.tournament, 'info', editedInfo, "Edit info"); //c.info = editedInfo;
                    }
                });
            };
            //#endregion tournament
            mainCtrl.prototype.select = function (item, type) {
                var _this = this;
                if (item && type) {
                    //first unselect any item to close the actions dropdown
                    this.selection.select(undefined, type);
                    //then select the new box
                    this.$timeout(function () { return _this.selection.select(item, type); }, 0);
                    return;
                }
                this.selection.select(item, type);
            };
            //#region player
            mainCtrl.prototype.addPlayer = function () {
                var _this = this;
                var newPlayer = this.tournamentLib.newPlayer(this.selection.tournament);
                this.$modal.open({
                    templateUrl: 'player/dialogPlayer.html',
                    controller: 'dialogPlayerCtrl as dlg',
                    resolve: {
                        title: function () { return "New player"; },
                        player: function () { return newPlayer; },
                        events: function () { return _this.selection.tournament.events; }
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
                        title: function () { return "Edit player"; },
                        player: function () { return editedPlayer; },
                        events: function () { return _this.selection.tournament.events; }
                    }
                }).result.then(function (result) {
                    if ('Ok' === result) {
                        _this.mainLib.editPlayer(editedPlayer, player);
                    }
                    else if ('Del' === result) {
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
                        title: function () { return "New event"; },
                        event: function () { return newEvent; }
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
                        title: function () { return "Edit event"; },
                        event: function () { return editedEvent; }
                    }
                }).result.then(function (result) {
                    if ('Ok' === result) {
                        _this.mainLib.editEvent(editedEvent, event);
                    }
                    else if ('Del' === result) {
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
                        title: function () { return "New draw"; },
                        draw: function () { return newDraw; }
                    }
                }).result.then(function (result) {
                    //TODO add event after selected draw
                    if ('Ok' === result) {
                        _this.mainLib.addDraw(newDraw, 0, after);
                    }
                    else if ('Generate' === result) {
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
                        title: function () { return "Edit draw"; },
                        draw: function () { return editedDraw; }
                    }
                }).result.then(function (result) {
                    if ('Ok' === result) {
                        _this.mainLib.updateDraw(editedDraw, draw);
                    }
                    else if ('Generate' === result) {
                        _this.mainLib.updateDraw(editedDraw, draw, 1);
                    }
                    else if ('Del' === result) {
                        _this.mainLib.removeDraw(draw);
                    }
                });
            };
            mainCtrl.prototype.validateDraw = function (draw) {
                this.mainLib.validateDraw(draw);
            };
            mainCtrl.prototype.generateDraw = function (draw, generate) {
                this.mainLib.updateDraw(draw, undefined, generate || models.GenerateType.Create);
            };
            mainCtrl.prototype.updateQualif = function (draw) {
                this.mainLib.updateQualif(draw);
            };
            mainCtrl.prototype.removeDraw = function (draw) {
                this.mainLib.removeDraw(draw);
            };
            //#endregion draw
            //#region match
            mainCtrl.prototype.isMatch = function (box) {
                return box && 'score' in box;
            };
            mainCtrl.prototype.editMatch = function (match) {
                var _this = this;
                var editedMatch = this.drawLib.newBox(match._draw, match);
                this.$modal.open({
                    templateUrl: 'draw/dialogMatch.html',
                    controller: 'dialogMatchCtrl as dlg',
                    resolve: {
                        title: function () { return "Edit match"; },
                        match: function () { return editedMatch; }
                    }
                }).result.then(function (result) {
                    if ('Ok' === result) {
                        _this.mainLib.editMatch(editedMatch, match);
                    }
                });
            };
            //#endregion match
            mainCtrl.prototype.doUndo = function () {
                this.selection.select(this.undo.undo(), this.undo.getMeta());
            };
            mainCtrl.prototype.doRedo = function () {
                this.selection.select(this.undo.redo(), this.undo.getMeta());
            };
            mainCtrl.$inject = [
                '$modal',
                'selection',
                'mainLib',
                'tournamentLib',
                'drawLib',
                'validation',
                'undo',
                '$window',
                '$timeout',
            ];
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
            'jat.tournament.dialog',
            'jat.player.dialog',
            'jat.player.list',
            'jat.event.dialog',
            'jat.event.list',
            'jat.draw.dialog',
            'jat.draw.list',
            'jat.draw.box',
            'jat.match.dialog',
            'ec.panels',
            'ec.inputFile',
            //'polyfill',
            'ui.bootstrap'])
            .controller('mainCtrl', mainCtrl);
    })(main = jat.main || (jat.main = {}));
})(jat || (jat = {}));
