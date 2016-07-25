import { autoinject } from 'aurelia-framework';
import { bindable } from 'aurelia-framework';
import { DialogController } from 'aurelia-dialog';

import { TournamentLib as tournamentLib } from '../../services/tournamentLib';
import { rank, category } from '../../services/types';

interface EventModel {
    title: string;
    event: TEvent;
};

@autoinject
export class DialogEvent {

    private title: string;
    private event: TEvent;

    ranks: RankString[];
    categories: CategoryString[];
    registred: Player[];

    constructor(private controller: DialogController) {
        this.ranks = rank.list();
        this.categories = category.list();
    }

    activate(model: EventModel) {
        this.title = model.title;
        this.event = model.event;

        this.registred = tournamentLib.getRegistred(model.event);
    }
}