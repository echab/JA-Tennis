﻿module jat.service {

    export class MainLib {

        constructor(
            private $log: ng.ILogService,
            private $http: ng.IHttpService,
            private $q: ng.IQService,
            private selection: jat.service.Selection,
            private tournamentLib: jat.service.TournamentLib,
            private drawLib: jat.service.DrawLib,
            //private rank: ServiceRank,
            private undo: jat.service.Undo,
            private find: jat.service.Find
            ) {
        }

        /** This function load tournament data from an url. */
        loadTournament(url: string): ng.IPromise<models.Tournament> {
            var deferred = this.$q.defer();
            this.$http.get(url)
                .success((data: models.Tournament, status: number) => {
                    this.tournamentLib.initTournament(data);

                    data._url = url;

                    this.selection.tournament = data;
                    this.selection.event = data.events[0];
                    this.selection.draw = data.events[0] ? data.events[0].draws[0] : undefined;
                    this.selection.player = undefined;
                    this.selection.match = undefined;

                    deferred.resolve(data);
                })
                .error((data: any, status: number) => {
                    deferred.reject(data);
                });

            return deferred.promise;
        }

        saveTournament(tournament: models.Tournament, url: string): void {
            var data = {};
            models.copy(tournament, data);
            if (!url) {
                this.$log.info(angular.toJson(data, true));
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
            newPlayer.id = 'P' + c.length;    //TODO generate id

            this.undo.insert(c, -1, newPlayer, "Add " + newPlayer.name); //c.push( newPlayer);
            this.selection.player = newPlayer;
        }

        editPlayer(editedPlayer: models.Player, player: models.Player): void {
            var isSelected = this.selection.player === player;
            var c = this.selection.tournament.players;
            var i = this.find.indexOf(c, "id", editedPlayer.id, "Player to update not found");
            this.undo.update(c, i, editedPlayer, "Edit " + editedPlayer.name + " " + i); //c[i] = editedPlayer;
            if (isSelected) {
                this.selection.player = editedPlayer;
            }
        }

        removePlayer(player: models.Player): void {
            var c = player._tournament.players;
            var i = this.find.indexOf(c, "id", player.id, "Player to remove not found");
            if (this.selection.player === player) {
                this.selection.player = c[i + 1] || c[i - 1];   //select next or previous
            }
            this.undo.remove(c, i, "Delete " + player.name + " " + i);   //c.splice( i, 1);
            this.select(c[i] || c[i + 1], models.ModelType.Player);
        }
        //#endregion player

        //#region event
        addEvent(tournament: models.Tournament, newEvent: models.Event, afterEvent?: models.Event): void {
            var c = tournament.events;
            var index = afterEvent ? this.find.indexOf(c, 'id', afterEvent.id) + 1 : c.length;

            newEvent.id = 'E' + c.length;    //TODO generate id
            this.undo.insert(c, index, newEvent, "Add " + newEvent.name);   //c.push( newEvent);
            this.selection.event = newEvent;
        }

        editEvent(editedEvent: models.Event, event: models.Event): void {
            var isSelected = this.selection.event === event;
            var c = this.selection.tournament.events;
            var i = this.find.indexOf(c, "id", editedEvent.id, "Event to edit not found");
            this.undo.update(c, i, editedEvent, "Edit " + editedEvent.name + " " + i);   //c[i] = editedEvent;
            if (isSelected) {
                this.selection.event = editedEvent;
            }
        }

        removeEvent(event: models.Event): void {
            var c = event._tournament.events;
            var i = this.find.indexOf(c, "id", event.id, "Event to remove not found");
            if (this.selection.event === event) {
                this.selection.event = c[i + 1] || c[i - 2];   //select next or previous
            }
            this.undo.remove(c, i, "Delete " + c[i].name + " " + i); //c.splice( i, 1);
            this.select(c[i] || c[i + 1], models.ModelType.Event);
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
                this.undo.splice(c, afterIndex + 1, 0, draws, "Add " + draw.name);

                for (var i = 0; i < draws.length; i++) {
                    this.drawLib.initDraw(draws[i], draw._event);
                }
                this.selection.draw = draws[0];

            } else {
                draw.id = 'D' + c.length;    //TODO generate id
                this.undo.insert(c, afterIndex + 1, draw, "Add " + draw.name); //c.push( draw);
                this.selection.draw = draw;
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
                this.undo.splice(c, i, group.length, draws, "Generate " + models.GenerateType[generate] + ' ' + draw.name);

                for (var i = 0; i < draws.length; i++) {
                    this.drawLib.initDraw(draws[i], draw._event);
                }
                draw = draws[0];
            } else {    //edit draw
                var i = this.find.indexOf(c, "id", draw.id, "Draw to edit not found");
                this.undo.update(c, i, draw, "Edit " + draw.name + " " + i); //c[i] = draw;
            }
            if (isSelected || generate) {
                this.selection.draw = draw;
                this.refresh(draw);  //force angular refresh
            }
        }

        removeDraw(draw: models.Draw): void {
            var c = draw._event.draws;
            var i = this.find.indexOf(c, "id", draw.id, "Draw to remove not found");
            if (this.selection.draw === draw) {
                this.selection.draw = c[i] || c[i - 1]; //select next or previous
            }
            this.undo.remove(c, i, "Delete " + draw.name + " " + i); //c.splice( i, 1);
            this.select(c[i] || c[i + 1], models.ModelType.Draw);
        }

        refresh(draw: models.Draw): void {
            draw._refresh = new Date(); //force angular refresh
        }
        //#endregion draw

        //#region match
        editMatch(editedMatch: models.Box, match: models.Box): void {
            var c = match._draw.boxes;
            var i = this.find.indexOf(c, "position", editedMatch.position, "Match to edit not found");
            this.undo.newGroup("Edit match");
            this.undo.update(c, i, editedMatch, "Edit " + editedMatch.position + " " + i); //c[i] = editedMatch;
            //if (!match.playerId && editedMatch.playerId) {
            //    var nextMatch = drawLib.positionMatch(match.position);
            //    //TODO
            //}
            this.undo.endGroup();
        }
        //#endregion match

        public select(r: any, type?: models.ModelType): void {

            var sel = this.selection;
            if (r) {
                if (r.playerId && r._draw) { //box
                    sel.tournament = r._draw._event._tournament;
                    sel.event = r._draw._event;
                    sel.draw = r._draw;
                    sel.match = r;

                } else if (r._event) { //draw
                    sel.tournament = r._event._tournament;
                    sel.event = r._event;
                    sel.draw = r;
                    sel.match = undefined;

                } else if (r.draws && r._tournament) { //event
                    sel.tournament = r._tournament;
                    sel.event = r;
                    sel.draw = r.draws[0];
                    sel.match = undefined;

                } else if (r.name && r._tournament) {   //player
                    sel.tournament = r._tournament;
                    sel.player = r;

                } else if (r.players && r.events) { //tournament
                    sel.tournament = r;
                    sel.event = undefined;
                    sel.draw = undefined;
                    sel.match = undefined;
                    sel.player = undefined;
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
                    case models.ModelType.Match:
                        sel.match = undefined;
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
        'jat.services.type',
        'jat.services.tournamentLib',
        'jat.services.drawLib',
        'jat.services.knockout',
        'jat.services.roundrobin'
    ])
        .factory('mainLib', (
            $log: ng.ILogService, $http: ng.IHttpService, $q: ng.IQService,
            selection: jat.service.Selection,
            tournamentLib: jat.service.TournamentLib,
            drawLib: jat.service.DrawLib,
            knockout: jat.service.Knockout,
            roundrobin: jat.service.Roundrobin,
            //rank: ServiceRank,
            undo: jat.service.Undo,
            find: jat.service.Find) => {
            return new MainLib($log, $http, $q, selection, tournamentLib, drawLib, undo, find);
        });
}
