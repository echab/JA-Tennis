'use strict';
module jat.event {

    class dialogEventCtrl {

        ranks: RankString[];
        categories: CategoryString[];
        registred: Player[];

        static $inject = [
            'selection',
            'title',
            'event',
            'tournamentLib',
            'rank',
            'category'
        ];

        constructor(
            private selection: jat.service.Selection,
            private title: string,
            private event: TEvent,
            private tournamentLib: jat.service.TournamentLib,
            rank: Rank,
            category: Category
            ) {

            this.ranks = rank.list();
            this.categories = category.list();

            this.registred = tournamentLib.getRegistred(event);
        }
    }

    angular.module('jat.event.dialog', [])
        .controller('dialogEventCtrl', dialogEventCtrl);
}