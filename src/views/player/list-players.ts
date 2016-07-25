import { autoinject,bindable } from 'aurelia-framework';

//import {Logger} from 'aurelia-logging';

import { Main } from '../main';
import { Selection } from '../../services/util/selection';
import { Find } from '../../services/util/find';

@autoinject
export class ListPlayers { //ListPlayersCustomElement

    @bindable players: Player[];

    private main: Main;

    constructor(private selection: Selection) {
        //console.info('Players:' + this.players);
    }

    created(owningView /*: View*/, myView /*: View*/) {
        this.main = Main.getAncestorViewModel( myView.container, Main);
    }

    attached() {
        //console.info('Attached: Players=' + this.players);
    }

    activate() {
        //console.info('Activate: Players=' + this.players);
    }

    eventById(id: string): TEvent {
        if (this.selection.tournament && this.selection.tournament.events) {
            return Find.byId(this.selection.tournament.events, id);
        }
    }

}