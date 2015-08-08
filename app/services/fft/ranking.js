var jat;
(function (jat) {
    var fft;
    (function (fft) {
        var Ranking = (function () {
            function Ranking(score) {
                this._champs = [
                    "Points:",
                    "Différence de Sets:",
                    "Différence de Jeux:"
                ];
                this.Points = 0;
                this._serviceScore = score;
            }
            //- le nombre de sets des matchs (3 ou 5)
            //art52               |  Points  |   Sets   |   Jeux   |
            //- Vainqueur         |    +2    |Différence|Différence|
            //- Battu             |    +1    |Différence|Différence|
            //- Vainqueur abandon |    +2    |          |          |
            //- Battu abandon     |    +1    |          |          |
            //- Vainqueur WO      |    +2    |   +1,5   |    +5    |
            //- Battu WO          |     0    |   -1,5   |    -5    |
            //- Match nul         |     0    |          |          |
            Ranking.prototype.Empty = function () {
                this.Points = 0;
            };
            Ranking.prototype.isVide = function () {
                return this.Points === 0;
            };
            Ranking.prototype.NomChamp = function (iChamp) {
                return this._champs[iChamp];
            };
            Ranking.prototype.ValeurChamp = function (iChamp) {
                switch (iChamp) {
                    case 0: return this.dPoint.toString();
                    case 1: return Math.floor(this.dSet2 / 2).toString();
                    case 2: return this.dJeu.toString();
                }
            };
            Ranking.prototype.AddResultat = function (bVictoire, score, fm) {
                //bVictoire: -1=défaite, 0=nul, 1=victoire
                var sc = new fft.ScoreFFT(score, fm);
                //Compte la différence de Set
                this.dPoint += sc.deltaPoint(bVictoire > 0); //TODO bEquipe ???
                this.dSet2 += sc.deltaSet(bVictoire > 0); //TODO bEquipe ???
                this.dJeu += sc.deltaJeu(bVictoire > 0); //TODO bEquipe ???
                return true;
            };
            Ranking.prototype.Ordre = function () {
                return ((this.dPoint + 0x80) << 24) + ((this.dSet2 + 0x80) << 16) + (this.dJeu + 0x8000);
            };
            return Ranking;
        })();
        fft.Ranking = Ranking;
        angular.module('jat.services.fft.ranking', [])
            .service('ranking', ['score', Ranking]);
    })(fft = jat.fft || (jat.fft = {}));
})(jat || (jat = {}));
