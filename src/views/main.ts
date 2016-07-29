import {autoinject,bindable} from 'aurelia-framework';

import { TournamentEditor } from '../services/tournamentEditor';
import { EventEditor } from '../services/eventEditor';
import { DrawEditor } from '../services/drawEditor';
import { PlayerEditor } from '../services/playerEditor';

import { Selection,ModelType } from '../services/selection';
import { Undo } from '../services/util/undo';

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
        private playerEditor: PlayerEditor,
        private selection:Selection, 
        private undo:Undo
        ) {

        var conf = JSON.parse( localStorage.getItem('panelsOpened'));
        if (conf) {
            this.tournamentOpened = conf.tournament;
            this.playersOpened = conf.players;
            this.drawsOpened = conf.draws;
            this.planningOpened = conf.planning;
        }

        //tournamentEditor.add();

        //var filename = '/data/tournament8.json';
        var filename = '/data/jeu4test.json';

        //Load saved tournament if exists
        this.tournamentEditor.load(filename).then(tournament => {
            this.selection.select(tournament, ModelType.Tournament);
        });

        //Auto save tournament on exit
        window.addEventListener('beforeunload',  () => {
            this.tournamentEditor.save();

            localStorage.setItem('panelsOpened', JSON.stringify({
                tournament: this.tournamentOpened,
                players : this.playersOpened,
                draws : this.drawsOpened,
                planning : this.planningOpened
            }));

        });

    }

    public doUndo(): void {
        this.selection.select(this.undo.undo(), this.undo.getMeta());
    }

    public doRedo(): void {
        this.selection.select(this.undo.redo(), this.undo.getMeta());
    }
}