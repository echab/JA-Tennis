'use strict';
var jat;
(function (jat) {
    var event;
    (function (event_1) {
        var dialogEventCtrl = (function () {
            function dialogEventCtrl(selection, title, event, tournamentLib, rank, category) {
                this.selection = selection;
                this.title = title;
                this.event = event;
                this.tournamentLib = tournamentLib;
                this.ranks = rank.list();
                this.categories = category.list();
                this.registred = tournamentLib.getRegistred(event);
            }
            dialogEventCtrl.$inject = [
                'selection',
                'title',
                'event',
                'tournamentLib',
                'rank',
                'category'
            ];
            return dialogEventCtrl;
        })();
        angular.module('jat.event.dialog', [])
            .controller('dialogEventCtrl', dialogEventCtrl);
    })(event = jat.event || (jat.event = {}));
})(jat || (jat = {}));
