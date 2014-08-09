'use strict';
var jat;
(function (jat) {
    (function (_draw) {
        var dialogDrawCtrl = (function () {
            //getNbEntry(): number {
            //    return this.drawLib.countInCol(iColMax(draw), draw.nbOut);
            //}
            function dialogDrawCtrl(title, draw, //private selection: jat.service.Selection,
            rank, category, drawLib) {
                this.title = title;
                this.draw = draw;
                this.drawLib = drawLib;
                this.drawTypes = [];
                for (var i = 0; i < 4; i++) {
                    this.drawTypes[i] = { value: i, label: models.DrawType[i] };
                }

                this.ranks = rank.list();
                this.categories = category.list();
            }
            dialogDrawCtrl.prototype.getRegisteredCount = function () {
                var players = this.drawLib.GetJoueursInscrit(this.draw);
                return players.length;
            };
            return dialogDrawCtrl;
        })();

        angular.module('jat.draw.dialog', []).controller('dialogDrawCtrl', dialogDrawCtrl);
    })(jat.draw || (jat.draw = {}));
    var draw = jat.draw;
})(jat || (jat = {}));
//# sourceMappingURL=dialogDraw.js.map
