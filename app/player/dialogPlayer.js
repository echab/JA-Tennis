'use strict';
var jat;
(function (jat) {
    var player;
    (function (player_1) {
        var dialogPlayerCtrl = (function () {
            function dialogPlayerCtrl(title, player, events, rank, category) {
                this.title = title;
                this.player = player;
                this.events = events;
                this.ranks = rank.list();
                this.categories = category.list();
            }
            dialogPlayerCtrl.$inject = [
                'title',
                'player',
                'events',
                'rank',
                'category'
            ];
            return dialogPlayerCtrl;
        })();
        player_1.dialogPlayerCtrl = dialogPlayerCtrl;
        angular.module('jat.player.dialog', ['jat.utils.checkList'])
            .controller('dialogPlayerCtrl', dialogPlayerCtrl);
    })(player = jat.player || (jat.player = {}));
})(jat || (jat = {}));
