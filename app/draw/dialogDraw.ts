'use strict';
module jat.draw {
    class dialogDrawCtrl {
        ranks: RankString[];
        categories: RankString[];
        drawTypes: { value: number; label: string; }[];

        getRegisteredCount(): number {
            var players = this.drawLib.GetJoueursInscrit(this.draw);
            return players.length;
        }
        //getNbEntry(): number {
        //    return this.drawLib.countInCol(iColMax(draw), draw.nbOut);
        //}

        constructor(
            private title: string,
            private draw: models.Draw,
            //private selection: jat.service.Selection,
            rank: ServiceRank,
            category: ServiceCategory,
            private drawLib: jat.service.DrawLib
            ) {

            this.drawTypes = [];
            for (var i = 0; i < 4; i++) {
                this.drawTypes[i] = { value: i, label: models.DrawType[i] };
            }

            this.ranks = rank.list();
            this.categories = category.list();
        }
    }

    angular.module('jat.draw.dialog', [])
        .controller('dialogDrawCtrl', dialogDrawCtrl);
}