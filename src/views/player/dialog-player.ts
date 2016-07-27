import { autoinject } from 'aurelia-framework';
import { bindable } from 'aurelia-framework';
import { DialogController } from 'aurelia-dialog';

import { rank, category } from '../../services/types';

interface PlayerModel {
    title: string;
    player: Player;
    events: TEvent[];
};

@autoinject
export class DialogPlayer {

    title: string;
    player: Player;
    events: TEvent[];

    ranks: RankString[];
    categories: CategoryString[];

    constructor(private controller: DialogController) {
        this.ranks = rank.list();
        this.categories = category.list();
    }

    activate(model: PlayerModel) {
        this.title = model.title;
        this.player = model.player;
        if( !this.player.registration) {
            this.player.registration = [];
        }
        this.events = model.events;
    }
}