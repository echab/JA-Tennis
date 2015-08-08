'use strict';
var jat;
(function (jat) {
    var tournament;
    (function (tournament) {
        var dialogInfoCtrl = (function () {
            function dialogInfoCtrl(title, info) {
                this.title = title;
                this.info = info;
            }
            dialogInfoCtrl.$inject = [
                'title',
                'info'
            ];
            return dialogInfoCtrl;
        })();
        angular.module('jat.tournament.dialog', [])
            .controller('dialogInfoCtrl', dialogInfoCtrl);
    })(tournament = jat.tournament || (jat.tournament = {}));
})(jat || (jat = {}));
