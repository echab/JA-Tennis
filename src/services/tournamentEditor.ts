import {autoinject,bindable} from 'aurelia-framework';
import {DialogService,DialogResult} from 'aurelia-dialog';

import {DialogInfo} from '../views/tournament/dialog-info';

import { Selection,ModelType } from './selection';
import { Undo } from './util/undo';

import { MainLib } from './mainLib';
import { TournamentLib } from './tournamentLib';

@autoinject
export class TournamentEditor {

    constructor(
        private mainLib: MainLib, 
        private dialogService: DialogService,
        public selection:Selection, 
        private undo:Undo
        ) {
		  }

    newTournament(): void {
        //TODO confirmation
        //TODO undo
        this.mainLib.newTournament();
        this.edit(this.selection.tournament);
    }

    load(file: File): void {
        this.mainLib.loadTournament(file);
    }

    save(): void {
        this.mainLib.saveTournament(this.selection.tournament, '');

    }

    edit(tournament: Tournament): void {

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
}