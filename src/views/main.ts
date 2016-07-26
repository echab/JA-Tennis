import {autoinject,bindable} from 'aurelia-framework';
import {DialogService,DialogResult} from 'aurelia-dialog';

import {DialogInfo} from './tournament/dialog-info';
import {DialogPlayer} from './player/dialog-player';
import {DialogEvent} from './event/dialog-event';
import {DialogDraw} from './draw/dialog-draw';
import {DialogMatch} from './draw/dialog-match';

import { Selection,ModelType } from '../services/util/selection';
import { Undo } from '../services/util/undo';

import { MainLib } from '../services/mainLib';
import { TournamentLib } from '../services/tournamentLib';
import { DrawLib } from '../services/draw/drawLib';
import { Validation } from '../services/validation';

/** Main controller for the application */
@autoinject
export class Main {

    private tournamentOpened = true; 
    private playersOpened = false;
    private drawsOpened = true;
    private planningOpened = false;

    private modelTypeEvent = ModelType.TEvent;  //used in view for selection
    private modelTypeDraw = ModelType.Draw;
    private modelTypeBox  = ModelType.Box;

    constructor(
        private mainLib: MainLib, 
        private dialogService: DialogService,
        public selection:Selection, 
        private undo:Undo
        ) {

        this.selection.tournament = TournamentLib.newTournament();

        //var filename = '/data/tournament8.json';
        var filename = '/data/jeu4test.json';

        //Load saved tournament if exists
        //this.mainLib.loadTournament().then((data) => {
        //}, (reason) => {
        this.mainLib.loadTournament(filename).then(tournament => {
            this.selection.select(tournament, ModelType.Tournament);
        });
        //});

        //Auto save tournament on exit
        window.addEventListener('beforeunload',  () =>
            this.mainLib.saveTournament(this.selection.tournament)
        );

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
    editTournament(tournament: Tournament): void {

        var editedInfo = TournamentLib.newInfo(this.selection.tournament.info);

        this.dialogService.open({
            viewModel: DialogInfo, 
            model: {
                title: "Edit info",
                info: editedInfo
            }
        }).then((result: DialogResult) => {
            if ('Ok' === result.output) {
                //this.mainLib.editInfo(editedInfo, this.selection.tournament.info);
                var c = this.selection.tournament;
                this.undo.update(this.selection.tournament, 'info', editedInfo, "Edit info"); //c.info = editedInfo;
            }
        });
    }
    //#endregion tournament

    select(item: Box | Draw | TEvent | Player | Tournament | string, type?: ModelType): void {
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

        this.dialogService.open({
            viewModel: DialogPlayer, 
            model: {
                title: "New player",
                player: newPlayer,
                events: this.selection.tournament.events
            }
        }).then((result) => {
            if ('Ok' === result.output) {
                this.mainLib.addPlayer(this.selection.tournament, newPlayer);
            }
        });
    }

    editPlayer(player: Player): void {

        var editedPlayer = TournamentLib.newPlayer(this.selection.tournament, player);

        this.dialogService.open({
            viewModel: DialogPlayer, 
            model: {
                title: "Edit player",
                player: editedPlayer,
                events: this.selection.tournament.events
            }
        }).then((result: DialogResult) => {
            if ('Ok' === result.output) {
                this.mainLib.editPlayer(editedPlayer, player);
            } else if ('Del' === result.output) {
                this.mainLib.removePlayer(player)
            }
        });
    }
    removePlayer(player: Player): void {
        this.mainLib.removePlayer(player);
    }
    //#endregion player

    //#region event
    addEvent(after?: TEvent): void { //TODO afterEvent

        var newEvent = TournamentLib.newEvent(this.selection.tournament);

        this.dialogService.open({
            viewModel: DialogEvent, 
            model: {
                title: "New event",
                event: newEvent
            }
        }).then((result: DialogResult) => {
            if ('Ok' === result.output) {
                this.mainLib.addEvent(this.selection.tournament, newEvent, after); //TODO add event after selected event
            }
        });
    }

    editEvent(event: TEvent): void {

        var editedEvent = TournamentLib.newEvent(this.selection.tournament, event);

        this.dialogService.open({
            viewModel: DialogEvent, 
            model: {
                title: "Edit event",
                event: editedEvent
            }
        }).then((result: DialogResult) => {
            if ('Ok' === result.output) {
                this.mainLib.editEvent(editedEvent, event);
            } else if ('Del' === result.output) {
                this.mainLib.removeEvent(event)
            }
        });
    }

    removeEvent(event: TEvent): void {
        this.mainLib.removeEvent(event);
    }
    //#endregion event

    //#region draw
    addDraw(after?: Draw): void {

        var newDraw = DrawLib.newDraw(this.selection.event, undefined, after);

        this.dialogService.open({
            viewModel: DialogDraw, 
            model: {
                title: "New draw",
                draw: newDraw
            }
        }).then((result: DialogResult) => {
            //TODO add event after selected draw
            if ('Ok' === result.output) {
                this.mainLib.addDraw(newDraw, 0, after);
            } else if ('Generate' === result.output) {
                this.mainLib.addDraw(newDraw, 1, after);
            }
        });
    }

    editDraw(draw: Draw): void {
        if(!draw) {
            return;
        }
        var editedDraw = DrawLib.newDraw(draw._event, draw);

        this.dialogService.open({
            viewModel: DialogDraw, 
            model: {
                title: "Edit draw",
                draw: editedDraw
            }
        }).then((result: DialogResult) => {
            if ('Ok' === result.output) {
                this.mainLib.updateDraw(editedDraw, draw);
            } else if ('Generate' === result.output) {
                this.mainLib.updateDraw(editedDraw, draw, GenerateType.Create);
            } else if ('Del' === result.output) {
                this.mainLib.removeDraw(draw);
            }
        });
    }

    validateDraw(draw: Draw): void {
        this.mainLib.validateDraw(draw);
    }

    generateDraw(draw: Draw, generate?: GenerateType): void {
        this.mainLib.updateDraw(draw, undefined, generate || GenerateType.Create);
    }

    updateQualif(draw: Draw): void {
        this.mainLib.updateQualif(draw);
    }

    removeDraw(draw: Draw): void {
        this.mainLib.removeDraw(draw);
    }
    //#endregion draw

    //#region match
    isMatch(box: Box): boolean {
        return box && 'score' in box;
    }
    editMatch(match: Match): void {

        var editedMatch = <Match> DrawLib.newBox(match._draw, match);

        this.dialogService.open({
            viewModel: DialogMatch, 
            model: {
                title: "Edit match",
                match: editedMatch
            }
        }).then((result: DialogResult) => {
            if ('Ok' === result.output) {
                this.mainLib.editMatch(editedMatch, match);
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

    static getAncestorViewModel(container /*:Container*/, clazz:Function) {
        for( let c = container; c; c = c.parent) {
            if( c.viewModel && c.viewModel instanceof clazz) {
                return c.viewModel;
            }
        } 
    }
}