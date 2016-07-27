import { autoinject,bindable } from 'aurelia-framework';

import { PlayerEditor } from '../../services/playerEditor';
import { Selection } from '../../services/selection';
import { Find } from '../../services/util/find';

@autoinject
export class ListPlayers {

    @bindable players: Player[];

    constructor(
        private playerEditor: PlayerEditor,
        private selection: Selection
    ) {
    }

    eventById(id: string): TEvent {
        var tournament = this.selection.tournament; 
        if (tournament && tournament.events) {
            return Find.byId(tournament.events, id);
        }
    }
}