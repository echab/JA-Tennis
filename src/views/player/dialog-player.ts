import {autoinject} from 'aurelia-framework';
import {bindable} from 'aurelia-framework';

import { rank, category} from '../../services/types';

@autoinject
export class DialogPlayer {

    ranks: RankString[];
    categories: CategoryString[];

    constructor(
        private title: string,
        private player: Player,
        private events: TEvent[]
        ) {

        this.ranks = rank.list();
        this.categories = category.list();
    }
}