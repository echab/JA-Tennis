'use strict';
module jat.tournament {

    class dialogInfoCtrl {

        static $inject = [
            'title',
            'info'
        ];
        constructor(
            private title: string,
            private info: TournamentInfo
            ) {

        }
    }

    angular.module('jat.tournament.dialog', [])
        .controller('dialogInfoCtrl', dialogInfoCtrl);
}