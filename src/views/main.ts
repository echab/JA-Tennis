import {autoinject} from 'aurelia-framework';
import {bindable} from 'aurelia-framework';

import { Selection,ModelType } from '../services/util/selection';
import { Undo } from '../services/util/undo';

import { MainLib } from '../services/mainLib';
import { TournamentLib } from '../services/tournamentLib';
import { DrawLib } from '../services/draw/drawLib';
import { Validation } from '../services/validation';

// function mainDirective(): ng.IDirective {
//     var dir = {
//         templateUrl: 'views/main.html',
//         controller: 'mainCtrl',
//         controllerAs: 'main',
//         restrict: 'EA'
//         //,scope: true
//     };
//     return dir;
// }

/** Main controller for the application */
@autoinject
export class Main {	//mainCtrl {

    public GenerateType = GenerateType;
    public ModelType = ModelType;
    public Mode = Mode;

    public $modal : any;    //TODO use aurelia-modal

    constructor(
        //private $modal: uib.IModalService<string>,
        private selection:Selection, 
        private undo:Undo
        ) {

        this.selection.tournament = TournamentLib.newTournament();

        var filename = '/data/tournament8.json';
        //var filename = '/data/to2006.json';

        //Load saved tournament if exists
        //MainLib.loadTournament().then((data) => {
        //}, (reason) => {
        MainLib.loadTournament(filename).then((data) => {
        });
        //});

        //Auto save tournament on exit
        let onBeforeUnloadHandler = (event: BeforeUnloadEvent) => {
            MainLib.saveTournament(this.selection.tournament);
        };
        if (window.addEventListener) {
            window.addEventListener('beforeunload', onBeforeUnloadHandler);
        } else {
            window.onbeforeunload = onBeforeUnloadHandler;
        }


    }

    //#region tournament
    newTournament(): void {
        //TODO confirmation
        //TODO undo
        MainLib.newTournament();
        this.editTournament(this.selection.tournament);
    }
    loadTournament(file: File): void {
        MainLib.loadTournament(file);
    }
    saveTournament(): void {
        MainLib.saveTournament(this.selection.tournament, '');

    }
    editTournament(tournament: Tournament): void {

        var editedInfo = TournamentLib.newInfo(this.selection.tournament.info);

        this.$modal.open({
            templateUrl: 'views/tournament/dialogInfo.html',
            controller: 'dialogInfoCtrl as dlg',    //required for resolve
            resolve: {
                title: () => "Edit info",
                info: () => editedInfo
            }
        }).result.then((result: string) => {
                if ('Ok' === result) {
                    //MainLib.editInfo(editedInfo, this.selection.tournament.info);
                    var c = this.selection.tournament;
                    this.undo.update(this.selection.tournament, 'info', editedInfo, "Edit info"); //c.info = editedInfo;
                }
            });
    }
    //#endregion tournament

    select(item: Box | Draw | TEvent | Player | Tournament, type?: ModelType): void {
        if (item && type) {
            //first unselect any item to close the actions dropdown
            this.selection.unselect(type);
            //then select the new box
            setTimeout(() => this.selection.select(item, type), 0);
            return;
        }
        this.selection.select(item, type);
    }

    //#region player
    addPlayer(): void {

        var newPlayer = TournamentLib.newPlayer(this.selection.tournament);

        this.$modal.open({
            templateUrl: 'views/player/dialogPlayer.html',
            controller: 'dialogPlayerCtrl as dlg',    //required for resolve
            resolve: {
                title: () => "New player",
                player: () => newPlayer,
                events: () => this.selection.tournament.events
            }
        }).result.then((result: string) => {
                if ('Ok' === result) {
                    MainLib.addPlayer(this.selection.tournament, newPlayer);
                }
            });
    }

    editPlayer(player: Player): void {

        var editedPlayer = TournamentLib.newPlayer(this.selection.tournament, player);

        this.$modal.open({
            templateUrl: 'views/player/dialogPlayer.html',
            controller: 'dialogPlayerCtrl as dlg',    //required for resolve
            resolve: {
                title: () => "Edit player",
                player: () => editedPlayer,
                events: () => this.selection.tournament.events
            }
        }).result.then((result: string) => {
                if ('Ok' === result) {
                    MainLib.editPlayer(editedPlayer, player);
                } else if ('Del' === result) {
                    MainLib.removePlayer(player)
            }
            });
    }
    removePlayer(player: Player): void {
        MainLib.removePlayer(player);
    }
    //#endregion player

