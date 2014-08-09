'use strict';

module jat.main {

    export class mainCtrl {

        constructor(
            private $log: ng.ILogService,
            private $http: ng.IHttpService,
            private $modal: uib.IModalService<string>,
            private selection: jat.service.Selection,
            private tournamentLib: jat.service.TournamentLib,
            private drawLib: jat.service.DrawLib,
            private knockoutLib: jat.service.KnockoutLib,
            private roundrobinLib: jat.service.RoundrobinLib,
            private undo: jat.service.Undo,
            private find: jat.service.Find
            ) {

            selection.tournament = this.tournamentLib.newTournament();

            this.loadTournament('/data/tournament4.json');
        }

        loadTournament(url: string): void {
            //console.info("Loading tournament1...");
            this.$http.get(url)
                .success((data: models.Tournament, status: number) => {
                    this.tournamentLib.initTournament(data);

                    this.selection = {
                        tournament: data,
                        event: data.events[0],
                        draw: data.events[0].draws[1],
                        player: undefined,
                        match: undefined
                    };

                    //console.info("Tournament loaded.");
                })
                .error((data: any, status: number) => {
                    //TODO
                });
        }

        saveTournament(url: string): void {
            var data = {};
            models.copy(this.selection.tournament, data);
            if (!url) {
                this.$log.info(angular.toJson(data, true));
                return;
            }
            this.$http.post(url, data)
                .success((data: any, status: number) => {
                    //TODO
                })
                .error((data: any, status: number) => {
                    //TODO
                });
        }

        //#region player
        addPlayer(player?: models.Player): void {

            var newPlayer = this.tournamentLib.newPlayer(this.selection.tournament, player);

            this.$modal.open({
                templateUrl: 'player/dialogPlayer.html',
                controller: 'dialogPlayerCtrl as dlg',    //required for resolve
                resolve: {
                    title: () => "New player",
                    player: () => newPlayer,
                    events: () => this.selection.tournament.events
                }
            }).result.then((result: string) => {
                    if ('Ok' === result) {
                        this.doAddPlayer(newPlayer);
                    }
                });
        }

        editPlayer(player: models.Player): void {

            var editedPlayer = this.tournamentLib.newPlayer(this.selection.tournament, player);    // angular.copy(player)

            this.$modal.open({
                templateUrl: 'player/dialogPlayer.html',
                controller: 'dialogPlayerCtrl as dlg',    //required for resolve
                resolve: {
                    title: () => "Edit player",
                    player: () => editedPlayer,
                    events: () => this.selection.tournament.events
                }
            }).result.then((result: string) => {
                    if ('Ok' === result) {
                        this.doEditPlayer(editedPlayer, player);
                    } else if ('Del' === result) {
                        this.removePlayer(player)
                }
                });
        }

        private doAddPlayer(newPlayer: models.Player): void {
            var c = this.selection.tournament.players;
            newPlayer.id = 'P' + c.length;    //TODO generate id

            this.undo.insert(c, -1, newPlayer, "Add " + newPlayer.name); //c.push( newPlayer);
            this.selection.player = newPlayer;
        }

        private doEditPlayer(editedPlayer: models.Player, player: models.Player): void {
            var isSelected = this.selection.player === player;
            var c = this.selection.tournament.players;
            var i = this.find.indexOf(c, "id", editedPlayer.id, "Player to update not found");
            this.undo.update(c, i, editedPlayer, "Edit " + editedPlayer.name + " " + i); //c[i] = editedPlayer;
            if (isSelected) {
                this.selection.player = editedPlayer;
            }
        }

        removePlayer(player: models.Player): void {
            if (this.selection.player === player) {
                this.selection.player = undefined;
            }
            var c = this.selection.tournament.players;
            var i = this.find.indexOf(c, "id", player.id, "Player to remove not found");
            this.undo.remove(c, i, "Delete " + player.name + " " + i);   //c.splice( i, 1);
        }
        //#endregion player

        //#region event
        addEvent(event: models.Event): void {

            var newEvent = this.tournamentLib.newEvent(this.selection.tournament, event);

            this.$modal.open({
                templateUrl: 'event/dialogEvent.html',
                controller: 'dialogEventCtrl as dlg',    //required for resolve
                resolve: {
                    title: () => "New event",
                    event: () => newEvent
                }
            }).result.then((result: string) => {
                    if ('Ok' === result) {
                        this.doAddEvent(newEvent);
                    }
                });
        }

        editEvent(event: models.Event): void {

            var editedEvent = this.tournamentLib.newEvent(this.selection.tournament, event);    // angular.copy(event)

            this.$modal.open({
                templateUrl: 'event/dialogEvent.html',
                controller: 'dialogEventCtrl as dlg',    //required for resolve
                resolve: {
                    title: () => "Edit event",
                    event: () => editedEvent
                }
            }).result.then((result: string) => {
                    if ('Ok' === result) {
                        this.doEditEvent(editedEvent, event);
                    } else if ('Del' === result) {
                        this.removeEvent(event)
                }
                });
        }

