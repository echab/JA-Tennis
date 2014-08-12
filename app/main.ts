'use strict';

module jat.main {

    /** Main controller for the application */
    export class mainCtrl {

        public GenerateType = models.GenerateType;

        constructor(
            private $modal: uib.IModalService<string>,
            private selection: jat.service.Selection,
            private mainLib: jat.service.MainLib,
            private tournamentLib: jat.service.TournamentLib,
            private drawLib: jat.service.DrawLib,
            private undo: jat.service.Undo
            ) {

            this.selection.tournament = this.tournamentLib.newTournament();

            this.mainLib.loadTournament('/data/tournament6.json').then((data) => {
                this.mainLib.select( data.events[0].draws[0], models.ModelType.Draw);
            });
        }

        //#region tournament
        loadTournament(): void {
            //TODO browse for file
            //this.mainLib.loadTournament('xxx.json');
        }
        saveTournament(): void {
            this.mainLib.saveTournament(this.selection.tournament, '');
        }
        //#endregion tournament

        select(item: any): void {
            this.mainLib.select(item);
        }

        //#region player
        addPlayer(): void {

            var newPlayer = this.tournamentLib.newPlayer(this.selection.tournament);

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
        addEvent(after?: models.Event): void { //TODO afterEvent

            var newEvent = this.tournamentLib.newEvent(this.selection.tournament);

            this.$modal.open({
                templateUrl: 'event/dialogEvent.html',
                controller: 'dialogEventCtrl as dlg',    //required for resolve
                resolve: {
                    title: () => "New event",
                    event: () => newEvent
                }
            }).result.then((result: string) => {
                    if ('Ok' === result) {
                        this.mainLib.addEvent(this.selection.tournament, newEvent, after); //TODO add event after selected event
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
        addDraw(after?: models.Draw): void {

            var newDraw = this.drawLib.newDraw(this.selection.event, undefined, after);

            this.$modal.open({
                templateUrl: 'draw/dialogDraw.html',
                controller: 'dialogDrawCtrl as dlg',    //required for resolve
                resolve: {
                    title: () => "New draw",
                    draw: () => newDraw
                }
            }).result.then((result: string) => {
                    //TODO add event after selected draw
                    if ('Ok' === result) {
                        this.mainLib.addDraw(newDraw, 0, after);
                    } else if ('Generate' === result) {
                        this.mainLib.addDraw(newDraw, 1, after);
                    }
                });
        }

        editDraw(draw: models.Draw): void {

            var editedDraw = this.drawLib.newDraw(draw._event, draw);    // angular.copy(draw)

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

        generateDraw(draw: models.Draw, generate?: models.GenerateType): void {
            this.mainLib.updateDraw(draw, undefined, generate || models.GenerateType.Create);
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
            this.mainLib.doUndo();
        }
        public doRedo() {
            this.mainLib.doRedo();
        }

    }

    angular.module('jat.main', [
        'jat.services.mainLib',
        'jat.services.selection',
        'jat.services.undo',
        'jat.services.tournamentLib',
        'jat.services.drawLib',
        'jat.services.knockout',
        'jat.services.roundrobin',
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