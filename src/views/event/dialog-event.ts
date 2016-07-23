import {autoinject} from 'aurelia-framework';
import {bindable} from 'aurelia-framework';

import { TournamentLib as tournamentLib } from '../../services/tournamentLib';
import { rank, category} from '../../services/types';

@autoinject
export class DialogEvent {

    ranks: RankString[];
    categories: CategoryString[];
    registred: Player[];

    constructor(
        private selection: Selection,
        private title: string,
        private event: TEvent
        ) {

        this.ranks = rank.list();
        this.categories = category.list();

        this.registred = tournamentLib.getRegistred(event);
    }
}