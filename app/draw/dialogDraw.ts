'use strict';
module jat.draw {
    class dialogDrawCtrl {
        ranks: RankString[];
        categories: RankString[];
        drawTypes: { value: number; label: string; }[];

        getRegisteredCount(): number {
            var n = this.tournamentLib.GetJoueursInscrit(this.draw).length;
            var previous = this.drawLib.previousGroup(this.draw);
            if (previous) {
                var qualifs = this.drawLib.FindAllQualifieSortant(previous);
                if (qualifs) {
                    n += qualifs.length;
                }
            }
            return n;
        }
        //getNbEntry(): number {
        //    return this.drawLib.countInCol(iColMax(draw), draw.nbOut);
        //}

        static $inject = [
            'title',
            'draw',
            //'selection',
            'rank',
            'category',
            'drawLib',
            'tournamentLib',
            '$scope'];

        constructor(
            private title: string,
            private draw: models.Draw,
            //private selection: jat.service.Selection,
            private rank: ServiceRank,
            category: ServiceCategory,
            private drawLib: jat.service.DrawLib,
            private tournamentLib: jat.service.TournamentLib
            ,$scope: ng.IScope
            ) {

            this.drawTypes = [];
            for (var i = 0; i < 4; i++) {
                this.drawTypes[i] = { value: i, label: models.DrawType[i] };
            }

            this.ranks = rank.list();
            this.categories = category.list();

            //Force minRank <= maxRank
            $scope.$watch('dlg.draw.minRank', (minRank: string) => {
                if (!this.draw.maxRank || this.rank.compare(minRank, this.draw.maxRank) > 0) {
                    this.draw.maxRank = minRank;
                }
            });
            $scope.$watch('dlg.draw.maxRank', (maxRank: string) => {
                if (maxRank && this.draw.minRank && this.rank.compare(this.draw.minRank, maxRank) > 0) {
                    this.draw.minRank = maxRank;
                }
            });
        }
    }

    angular.module('jat.draw.dialog', [])
        .controller('dialogDrawCtrl', dialogDrawCtrl);
}