        private doAddEvent(newEvent: models.Event): void {
            var c = this.selection.tournament.events;
            newEvent.id = 'E' + c.length;    //TODO generate id
            this.undo.insert(c, -1, newEvent, "Add " + newEvent.name);   //c.push( newEvent);
            this.selection.event = newEvent;
        }
        private doEditEvent(editedEvent: models.Event, event: models.Event): void {
            var isSelected = this.selection.event === event;
            var c = this.selection.tournament.events;
            var i = this.find.indexOf(c, "id", editedEvent.id, "Event to edit not found");
            this.undo.update(c, i, editedEvent, "Edit " + editedEvent.name + " " + i);   //c[i] = editedEvent;
            if (isSelected) {
                this.selection.event = editedEvent;
            }
        }

        removeEvent(event: models.Event): void {
            if (this.selection.event === event) {
                this.selection.event = undefined;
            }
            var c = this.selection.tournament.events;
            var i = this.find.indexOf(c, "id", event.id, "Event to remove not found");
            this.undo.remove(c, i, "Delete " + c[i].name + " " + i); //c.splice( i, 1);
        }
        //#endregion event

        //#region draw
        addDraw(event: models.Event, draw: models.Draw): void {

            var newDraw = this.drawLib.newDraw(event, draw);

            this.$modal.open({
                templateUrl: 'draw/dialogDraw.html',
                controller: 'dialogDrawCtrl as dlg',    //required for resolve
                resolve: {
                    title: () => "New draw",
                    draw: () => newDraw
                }
            }).result.then((result: string) => {
                    if ('Ok' === result) {
                        this.updateDraw(newDraw, draw);
                    } else if ('Generate' === result) {
                        this.updateDraw(newDraw, draw, 1);
                    }
                });
        }

        editDraw(event: models.Event, draw: models.Draw): void {

            var editedDraw = this.drawLib.newDraw(event, draw);    // angular.copy(draw)

            this.$modal.open({
                templateUrl: 'draw/dialogDraw.html',
                controller: 'dialogDrawCtrl as dlg',    //required for resolve
                resolve: {
                    title: () => "Edit draw",
                    draw: () => editedDraw
                }
            }).result.then((result: string) => {
                    if ('Ok' === result) {
                        this.updateDraw(editedDraw, draw);
                    } else if ('Generate' === result) {
                        this.updateDraw(editedDraw, draw, 1);
                    } else if ('Del' === result) {
                        this.removeDraw(event, draw);
                    }
                });
        }

        public refresh(draw: models.Draw): void {
            draw._refresh = new Date(); //force angular refresh
        }

        public updateDraw(draw: models.Draw, oldDraw: models.Draw, generate?: number): void {
            var isSelected = this.selection.draw === oldDraw;
            if (generate) {
                var nOldDraw = this.drawLib.getnSuite(oldDraw || draw);
                var draws = this.drawLib.generateDraw(draw, generate)
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
            } else if (!draw.id) {   //new draw
                draw.id = 'D' + c.length;    //TODO generate id
                this.undo.insert(c, -1, draw, "Add " + draw.name); //c.push( draw);
            } else {    //edit draw
                var i = this.find.indexOf(c, "id", draw.id, "Draw to edit not found");
                this.undo.update(c, i, draw, "Edit " + draw.name + " " + i); //c[i] = draw;
            }
            if (isSelected || generate) {
                this.selection.draw = draw;
                this.refresh(draw);  //force angular refresh
            }
        }

        removeDraw(event: models.Event, draw: models.Draw): void {
            if (this.selection.draw === draw) {
                this.selection.draw = undefined;
            }
            var c = event.draws;
            var i = this.find.indexOf(c, "id", draw.id, "Draw to remove not found");
            this.undo.remove(c, i, "Delete " + draw.name + " " + i); //c.splice( i, 1);
        }
        //#endregion draw

        //#region match
        editMatch(match: models.Match): void {

            var editedMatch = this.drawLib.newBox(match._draw, match);    // angular.copy(match)

            this.$modal.open({
                templateUrl: 'draw/dialogMatch.html',
                controller: 'dialogMatchCtrl as dlg',    //required for resolve
                resolve: {
                    title: () => "Edit match",
                    match: () => editedMatch
                }
            }).result.then((result: string) => {
                    if ('Ok' === result) {
                        this.doEditMatch(editedMatch, match);
                    }
                });
        }

        private doEditMatch(editedMatch: models.Box, match: models.Box): void {
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

        public doUndo() {
            this.select(this.undo.undo());
        }
        public doRedo() {
            this.select(this.undo.redo());
        }
        public select(r: any): void {
            if (!r) {
                return;
            }
            if (r.players && r.events) { //tournament
                this.selection.tournament = r;
                this.selection.event = undefined;
                this.selection.draw = undefined;

            } else if (r.draws && r._tournament) { //event
                this.selection.tournament = r._tournament;
                this.selection.event = r;
                this.selection.draw = r.draws[0];

            } else if (r.boxes && r._event) { //draw
                this.selection.tournament = r._event._tournament;
                this.selection.event = r._event;
                this.selection.draw = r;

            } else if (r.playerId && r._draw) { //box
                this.selection.tournament = r._draw._event._tournament;
                this.selection.event = r._draw._event;
                this.selection.draw = r._draw;
            } else if (r.name && r._tournament) {   //player
                this.selection.tournament = r._tournament;
                this.selection.player = r;
            }
        }
    }

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
        'ui.bootstrap'])

        .controller('mainCtrl', mainCtrl);
}