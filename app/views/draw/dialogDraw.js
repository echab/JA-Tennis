'use strict';
var jat;
(function (jat) {
    var draw;
    (function (draw_1) {
        var dialogDrawCtrl = (function () {
            function dialogDrawCtrl(title, draw, 
                //private selection: jat.service.Selection,
                rank, category, drawLib, tournamentLib, $scope) {
                var _this = this;
                this.title = title;
                this.draw = draw;
                this.rank = rank;
                this.drawLib = drawLib;
                this.tournamentLib = tournamentLib;
                this.drawTypes = [];
                for (var i = 0; i < 4; i++) {
                    this.drawTypes[i] = { value: i, label: models.DrawType[i] };
                }
                this.ranks = rank.list();
                this.categories = category.list();
                //Force minRank <= maxRank
                $scope.$watch('dlg.draw.minRank', function (minRank) {
                    if (!_this.draw.maxRank || _this.rank.compare(minRank, _this.draw.maxRank) > 0) {
                        _this.draw.maxRank = minRank;
                    }
                });
                $scope.$watch('dlg.draw.maxRank', function (maxRank) {
                    if (maxRank && _this.draw.minRank && _this.rank.compare(_this.draw.minRank, maxRank) > 0) {
                        _this.draw.minRank = maxRank;
                    }
                });
            }
            dialogDrawCtrl.prototype.getRegisteredCount = function () {
                var n = this.tournamentLib.GetJoueursInscrit(this.draw).length;
                var previous = this.drawLib.previousGroup(this.draw);
                if (previous) {
                    var qualifs = this.drawLib.findAllPlayerOut(previous);
                    if (qualifs) {
                        n += qualifs.length;
                    }
                }
                return n;
            };
            //getNbEntry(): number {
            //    return this.drawLib.countInCol(iColMax(draw), draw.nbOut);
            //}
            dialogDrawCtrl.$inject = [
                'title',
                'draw',
                //'selection',
                'rank',
                'category',
                'drawLib',
                'tournamentLib',
                '$scope'];
            return dialogDrawCtrl;
        })();
        angular.module('jat.draw.dialog', [])
            .controller('dialogDrawCtrl', dialogDrawCtrl);
    })(draw = jat.draw || (jat.draw = {}));
})(jat || (jat = {}));
