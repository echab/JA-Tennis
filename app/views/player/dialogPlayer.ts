'use strict';
module jat.player {

    export class dialogPlayerCtrl {

        ranks: RankString[];
        categories: CategoryString[];

        static $inject = [
            'title',
            'player',
            'events',
            'rank',
            'category'
        ];

        constructor(
            private title: string,
            private player: models.Player,
            private events: models.Event[],
            rank: Rank,
            category: Category
            ) {

            this.ranks = rank.list();
            this.categories = category.list();
        }
    }

    angular.module('jat.player.dialog', ['jat.utils.checkList'])
        .controller('dialogPlayerCtrl', dialogPlayerCtrl);
}