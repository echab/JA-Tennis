import {autoinject,bindable} from 'aurelia-framework';
import {DialogService,DialogResult} from 'aurelia-dialog';

import {DialogPlayer} from './player/dialog-player';

import { TournamentEditor} from './tournamentEditor';
import { Selection,ModelType } from './selection';
import { Undo } from './util/undo';
import { indexOf } from './util/find';
import { Guid } from './util/guid';
import { newPlayer } from '../services/playerService';
import { Player } from '../domain/player';
import { Tournament } from '../domain/tournament';

@autoinject
export class PlayerEditor {

    constructor(
        private dialogService: DialogService,
        public selection:Selection, 
        private undo:Undo
        ) {
		  }

    add(): void {

        var player = newPlayer(this.selection.tournament);

        this.dialogService.open({
            viewModel: DialogPlayer, 
            model: {
                title: "New player",
                player,
                events: this.selection.tournament.events
            }
        }).then((result) => {
            if ('Ok' === result.output) {
                this._addPlayer(this.selection.tournament, player);
            }
        });
    }

    edit(player: Player): void {

        var editedPlayer = newPlayer(this.selection.tournament, player);

        this.dialogService.open({
            viewModel: DialogPlayer, 
            model: {
                title: "Edit player",
                player: editedPlayer,
                events: this.selection.tournament.events
            }
        }).then((result: DialogResult) => {
            if ('Ok' === result.output) {
                this._editPlayer(editedPlayer, player);
            } else if ('Del' === result.output) {
                this.remove(player)
            }
        });
    }

    /*private*/ _addPlayer(tournament: Tournament, player: Player): void {
        var c = tournament.players;
        player.id = Guid.create('p');

        this.undo.insert(c, -1, player, "Add " + player.name, ModelType.Player); //c.push( player);
        this.selection.select(player, ModelType.Player);
    }

    /*private*/ _editPlayer(editedPlayer: Player, player: Player): void {
        var isSelected = this.selection.player === player;
        this.undo.updateProperties(player, editedPlayer, "Edit " + editedPlayer.name, ModelType.Player); //player.* = editedPlayer.*;
        if (isSelected) {
            this.selection.select(editedPlayer, ModelType.Player);
        }
    }

    remove(player: Player): void {
        var c = player._tournament.players;
        var i = indexOf(c, "id", player.id, "Player to remove not found");
        this.undo.remove(c, i, "Delete " + player.name + " " + i, ModelType.Player);   //c.splice( i, 1);
        if (this.selection.player === player) {
            this.selection.select(c[i] || c[i - 1], ModelType.Player); //select next or previous
        }
        //TODO update all _player internal references
        TournamentEditor.init(player._tournament);
    }
}
