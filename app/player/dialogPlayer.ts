'use strict';
module jat.player {

    export class dialogPlayerCtrl {

        ranks: RankString[];
        categories: CategoryString[];

        constructor(
            private title: string,
            private player: models.Player,
            private events: models.Event[],
            rank: ServiceRank,
            category: ServiceCategory
            ) {

            this.ranks = rank.list();
            this.categories = category.list();
        }
    }

    angular.module('jat.player.dialog', ['jat.utils.checkList'])
        .controller('dialogPlayerCtrl', [
            'title',
            'player',
            'events',
            'rank',
            'category',
            dialogPlayerCtrl]);
}