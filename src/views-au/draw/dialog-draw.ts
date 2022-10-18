import { autoinject, bindable, BindingEngine, Disposable } from 'aurelia-framework';
import { DialogController } from 'aurelia-dialog';

import { rank, category } from '../../services/types';
import { getRegisteredPlayers } from '../../services/tournamentService';
import { groupFindAllPlayerOut, previousGroup } from '../../services/drawService';

interface DrawModel {
    title: string;
    draw: Draw;
};

@autoinject
export class DialogDraw {

    private title: string;
    private draw: Draw;

    private ranks: RankString[];
    private categories: RankString[];
    private drawTypes: { value: number; label: string; }[];

    // private disposeMinRank: Disposable;
    // private disposeMaxRank: Disposable;

    constructor(
        private controller: DialogController,
        private bindingEngine: BindingEngine
    ) {
        this.drawTypes = [];
        this.drawTypes[DrawType.Normal] = { value: DrawType.Normal, label: "Normal" }; //TODO translate
        this.drawTypes[DrawType.Final] = { value: DrawType.Final, label: "Final" };
        this.drawTypes[DrawType.PouleSimple] = { value: DrawType.PouleSimple, label: "Round-robin simple" };
        this.drawTypes[DrawType.PouleAR] = { value: DrawType.PouleAR, label: "Round-robin double" };

        this.ranks = rank.list();
        
        this.categories = category.list();
    }

    activate(model: DrawModel) {
        this.title = model.title;
        this.draw = model.draw;

        //Force minRank <= maxRank
        //this.disposeMinRank = 
        this.bindingEngine.propertyObserver(this.draw, 'minRank').subscribe((minRank: string) => {
            if (!this.draw.maxRank || rank.compare(minRank, this.draw.maxRank) > 0) {
                this.draw.maxRank = minRank;
            }
        });
        //this.disposeMaxRank = 
        this.bindingEngine.propertyObserver(this.draw, 'maxRank').subscribe((maxRank: string) => {
            if (maxRank && this.draw.minRank && rank.compare(this.draw.minRank, maxRank) > 0) {
                this.draw.minRank = maxRank;
            }
        });
    }

    // desactivate() {
    //     this.disposeMaxRank.dispose();
    //     this.disposeMinRank.dispose();
    // }

    getRegisteredCount(): number {
        var n = getRegisteredPlayers(this.draw).length;
        var previous = previousGroup(this.draw);
        if (previous) {
            var qualifs = groupFindAllPlayerOut(previous);
            if (qualifs) {
                n += qualifs.length;
            }
        }
        return n;
    }
    //getNbEntry(): number {
    //    return countInCol(iColMax(draw), draw.nbOut);
    //}
}