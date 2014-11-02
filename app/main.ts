'use strict';

module jat.main {

    /** Main controller for the application */
    export class mainCtrl {

        public GenerateType = models.GenerateType;

        static $inject = [
            '$modal',
            'selection',
            'mainLib',
            'tournamentLib',
            'drawLib',
            'validation',
            'undo',
            '$window'];

        constructor(
            private $modal: uib.IModalService<string>,
            private selection: jat.service.Selection,
            private mainLib: jat.service.MainLib,
            private tournamentLib: jat.service.TournamentLib,
            private drawLib: jat.service.DrawLib,
            public validation: jat.service.Validation,
            private undo: jat.service.Undo,
            private $window: ng.IWindowService
            ) {

            this.selection.tournament = this.tournamentLib.newTournament();

            var filename = '/data/tournament8.json';
            //var filename = '/data/to2006.json';

            //Load saved tournament if exists
            //this.mainLib.loadTournament().then((data) => {
            //}, (reason) => {
            this.mainLib.loadTournament(filename).then((data) => {
            });
            //});

            //Auto save tournament on exit
            var onBeforeUnloadHandler = (event: Event) => {
                this.mainLib.saveTournament(this.selection.tournament);
            };
            if ($window.addEventListener) {
                $window.addEventListener('beforeunload', onBeforeUnloadHandler);
            } else {
                $window.onbeforeunload = onBeforeUnloadHandler;
            }


        }

        //#region tournament
        newTournament(): void {
            //TODO confirmation
            //TODO undo
            this.mainLib.newTournament();
            this.editTournament(this.selection.tournament);
        }
        loadTournament(file: File): void {
            this.mainLib.loadTournament(file);
        }
        saveTournament(): void {
            this.mainLib.saveTournament(this.selection.tournament, '');

        }
        editTournament(tournament: models.Tournament): void {

            var editedInfo = this.tournamentLib.newInfo(this.selection.tournament.info);

            this.$modal.open({
                templateUrl: 'tournament/dialogInfo.html',
                controller: 'dialogInfoCtrl as dlg',    //required for resolve
                resolve: {
                    title: () => "Edit info",
                    info: () => editedInfo
                }
            }).result.then((result: string) => {
                    if ('Ok' === result) {
                        //this.mainLib.editInfo(editedInfo, this.selection.tournament.info);
                        var c = this.selection.tournament;
                        this.undo.update(this.selection.tournament, 'info', editedInfo, "Edit info"); //c.info = editedInfo;
                    }
                });
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

            var editedPlayer = this.tournamentLib.newPlayer(this.selection.tournament, player);

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

            var editedEvent = this.tournamentLib.newEvent(this.selection.tournament, event);

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

            var editedDraw = this.drawLib.newDraw(draw._event, draw);

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

        lockDraw(draw: models.Draw, lock: boolean): void {
            //TODO
            draw.locked = lock;
        }

        validateDraw(draw: models.Draw): void {
            this.mainLib.validateDraw(draw);
        }

        generateDraw(draw: models.Draw, generate?: models.GenerateType): void {
            this.mainLib.updateDraw(draw, undefined, generate || models.GenerateType.Create);
        }

        updateQualif(draw: models.Draw): void {
            this.mainLib.updateQualif(draw);
        }

        removeDraw(draw: models.Draw): void {
            this.mainLib.removeDraw(draw);
        }
        //#endregion draw

        //#region match
        editMatch(match: models.Match): void {

            var editedMatch = <models.Match> this.drawLib.newBox(match._draw, match);

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
            this.mainLib.select(this.undo.undo(), this.undo.getMeta());
        }
        public doRedo() {
            this.mainLib.select(this.undo.redo(), this.undo.getMeta());
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
}