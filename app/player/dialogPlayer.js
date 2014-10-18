'use strict';
var jat;
(function (jat) {
    (function (_player) {
        var dialogPlayerCtrl = (function () {
            function dialogPlayerCtrl(title, player, events, rank, category) {
                this.title = title;
                this.player = player;
                this.events = events;
                this.ranks = rank.list();
                this.categories = category.list();
            }
            return dialogPlayerCtrl;
        })();
        _player.dialogPlayerCtrl = dialogPlayerCtrl;

        angular.module('jat.player.dialog', ['jat.utils.checkList']).controller('dialogPlayerCtrl', [
            'title',
            'player',
            'events',
            'rank',
            'category',
            dialogPlayerCtrl]);
    })(jat.player || (jat.player = {}));
    var player = jat.player;
})(jat || (jat = {}));
//# sourceMappingURL=dialogPlayer.js.map
