import {autoinject,bindable} from 'aurelia-framework';
import {DialogService,DialogResult} from 'aurelia-dialog';

import {DialogPlayer} from '../views/player/dialog-player';

import { Selection,ModelType } from './util/selection';
import { Undo } from './util/undo';

import { MainLib } from './mainLib';
import { TournamentLib } from './tournamentLib';

@autoinject
export class PlayerEditor {

    constructor(
        private mainLib: MainLib, 
        private dialogService: DialogService,
        public selection:Selection, 
        private undo:Undo
        ) {
		  }

    add(): void {

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

    edit(player: Player): void {

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
    remove(player: Player): void {
        this.mainLib.removePlayer(player);
    }		  
}
