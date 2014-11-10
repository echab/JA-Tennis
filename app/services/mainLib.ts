﻿module jat.service {

    export class MainLib {

        constructor(
            private $log: ng.ILogService,
            private $http: ng.IHttpService,
            private $q: ng.IQService,
            private $window: ng.IWindowService,
            private selection: jat.service.Selection,
            private tournamentLib: jat.service.TournamentLib,
            private drawLib: jat.service.DrawLib,
            private validation: jat.service.Validation,
            //private rank: ServiceRank,
            private undo: jat.service.Undo,
            private find: jat.service.Find,
            private guid: jat.service.Guid
            ) {
        }

        newTournament(): models.Tournament {
            var tournament: models.Tournament = {
                id: this.guid.create('T'),
                info: {
                    name: ''
                },
                players: [],
                events: []
            };
            this.select(tournament, models.ModelType.Tournament);
            return tournament;
        }

        /** This function load tournament data from an url. */
        loadTournament(file?: File): ng.IPromise<models.Tournament>;
        loadTournament(url?: string): ng.IPromise<models.Tournament>;
        loadTournament(file_url?: any): ng.IPromise<models.Tournament> {
            var deferred = this.$q.defer();
            if (!file_url) {
                var data = this.$window.localStorage['tournament'];
                if (data) {
                    var tournament: models.Tournament = angular.fromJson(data);
                    this.tournamentLib.initTournament(tournament);
                    this.select(tournament, models.ModelType.Tournament);
                    deferred.resolve(tournament);
                } else {
                    deferred.reject('nothing in storage');
                }
            } else if ('string' === typeof file_url) {
                this.$http.get(file_url)
                    .success((tournament: models.Tournament, status: number) => {
                        tournament._url = file_url;
                        this.tournamentLib.initTournament(tournament);
                        this.select(tournament, models.ModelType.Tournament);
                        deferred.resolve(tournament);
                    })
                    .error((data: any, status: number) => {
                        deferred.reject(data);
                    });
            } else {
                var reader = new FileReader();
                reader.addEventListener('loadend', () => {
                    try {
                        var tournament: models.Tournament = angular.fromJson(reader.result);
                        tournament._url = file_url;
                        this.tournamentLib.initTournament(tournament);
                        this.select(tournament, models.ModelType.Tournament);
                        deferred.resolve(tournament);
                    } catch (ex) {
                        deferred.reject(ex.message);
                    }
                });
                reader.addEventListener('onerror', () =>
                    deferred.reject(reader.error.name));
                reader.addEventListener('onabort', () =>
                    deferred.reject('aborted'));

                reader.readAsText(file_url);
            }
            return deferred.promise;
        }

        saveTournament(tournament: models.Tournament, url?: string): void {
            var data = {};
            tool.copy(tournament, data);
            if (!url) {
                //this.$log.info(angular.toJson(data, true));
                this.$window.localStorage['tournament'] = angular.toJson(data);
                return;
            }
            this.$http.post(url || tournament._url, data)
                .success((data: any, status: number) => {
                    //TODO
                })
                .error((data: any, status: number) => {
                    //TODO
                });
        }

        //#region player
        addPlayer(tournament: models.Tournament, newPlayer: models.Player): void {
            var c = tournament.players;
            newPlayer.id = this.guid.create('p');

            this.undo.insert(c, -1, newPlayer, "Add " + newPlayer.name, models.ModelType.Player); //c.push( newPlayer);
            this.select(newPlayer, models.ModelType.Player);
        }

        editPlayer(editedPlayer: models.Player, player: models.Player): void {
            var isSelected = this.selection.player === player;
            var c = editedPlayer._tournament.players;
            var i = this.find.indexOf(c, "id", editedPlayer.id, "Player to update not found");
            this.undo.update(c, i, editedPlayer, "Edit " + editedPlayer.name + " " + i, models.ModelType.Player); //c[i] = editedPlayer;
            if (isSelected) {
                this.select(editedPlayer, models.ModelType.Player);
            }
        }

        removePlayer(player: models.Player): void {
            var c = player._tournament.players;
            var i = this.find.indexOf(c, "id", player.id, "Player to remove not found");
            this.undo.remove(c, i, "Delete " + player.name + " " + i, models.ModelType.Player);   //c.splice( i, 1);
            if (this.selection.player === player) {
                this.select(c[i] || c[i - 1], models.ModelType.Player); //select next or previous
            }
        }
        //#endregion player

        //#region event
        addEvent(tournament: models.Tournament, newEvent: models.Event, afterEvent?: models.Event): void {
            var c = tournament.events;
            var index = afterEvent ? this.find.indexOf(c, 'id', afterEvent.id) + 1 : c.length;

            newEvent.id = this.guid.create('e');
            this.undo.insert(c, index, newEvent, "Add " + newEvent.name, models.ModelType.Event);   //c.push( newEvent);
            this.select(newEvent, models.ModelType.Event);
        }

        editEvent(editedEvent: models.Event, event: models.Event): void {
            var isSelected = this.selection.event === event;
            var c = editedEvent._tournament.events;
            var i = this.find.indexOf(c, "id", editedEvent.id, "Event to edit not found");
            this.undo.update(c, i, editedEvent, "Edit " + editedEvent.name + " " + i, models.ModelType.Event);   //c[i] = editedEvent;
            if (isSelected) {
                this.select(editedEvent, models.ModelType.Event);
            }
        }

        removeEvent(event: models.Event): void {
            var c = event._tournament.events;
            var i = this.find.indexOf(c, "id", event.id, "Event to remove not found");
            this.undo.remove(c, i, "Delete " + c[i].name + " " + i, models.ModelType.Event); //c.splice( i, 1);
            if (this.selection.event === event) {
                this.select(c[i] || c[i - 1], models.ModelType.Event);
            }
        }
        //#endregion event

        //#region draw
        addDraw(draw: models.Draw, generate?: models.GenerateType, afterDraw?: models.Draw): void {

            var c = draw._event.draws;
            var afterIndex = afterDraw ? this.find.indexOf(c, 'id', afterDraw.id) : c.length - 1;

            if (generate) {
                var draws = this.drawLib.generateDraw(draw, generate, afterIndex);
                if (!draws || !draws.length) {
                    return;
                }
                this.undo.splice(c, afterIndex + 1, 0, draws, "Add " + draw.name, models.ModelType.Draw); //c.splice( i, 1, draws);

                for (var i = 0; i < draws.length; i++) {
                    this.drawLib.initDraw(draws[i], draw._event);
                }
                this.select(draws[0], models.ModelType.Draw);

            } else {
                draw.id = this.guid.create('d');
                this.undo.insert(c, afterIndex + 1, draw, "Add " + draw.name, models.ModelType.Draw); //c.push( draw);
                this.select(draw, models.ModelType.Draw);
            }
        }

        updateDraw(draw: models.Draw, oldDraw?: models.Draw, generate?: models.GenerateType): void {
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
                this.undo.splice(c, i, group.length, draws, "Generate " + models.GenerateType[generate] + ' ' + draw.name, models.ModelType.Draw);

                for (var i = 0; i < draws.length; i++) {
                    this.drawLib.initDraw(draws[i], draw._event);
                }
                draw = draws[0];
            } else {    //edit draw
                var i = this.find.indexOf(c, "id", draw.id, "Draw to edit not found");
                this.undo.update(c, i, draw, "Edit " + draw.name + " " + i, models.ModelType.Draw); //c[i] = draw;
            }
            if (isSelected || generate) {
                this.select(draw, models.ModelType.Draw);
                this.drawLib.refresh(draw);  //force angular refresh
            }
        }

        updateQualif(draw: models.Draw): void {
            this.undo.newGroup('Update qualified', () => {
                this.drawLib.updateQualif(draw);
                return true;
            }, draw);
        }

        removeDraw(draw: models.Draw): void {
            var c = draw._event.draws;
            var i = this.find.indexOf(c, "id", draw.id, "Draw to remove not found");
            this.undo.remove(c, i, "Delete " + draw.name + " " + i, models.ModelType.Draw); //c.splice( i, 1);
            if (this.selection.draw === draw) {
                this.select(c[i] || c[i - 1], models.ModelType.Draw);   //select next or previous
            }
        }

        validateDraw(draw: models.Draw): void {
            this.validation.resetDraw(draw);
            this.validation.validateDraw(draw);
            if (this.selection.draw === draw) {
                this.drawLib.refresh(draw);  //force angular refresh
            }
        }
        //#endregion draw

        //#region match
        editMatch(editedMatch: models.Match, match: models.Match): void {
            this.drawLib.initBox(editedMatch, editedMatch._draw);
            var c = match._draw.boxes;
            var i = this.find.indexOf(c, "position", editedMatch.position, "Match to edit not found");
            this.undo.newGroup("Edit match", () => {
                this.undo.update(c, i, editedMatch, "Edit " + editedMatch.position + " " + i, models.ModelType.Match); //c[i] = editedMatch;
                if (editedMatch.qualifOut) {
                    //report qualified player to next draw
                    var nextGroup = this.drawLib.nextGroup(editedMatch._draw);
                    if (nextGroup) {
                        var boxIn = this.drawLib.FindQualifieEntrant(nextGroup, editedMatch.qualifOut);
                        if (boxIn) {
                            //this.undo.update(boxIn, 'playerId', editedMatch.playerId, 'Set player');  //boxIn.playerId = editedMatch.playerId;
                            //this.undo.update(boxIn, '_player', editedMatch._player, 'Set player');  //boxIn._player = editedMatch._player;
                            this.undo.update(boxIn, 'playerId', editedMatch.playerId, 'Set player',
                                () => this.drawLib.initBox(boxIn, boxIn._draw));  //boxIn.playerId = editedMatch.playerId;
                        }
                    }
                }
                return true;
            });
        }
        erasePlayer(box: models.Box): void {
            //this.undo.newGroup("Erase player", () => {
            //    this.undo.update(box, 'playerId', null);  //box.playerId = undefined;
            //    this.undo.update(box, '_player', null);  //box._player = undefined;
            //    return true;
            //}, box);
            this.undo.update(box, 'playerId', null, "Erase player",
                () => this.drawLib.initBox(box, box._draw)
                );  //box.playerId = undefined;
        }
        //#endregion match

        public select(r: any, type?: models.ModelType): void {

            var sel = this.selection;
            if (r) {
                if (type === models.ModelType.Box || ('_player' in r && r._draw)) { //box
                    sel.tournament = r._draw._event._tournament;
                    sel.event = r._draw._event;
                    sel.draw = r._draw;
                    sel.box = r;

                } else if (type === models.ModelType.Draw || r._event) { //draw
                    sel.tournament = r._event._tournament;
                    sel.event = r._event;
                    sel.draw = r;
                    sel.box = undefined;

                } else if (type === models.ModelType.Event || (r.draws && r._tournament)) { //event
                    sel.tournament = r._tournament;
                    sel.event = r;
                    sel.draw = r.draws ? r.draws[0] : undefined;
                    sel.box = undefined;

                } else if (type === models.ModelType.Player || (r.name && r._tournament)) {   //player
                    sel.tournament = r._tournament;
                    sel.player = r;

                } else if (type === models.ModelType.Tournament || (r.players && r.events)) { //tournament
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
                    case models.ModelType.Tournament:
                        sel.tournament = undefined;
                        sel.player = undefined;
                    case models.ModelType.Event:
                        sel.event = undefined;
                    case models.ModelType.Draw:
                        sel.draw = undefined;
                    case models.ModelType.Box:
                        sel.box = undefined;
                        break;
                    case models.ModelType.Player:
                        sel.player = undefined;
                }
            }
        }
    }

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
    ])
        .factory('mainLib',
        [
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
        //'rank',
            'undo',
            'find',
            'guid',
            (
                $log: ng.ILogService,
                $http: ng.IHttpService,
                $q: ng.IQService,
                $window: ng.IWindowService,
                selection: jat.service.Selection,
                tournamentLib: jat.service.TournamentLib,
                drawLib: jat.service.DrawLib,
                knockout: jat.service.Knockout,
                roundrobin: jat.service.Roundrobin,
                validation: jat.service.Validation,
                knockoutValidation: jat.service.KnockoutValidation,
                roundrobinValidation: jat.service.RoundrobinValidation,
                fftValidation: jat.service.FFTValidation,
                //rank: ServiceRank,
                undo: jat.service.Undo,
                find: jat.service.Find,
                guid: jat.service.Guid) => {
                return new MainLib($log, $http, $q, $window, selection, tournamentLib, drawLib, validation, undo, find, guid);
            }]);
}
