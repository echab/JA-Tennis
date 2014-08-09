'use strict';

module jat.main {

    export class mainCtrl {

        constructor(
            private $log: ng.ILogService,
            private $modal: uib.IModalService<string>,
            private selection: jat.service.Selection,
            private mainLib: jat.service.MainLib,
            private tournamentLib: jat.service.TournamentLib,
            private drawLib: jat.service.DrawLib,
            private undo: jat.service.Undo
            ) {

            this.selection.tournament = this.tournamentLib.newTournament();

            this.mainLib.loadTournament('/data/tournament4.json').then((data) => {
                this.selection.tournament = data;
                this.selection.event = data.events[0];
                this.selection.draw = data.events[0].draws[0];
                this.selection.player = undefined;
                this.selection.match = undefined;
            });
        }

        //#region tournament
        loadTournament(): void {
            //TODO browse for file
            //this.mainLib.loadTournament('xxx.json');
        }
        saveTournament(): void {
            this.mainLib.saveTournament(this.selection.tournament, 'xxx');
        }
        //#endregion tournament

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
                        this.mainLib.addPlayer(this.selection.tournament, newPlayer);
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
                        this.mainLib.editPlayer(editedPlayer, player);
                    } else if ('Del' === result) {
                        this.mainLib.removePlayer(player)
                }
                });
        }
        removePlayer(player: models.Player): void {
            this.mainLib.removePlayer(player);
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
                        this.mainLib.addEvent(this.selection.tournament, newEvent);
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
                        this.mainLib.editEvent(editedEvent, event);
                    } else if ('Del' === result) {
                        this.mainLib.removeEvent(event)
                }
                });
        }

        removeEvent(event: models.Event): void {
            this.mainLib.removeEvent(event);
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
                        this.mainLib.updateDraw(newDraw, draw);
                    } else if ('Generate' === result) {
                        this.mainLib.updateDraw(newDraw, draw, 1);
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
                        this.mainLib.updateDraw(editedDraw, draw);
                    } else if ('Generate' === result) {
                        this.mainLib.updateDraw(editedDraw, draw, 1);
                    } else if ('Del' === result) {
                        this.mainLib.removeDraw(draw);
                    }
                });
        }

        generateDraw(draw: models.Draw, generate?: number): void {
            if (!draw) {
                return;
            }
            this.mainLib.updateDraw(draw, undefined, generate || 1);
        }

        removeDraw(draw: models.Draw): void {
            this.mainLib.removeDraw(draw);
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
                        this.mainLib.editMatch(editedMatch, match);
                    }
                });
        }
        //#endregion match

        public doUndo() {
            this.mainLib.select(this.undo.undo());
        }
        public doRedo() {
            this.mainLib.select(this.undo.redo());
        }

    }

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
        'ui.bootstrap'])

        .controller('mainCtrl', mainCtrl);
}