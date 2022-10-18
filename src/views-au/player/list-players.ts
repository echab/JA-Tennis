import { autoinject,bindable } from 'aurelia-framework';
import { Player } from '../../domain/player';
import { TEvent } from '../../domain/tournament';

import { PlayerEditor } from '../../services/playerEditor';
import { Selection } from '../../services/selection';
import { byId } from '../../services/util/find';

@autoinject
export class ListPlayers {

    @bindable players: Player[];

    constructor(
        private playerEditor: PlayerEditor,
        private selection: Selection
    ) {
    }

    eventById(id: string): TEvent | undefined {
        var tournament = this.selection.tournament; 
        if (tournament && tournament.events) {
            return byId(tournament.events, id);
        }
    }
}