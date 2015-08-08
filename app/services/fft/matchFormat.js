var jat;
(function (jat) {
    var fft;
    (function (fft) {
        var MatchFormat = (function () {
            function MatchFormat() {
                this._matchFormats = {
                    "A": { name: "A: traditionnel (3 sets à 6 jeux)" },
                    "B": { name: "B: traditionnel (3 sets à 6 jeux) - point décisif" },
                    "C": { name: "C: 3 sets à 4 jeux - jeu décisif à 4/4" },
                    "D": { name: "D: 3 sets à 4 jeux - jeu décisif à 4/4 - point décisif" },
                    "E": { name: "E: 3 sets à 3 jeux - jeu décisif à 2/2" },
                    "F": { name: "F: 3 sets à 3 jeux - jeu décisif à 2/2 - point décisif" },
                    "G": { name: "G: 3 jeux décisif" },
                    "H": { name: "H: 3 sets à 4 jeux - jeu décisif à 3/3 - point décisif" },
                    "I": { name: "I: 3 sets à 5 jeux - jeu décisif à 4/4 - point décisif" }
                };
            }
            MatchFormat.prototype.list = function () {
                return this._matchFormats;
            };
            return MatchFormat;
        })();
        fft.MatchFormat = MatchFormat;
        angular.module('jat.services.fft.matchFormat', [])
            .service('matchFormat', MatchFormat);
    })(fft = jat.fft || (jat.fft = {}));
})(jat || (jat = {}));
