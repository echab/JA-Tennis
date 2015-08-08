var jat;
(function (jat) {
    var fft;
    (function (fft) {
        var Rank = (function () {
            function Rank() {
                this._group = {
                    "4e série": "NC,40,30/5,30/4,30/3,30/2,30/1",
                    "3e série": "30,15/5,15/4,15/3,15/2,15/1",
                    "2e série": "15,5/6,4/6,3/6,2/6,1/6",
                    "1e série": "0,-1/6,-2/6,-3/6,-4/6,-5/6",
                    "promotion": "-15,-30"
                };
                this._groups = [];
                this._groupOf = {};
                this._ranks = [];
                this._index = {};
                var i;
                for (i in this._group) {
                    this._groups.push(i);
                    var g = this._group[i].split(",");
                    this._ranks = this._ranks.concat(g);
                    for (var j = g.length - 1; j >= 0; j--) {
                        this._groupOf[g[j]] = i;
                    }
                }
                for (var j = this._ranks.length - 1; j >= 0; j--) {
                    this._index[this._ranks[j]] = j;
                }
            }
            Rank.prototype.list = function () {
                return this._ranks;
            };
            Rank.prototype.isValid = function (rank) {
                return this._index[rank] >= 0;
            };
            Rank.prototype.isNC = function (rank) {
                return rank === "NC";
            };
            Rank.prototype.next = function (rank) {
                var i = this._index[rank];
                return this._ranks[i + 1];
            };
            Rank.prototype.previous = function (rank) {
                var i = this._index[rank];
                return this._ranks[i - 1];
            };
            Rank.prototype.compare = function (rank1, rank2) {
                var i = this._index[rank1], j = this._index[rank2];
                return i - j;
            };
            Rank.prototype.within = function (rank, rank1, rank2) {
                return (!rank1 || this.compare(rank1, rank) <= 0)
                    && (!rank2 || this.compare(rank, rank2) <= 0);
            };
            Rank.prototype.groups = function () {
                return this._groups;
            };
            Rank.prototype.groupOf = function (rank) {
                return this._groupOf[rank];
            };
            return Rank;
        })();
        fft.Rank = Rank;
        angular.module('jat.services.fft.rank', [])
            .service('rank', Rank);
    })(fft = jat.fft || (jat.fft = {}));
})(jat || (jat = {}));
