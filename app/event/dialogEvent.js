'use strict';
var jat;
(function (jat) {
    (function (_event) {
        var dialogEventCtrl = (function () {
            function dialogEventCtrl(selection, title, event, tournamentLib, rank, category) {
                this.selection = selection;
                this.title = title;
                this.event = event;
                this.tournamentLib = tournamentLib;
                //console.log("Event controller: cntr");
                this.ranks = rank.list();
                this.categories = category.list();

                this.registred = tournamentLib.getRegistred(event);
            }
            return dialogEventCtrl;
        })();

        angular.module('jat.event.dialog', []).controller('dialogEventCtrl', dialogEventCtrl);
    })(jat.event || (jat.event = {}));
    var event = jat.event;
})(jat || (jat = {}));
//# sourceMappingURL=dialogEvent.js.map
