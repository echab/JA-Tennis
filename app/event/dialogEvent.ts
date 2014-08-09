'use strict';
module jat.event {

    class dialogEventCtrl {

        ranks: RankString[];
        categories: CategoryString[];
        registred: models.Player[];

        constructor(
            private selection: jat.service.Selection,
            private title: string,
            private event: models.Event,
            private tournamentLib: jat.service.TournamentLib,
            rank: ServiceRank,
            category: ServiceCategory
            ) {

            //console.log("Event controller: cntr");

            this.ranks = rank.list();
            this.categories = category.list();

            this.registred = tournamentLib.getRegistred(event);
        }
    }

    angular.module('jat.event.dialog', [])
        .controller('dialogEventCtrl', dialogEventCtrl);
}