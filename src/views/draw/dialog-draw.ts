import { autoinject } from 'aurelia-framework';
import { bindable } from 'aurelia-framework';
import { DialogController } from 'aurelia-dialog';

import { BindingEngine } from 'aurelia-framework'
import { TournamentLib as tournamentLib } from '../../services/tournamentLib';
import { DrawLib as drawLib } from '../../services/draw/drawLib';
import { rank, category } from '../../services/types';

interface DrawModel {
    title: string;
    draw: Draw;
    //selection: Selection;
};

@autoinject
export class DialogDraw {

    title: string;
    draw: Draw;
    //selection: Selection;

    ranks: RankString[];
    categories: RankString[];
    drawTypes: { value: number; label: string; }[];

    constructor(
        private controller: DialogController,
        private bindingEngine: BindingEngine    //$watch
    ) {
        this.drawTypes = [];
        for (var i = 0; i < 4; i++) {
            this.drawTypes[i] = { value: i, label: DrawType[i] };
        }

        this.ranks = rank.list();
        this.categories = category.list();
    }

    activate(model: DrawModel) {
        this.title = model.title;
        this.draw = model.draw;

        //Force minRank <= maxRank
        this.bindingEngine.propertyObserver(this.draw, 'minRank').subscribe((minRank: string) => {
            if (!this.draw.maxRank || rank.compare(minRank, this.draw.maxRank) > 0) {
                this.draw.maxRank = minRank;
            }
        });
        this.bindingEngine.propertyObserver(this.draw, 'maxRank').subscribe((maxRank: string) => {
            if (maxRank && this.draw.minRank && rank.compare(this.draw.minRank, maxRank) > 0) {
                this.draw.minRank = maxRank;
            }
        });
    }

    getRegisteredCount(): number {
        var n = tournamentLib.GetJoueursInscrit(this.draw).length;
        var previous = drawLib.previousGroup(this.draw);
        if (previous) {
            var qualifs = drawLib.groupFindAllPlayerOut(previous);
            if (qualifs) {
                n += qualifs.length;
            }
        }
        return n;
    }
    //getNbEntry(): number {
    //    return this.drawLib.countInCol(iColMax(draw), draw.nbOut);
    //}
}