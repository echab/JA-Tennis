import {autoinject} from 'aurelia-framework';
import {bindable} from 'aurelia-framework';

import {BindingEngine} from 'aurelia-framework'
import { TournamentLib as tournamentLib } from '../../services/tournamentLib';
import { DrawLib as drawLib } from '../../services/draw/drawLib';
import { rank, category} from '../../services/types';

@autoinject
export class dialogDrawCtrl {
    ranks: RankString[];
    categories: RankString[];
    drawTypes: { value: number; label: string; }[];

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

    constructor(
        private title: string,
        private draw: Draw,
        //private selection: Selection
        bindingEngine: BindingEngine    //$watch
        ) {

        this.drawTypes = [];
        for (var i = 0; i < 4; i++) {
            this.drawTypes[i] = { value: i, label: DrawType[i] };
        }

        this.ranks = rank.list();
        this.categories = category.list();

        //Force minRank <= maxRank
        bindingEngine.propertyObserver( draw, 'minRank').subscribe( (minRank: string) => {
            if (!this.draw.maxRank || rank.compare(minRank, this.draw.maxRank) > 0) {
                this.draw.maxRank = minRank;
            }
        });
        bindingEngine.propertyObserver( draw, 'maxRank').subscribe( (maxRank: string) => {
            if (maxRank && this.draw.minRank && rank.compare(this.draw.minRank, maxRank) > 0) {
                this.draw.minRank = maxRank;
            }
        });
    }
}