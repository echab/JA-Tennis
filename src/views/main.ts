import {autoinject,bindable} from 'aurelia-framework';

import { TournamentEditor } from '../services/tournamentEditor';
import { EventEditor } from '../services/eventEditor';
import { DrawEditor } from '../services/drawEditor';

import { Selection,ModelType } from '../services/selection';
import { Undo } from '../services/util/undo';

import { MainLib } from '../services/mainLib';
import { TournamentLib } from '../services/tournamentLib';

/** Main controller for the application */
@autoinject
export class Main {

    private tournamentOpened = true; 
    private playersOpened = false;
    private drawsOpened = true;
    private planningOpened = false;

    constructor(
        private tournamentEditor: TournamentEditor,
        private eventEditor: EventEditor,
        private drawEditor: DrawEditor,
        private mainLib: MainLib, 
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

    //#region draw

    public doUndo(): void {
        this.selection.select(this.undo.undo(), this.undo.getMeta());
    }
    public doRedo(): void {
        this.selection.select(this.undo.redo(), this.undo.getMeta());
    }

    // static getAncestorViewModel(container /*:Container*/, clazz:Function) {
    //     for( let c = container; c; c = c.parent) {
    //         if( c.viewModel && c.viewModel instanceof clazz) {
    //             return c.viewModel;
    //         }
    //     } 
    // }
}