    //#region event
    addEvent(after?: TEvent): void { //TODO afterEvent

        var newEvent = TournamentLib.newEvent(this.selection.tournament);

        this.$modal.open({
            templateUrl: 'views/event/dialogEvent.html',
            controller: 'dialogEventCtrl as dlg',    //required for resolve
            resolve: {
                title: () => "New event",
                event: () => newEvent
            }
        }).result.then((result: string) => {
                if ('Ok' === result) {
                    MainLib.addEvent(this.selection.tournament, newEvent, after); //TODO add event after selected event
                }
            });
    }

    editEvent(event: TEvent): void {

        var editedEvent = TournamentLib.newEvent(this.selection.tournament, event);

        this.$modal.open({
            templateUrl: 'views/event/dialogEvent.html',
            controller: 'dialogEventCtrl as dlg',    //required for resolve
            resolve: {
                title: () => "Edit event",
                event: () => editedEvent
            }
        }).result.then((result: string) => {
                if ('Ok' === result) {
                    MainLib.editEvent(editedEvent, event);
                } else if ('Del' === result) {
                    MainLib.removeEvent(event)
            }
            });
    }

    removeEvent(event: TEvent): void {
        MainLib.removeEvent(event);
    }
    //#endregion event

    //#region draw
    addDraw(after?: Draw): void {

        var newDraw = DrawLib.newDraw(this.selection.event, undefined, after);

        this.$modal.open({
            templateUrl: 'views/draw/dialogDraw.html',
            controller: 'dialogDrawCtrl as dlg',    //required for resolve
            resolve: {
                title: () => "New draw",
                draw: () => newDraw
            }
        }).result.then((result: string) => {
                //TODO add event after selected draw
                if ('Ok' === result) {
                    MainLib.addDraw(newDraw, 0, after);
                } else if ('Generate' === result) {
                    MainLib.addDraw(newDraw, 1, after);
                }
            });
    }

    editDraw(draw: Draw): void {

        var editedDraw = DrawLib.newDraw(draw._event, draw);

        this.$modal.open({
            templateUrl: 'views/draw/dialogDraw.html',
            controller: 'dialogDrawCtrl as dlg',    //required for resolve
            resolve: {
                title: () => "Edit draw",
                draw: () => editedDraw
            }
        }).result.then((result: string) => {
                if ('Ok' === result) {
                    MainLib.updateDraw(editedDraw, draw);
                } else if ('Generate' === result) {
                    MainLib.updateDraw(editedDraw, draw, 1);
                } else if ('Del' === result) {
                    MainLib.removeDraw(draw);
                }
            });
    }

    validateDraw(draw: Draw): void {
        MainLib.validateDraw(draw);
    }

    generateDraw(draw: Draw, generate?: GenerateType): void {
        MainLib.updateDraw(draw, undefined, generate || GenerateType.Create);
    }

    updateQualif(draw: Draw): void {
        MainLib.updateQualif(draw);
    }

    removeDraw(draw: Draw): void {
        MainLib.removeDraw(draw);
    }
    //#endregion draw

    //#region match
    isMatch(box: Box): boolean {
        return box && 'score' in box;
    }
    editMatch(match: Match): void {

        var editedMatch = <Match> DrawLib.newBox(match._draw, match);

        this.$modal.open({
            templateUrl: 'views/draw/dialogMatch.html',
            controller: 'dialogMatchCtrl as dlg',    //required for resolve
            resolve: {
                title: () => "Edit match",
                match: () => editedMatch
            }
        }).result.then((result: string) => {
                if ('Ok' === result) {
                    MainLib.editMatch(editedMatch, match);
                }
            });
    }
    //#endregion match

    public doUndo(): void {
        this.selection.select(this.undo.undo(), this.undo.getMeta());
    }
    public doRedo(): void {
        this.selection.select(this.undo.redo(), this.undo.getMeta());
    }
}

// angular.module('jat.main', [
//     'jat.services.mainLib',
//     'jat.services.selection',
//     'jat.services.undo',
//     'jat.services.tournamentLib',
//     'jat.services.drawLib',
//     'jat.services.knockout',
//     'jat.services.roundrobin',

//     'jat.services.validation',
//     'jat.services.validation.knockout',
//     'jat.services.validation.roundrobin',
//     'jat.services.validation.fft',

//     'jat.tournament.dialog',
//     'jat.player.dialog',
//     'jat.player.list',
//     'jat.event.dialog',
//     'jat.event.list',
//     'jat.draw.dialog',
//     'jat.draw.list',
//     'jat.draw.box',
//     'jat.match.dialog',
//     'ec.panels',
//     'ec.inputFile',
// //'polyfill',
//     'ui.bootstrap'])

//     .directive('main', mainDirective)
//     .controller('mainCtrl', mainCtrl);