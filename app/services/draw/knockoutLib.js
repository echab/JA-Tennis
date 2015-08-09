var jat;
(function (jat) {
    var service;
    (function (service) {
        var KnockoutLib = (function () {
            function KnockoutLib() {
            }
            KnockoutLib.prototype.column = function (pos) {
                //TODO, use a table
                var col = -1;
                for (pos++; pos; pos >>= 1, col++) { }
                return col;
            };
            KnockoutLib.prototype.columnMin = function (nQ) {
                return !nQ || nQ === 1
                    ? 0
                    : this.column(nQ - 2) + 1;
            };
            KnockoutLib.prototype.columnMax = function (nCol, nQ) {
                return !nQ || nQ === 1
                    ? nCol - 1
                    : this.column(nQ - 2) + nCol;
            };
            KnockoutLib.prototype.positionTopCol = function (col) {
                return (1 << (col + 1)) - 2;
            };
            KnockoutLib.prototype.positionBottomCol = function (col, nQ) {
                return !nQ || nQ === 1
                    ? (1 << col) - 1 //iBasCol
                    : (this.positionTopCol(col) - this.countInCol(col, nQ) + 1);
            };
            KnockoutLib.prototype.countInCol = function (col, nQ) {
                return !nQ || nQ === 1
                    ? (1 << col) //countInCol
                    : nQ * this.countInCol(col - this.columnMin(nQ), 1);
            };
            KnockoutLib.prototype.positionMin = function (nQ) {
                return !nQ || nQ === 1
                    ? 0
                    : this.positionBottomCol(this.columnMin(nQ), nQ);
            };
            KnockoutLib.prototype.positionMax = function (nCol, nQ) {
                return !nQ || nQ === 1
                    ? (1 << nCol) - 2 //iHautCol
                    : this.positionTopCol(this.columnMax(nCol, nQ));
            };
            KnockoutLib.prototype.positionMatch = function (pos) {
                return (pos - 1) >> 1;
            };
            KnockoutLib.prototype.positionOpponent = function (pos) {
                return pos & 1 ? pos + 1 : pos - 1;
            };
            KnockoutLib.prototype.positionOpponent1 = function (pos) {
                return (pos << 1) + 2;
            };
            KnockoutLib.prototype.positionOpponent2 = function (pos) {
                return (pos << 1) + 1;
            };
            KnockoutLib.prototype.positionOpponents = function (pos) {
                return {
                    pos1: (pos << 1) + 2,
                    pos2: (pos << 1) + 1
                };
            };
            return KnockoutLib;
        })();
        service.KnockoutLib = KnockoutLib;
        angular.module('jat.services.knockoutLib', [])
            .factory('knockoutLib', [
            function () {
                return new KnockoutLib();
            }
        ]);
    })(service = jat.service || (jat.service = {}));
})(jat || (jat = {}));
