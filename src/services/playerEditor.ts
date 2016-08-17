import {autoinject,bindable} from 'aurelia-framework';
import {DialogService,DialogResult} from 'aurelia-dialog';

import {DialogPlayer} from '../views/player/dialog-player';

import { TournamentEditor} from './tournamentEditor';
import { Selection,ModelType } from './selection';
import { Undo } from './util/undo';
import { Find } from './util/find';
import { Guid } from './util/guid';
import { isObject,extend } from './util/object'

@autoinject
export class PlayerEditor {

    constructor(
        private dialogService: DialogService,
        public selection:Selection, 
        private undo:Undo
        ) {
		  }

    public static newPlayer(parent: Tournament, source?: Player): Player {
        var player: Player = <any>{};
        if (isObject(source)) {
            extend(player, source);
        }
        player.id = player.id || Guid.create('p');
        //delete (<any>player).$$hashKey;   //TODO remove angular id

        this.init(player, parent);
        return player;
    }

    public static init(player: Player, parent: Tournament) {
        player._tournament = parent;
        //player.toString = function () {
        //    return this.name + ' ' + this.rank;
        //};
    }

    add(): void {

        var newPlayer = PlayerEditor.newPlayer(this.selection.tournament);

        this.dialogService.open({
            viewModel: DialogPlayer, 
            model: {
                title: "New player",
                player: newPlayer,
                events: this.selection.tournament.events
            }
        }).then((result) => {
            if ('Ok' === result.output) {
                this._addPlayer(this.selection.tournament, newPlayer);
            }
        });
    }

    edit(player: Player): void {

        var editedPlayer = PlayerEditor.newPlayer(this.selection.tournament, player);

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
        var c = editedPlayer._tournament.players;
        var i = Find.indexOf(c, "id", editedPlayer.id, "Player to update not found");
        this.undo.update(c, i, editedPlayer, "Edit " + editedPlayer.name + " " + i, ModelType.Player); //c[i] = editedPlayer;
        if (isSelected) {
            this.selection.select(editedPlayer, ModelType.Player);
        }
        //update all _player internal references
        TournamentEditor.init(editedPlayer._tournament);
    }

    remove(player: Player): void {
        var c = player._tournament.players;
        var i = Find.indexOf(c, "id", player.id, "Player to remove not found");
        this.undo.remove(c, i, "Delete " + player.name + " " + i, ModelType.Player);   //c.splice( i, 1);
        if (this.selection.player === player) {
            this.selection.select(c[i] || c[i - 1], ModelType.Player); //select next or previous
        }
        //TODO update all _player internal references
        TournamentEditor.init(player._tournament);
    }
}
