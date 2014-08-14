'use strict';

// FFT type services

module jat.service {

    class Rank implements ServiceRank {

        private _group: { [groupName: string]: string } = {
            "4e série": "NC,40,30/5,30/4,30/3,30/2,30/1",
            "3e série": "30,15/5,15/4,15/3,15/2,15/1",
            "2e série": "15,5/6,4/6,3/6,2/6,1/6",
            "1e série": "0,-1/6,-2/6,-3/6,-4/6,-5/6",
            "promotion": "-15,-30"
        };

        private _groups = <string[]>[];
        private _groupOf: { [rank: string]: string } = {};
        private _ranks: string[] = [];
        private _index: { [rank: string]: number } = {};

        constructor() {
            var i: string;
            for (i in this._group) {
                this._groups.push(i);
                var g: string[] = this._group[i].split(",");
                this._ranks = this._ranks.concat(g);
                for (var j = g.length - 1; j >= 0; j--) {
                    this._groupOf[g[j]] = i;
                }
            }
            for (var j = this._ranks.length - 1; j >= 0; j--) {
                this._index[this._ranks[j]] = j;
            }
        }

        list() {
            return this._ranks;
        }

        isValid(rank: RankString): boolean {
            return this._index[<string>rank] >= 0;
        }

        isNC(rank: RankString): boolean {
            return rank === "NC";
        }

        next(rank: RankString): RankString {
            var i = this._index[<string>rank];
            return this._ranks[i + 1];
        }

        previous(rank: RankString): RankString {
            var i = this._index[<string>rank];
            return this._ranks[i - 1];
        }

        compare(rank1: RankString, rank2: RankString): number {
            var i = this._index[<string>rank1],
                j = this._index[<string>rank2];
            return i - j;
        }

        within(rank: RankString, rank1: RankString, rank2: RankString): boolean {
            return (!rank1 || this.compare(rank1, rank) <= 0)
                && (!rank2 || this.compare(rank, rank2) <= 0);
        }

        groups(): RankGroupString[] {
            return this._groups;
        }

        groupOf(rank: RankString): RankGroupString {
            return this._groupOf[<string>rank];
        }
    }

    //===========================================

    export class Category implements ServiceCategory {

        // http://www.fft.fr/sites/default/files/pdf/153-231_rs_nov2011.pdf

        private _category: { [name: string]: { ageMax?: number; ageMin?: number } } = {
            "-8ans": { ageMax: 8 },
            "-9ans": { ageMax: 9 },
            "-10ans": { ageMax: 10 },
            "-11ans": { ageMax: 11 },
            "-12ans": { ageMax: 12 },
            "-13ans": { ageMax: 13 },
            "-14ans": { ageMax: 14 },
            "-15ans": { ageMax: 15 },
            "-16ans": { ageMax: 16 },
            "-17ans": { ageMax: 17 },
            "-18ans": { ageMax: 18 },
            "Senior": { ageMin: 18, ageMax: 34 },
            "+35ans": { ageMin: 35 },
            "+45ans": { ageMin: 45 },
            "+55ans": { ageMin: 55 },
            "+65ans": { ageMin: 60 },
            "+70ans": { ageMin: 70 },
            "+75ans": { ageMin: 75 }
        };
        //private _beginOfTime = new Date(0);
        public currentYear: number; //public for Spec

        //    this.refDate = function( date) {
        //        refDate = date;
        //    }

        private _categories: string[] = [];
        private _index: { [category: string]: number } = {};

        constructor() {

            var now = new Date();
            var refDate = new Date(now.getFullYear(), 9, 1);    //1er Octobre
            this.currentYear = now.getFullYear() + (now > refDate ? 1 : 0);

            for (var c in this._category) {
                this._categories.push(c);
            }
            for (var i = this._categories.length - 1; i >= 0; i--) {
                this._index[this._categories[i]] = i;
            }
        }

        list(): CategoryString[] {
            return this._categories;
        }

        isValid(category: string): boolean {
            return this._index[category] >= 0;
        }

        compare(category1: string, category2: string): number {
            var i = this._index[category1],
                j = this._index[category2];
            return i - j;
        }

        getAge(date: Date): number {
            //var age = (new Date(refDate - date)).getFullYear() - _beginOfTime.getFullYear() -1;
            var age = this.currentYear - date.getFullYear();
            return age;
        }

        ofDate(date: Date): string {
            var age = this.getAge(date), i: string, prev: string;
            for (i in this._category) {
                var categ = this._category[i];

                if (categ.ageMax && categ.ageMax < age) {
                    continue;   //too old
                }
                if (categ.ageMin) {
                    if (categ.ageMin <= age) {
                        prev = i;
                        continue;
                    } else {
                        return prev;
                    }
                }
                return i;
            }
        }

        isCompatible(eventCategory: CategoryString, playerCategory: CategoryString): boolean {

            if (playerCategory || !eventCategory) {
                return true;
            }

            //TODO,2006/12/31: comparer l'age du joueur au 31 septembre avec la date de début de l'épreuve.

            var idxSenior = this._index['Senior'];
            var idxEvent = this._index[<string>eventCategory];

            //Epreuve senior
            if (idxEvent === idxSenior) {
                return true;
            }

            var catEvent = this._category[<string>eventCategory];
            var catPlayer = this._category[<string>playerCategory];

            if (idxEvent < idxSenior) {

                //Epreuve jeunes
                if (catPlayer.ageMax <= catEvent.ageMax) {
                    return true;
                }
            } else {

                //Epreuve vétérans
                if (catEvent.ageMin <= catPlayer.ageMin) {
                    return true;
                }
            }

            return false;

            //TODO? 2006/08/28	AgeMin() < playerCategory.AgeMin()	//vétéran

            //	return playerCategory.isVide() || isVide()
            //		(playerCategory.AgeMin() <= AgeMax() 
            //		&& AgeMin() <= playerCategory.AgeMax() );
        }
    }

    //===========================================

    class MatchFormat implements ServiceMatchFormat {

        private _matchFormats: { [code: string]: { name: string } } = {
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

        list(): { [code: string]: { name: string } } {
            return this._matchFormats;
        }
    }

    //===========================================

    class Score implements ServiceScore {

        private static reScore = /^(([0-9]{1,2}\/[0-9]{1,2})\s+){2,5}(Ab )?$/;

        isValid(score: string): boolean {

            var a = Score.reScore.exec(score + " ");

            if (a === null) {
                return false;
            }

            //check score
            var sets = score.split(/\s+/);
            var nSet1 = 0, nSet2 = 0;
            for (var i = 0; i < sets.length; i++) {
                var games = sets[i].split("/");

                var j1 = parseInt(games[0]);
                var j2 = parseInt(games[1]);

                if (j1 > j2 && j1 >= 6) {
                    if (j1 >= 7 && j2 < 5) {
                        return false;
                    }
                    nSet1++;
                } else if (j2 > j1 && j2 >= 6) {
                    if (j2 >= 7 && j1 < 5) {
                        return false;
                    }
                    nSet2++;
                }

                //TODO check score
            }

            return true;
        }



    }

    var MAX_SET = 5;

    class ScoreFFT {
        m_Jeu: { j1: number; j2: number; }[];

        constructor(score: string, fm: string) {
            //TODO parse
            return;
        }

        public getnSet(): number {
            var i = 0;
            while (i < MAX_SET && (this.m_Jeu[i].j1 || this.m_Jeu[i].j2)) {
                i++;
            }
            return i - 1;
        }

        public deltaSet(bVainqueur: boolean /*, BOOL bEquipe */): number {
            throw "Not implemented";
            var n = 0;
            for (var i = 0; i < MAX_SET && (this.m_Jeu[i].j1 || this.m_Jeu[i].j2); i++) {
                n += (this.m_Jeu[i].j1 > this.m_Jeu[i].j2) ? 1 : this.m_Jeu[i].j1 < this.m_Jeu[i].j2 ? -1 : 0;
            }
            var dSet: number;

            //        if (isWO())
            //            return bVainqueur ? 3 : -3;	//dSet2
            //        if (isAbandon()) {

            //	//Calcul différence de set et de jeu abandon poule

            //	int nSetGagne = ((const CFormatMatch&)fm).isCinqSets() ? 3 : 2;
            //	int nJeuGagne = ((const CFormatMatch&)fm).nbJeuxParSet();	//((const CFormatMatch&)fm).isSetQuatreJeux() ? 4 : 6;
            //	int nSetV = 0, nSetD = 0;
            //	CScore score = *this;	//m_pBoite[ b]->m_Score;
            //            score.Abandon = FALSE;

            //	//Passe les sets joués
            //	var set;
            //            for (set = 0; set < MAX_SET; set++) {

            //		if( ((const CFormatMatch&)fm).isJeuDecisifDernierSet()
            //                && (set + 1 == (nSetGagne << 1) - 1)) {
            //                    //Dernier set en jeu décisif
            //                    if (!((score.this.m_Jeu[set].j1 >= 7
            //                        || score.this.m_Jeu[set].j2 >= 7)
            //                        && abs(score.this.m_Jeu[set].j1 - score.this.m_Jeu[set].j2) >= 2)) {

            //                        score.this.m_Jeu[set].j1 = score.this.m_Jeu[set].j2 = 0;
            //                        break;
            //                    }

            //		} else {
            //                    //Set normal
            //                    if (!((score.this.m_Jeu[set].j1 >= nJeuGagne
            //                        || score.this.m_Jeu[set].j2 >= nJeuGagne)
            //                        && abs(score.this.m_Jeu[set].j1 - score.this.m_Jeu[set].j2) >= 2)
            //                        && !(score.this.m_Jeu[set].j1 >= nJeuGagne
            //                        && score.this.m_Jeu[set].j2 >= nJeuGagne
            //                        && abs(score.this.m_Jeu[set].j1 - score.this.m_Jeu[set].j2) == 1)
            //                        )
            //                        break;	//6/0, 6/1, 6/2, 6/3, 6/4, 7/5 ou 7/6 ou l'inverse
            //                }
            //                if (score.this.m_Jeu[set].j1 > score.this.m_Jeu[set].j2)
            //                    nSetV++;
            //                else
            //                    nSetD++;

            //                if ((nSetGagne <= nSetV && nSetD < nSetV) || (nSetGagne <= nSetD && nSetV < nSetD)) {	//Victoire acquise
            //                    //ASSERT( FALSE);	//TODO
            //                    //pDoc->Erreur( IDS_ERR_SCORE_BAD, -1, e, pDoc->FindTableau( this), b);
            //                    break;
            //                }
            //            }

            //            for (; !(nSetGagne <= nSetV && nSetD < nSetV) && set < MAX_SET; set++) {	//Pas victoire acquise

            //		if( ((const CFormatMatch&)fm).isJeuDecisifDernierSet()
            //                && (set + 1 == (nSetGagne << 1) - 1)) {
            //                    //Dernier set en jeu décisif
            //                    ;	//Ne compte pas de jeu

            //		} else {
            //                    score.this.m_Jeu[set].j1 = nJeuGagne;
            //                    if (score.this.m_Jeu[set].j2 == nJeuGagne || score.this.m_Jeu[set].j2 + 1 == nJeuGagne)	//7/5, ou 7/6
            //                        score.this.m_Jeu[set].j1++;
            //                }
            //                nSetV++;
            //            }

            //            dSet = score.deltaSet(bVainqueur, fm /*, bEquipe */);

            //        } else {
            //            dSet = (bVainqueur ? n : -n) << 1;

            //            if (!isVide() && !dSet && !deltaJeu(bVainqueur, fm /*, bEquipe */))
            //                return 0;	//Match nul //TODO Poule
            //        }

            return dSet;
        }

        public deltaJeu(bVainqueur: boolean /*, BOOL bEquipe */): number {
            throw "Not implemented";

            var n = 0;
            for (var i = 0; i < MAX_SET && (this.m_Jeu[i].j1 || this.m_Jeu[i].j2); i++) {
                n += (this.m_Jeu[i].j1 - this.m_Jeu[i].j2);
            }

            var dJeu: number;

            //    if (isWO())
            //        return bVainqueur ? 5 : -5;
            //    if (isAbandon()) {

            ////Calcul différence de set et de jeu abandon poule

            //int nSetGagne = ((const CFormatMatch&)fm).isCinqSets() ? 3 : 2;
            //int nJeuGagne = ((const CFormatMatch&)fm).nbJeuxParSet();	//((const CFormatMatch&)fm).isSetQuatreJeux() ? 4 : 6;
            //int nSetV = 0, nSetD = 0;
            //CScore score = *this;	//m_pBoite[ b]->m_Score;
            //        score.Abandon = FALSE;

            ////Passe les sets joués
            //int set;
            //        for (set = 0; set < MAX_SET; set++) {

            //	if( ((const CFormatMatch&)fm).isJeuDecisifDernierSet()
            //            && (set + 1 == (nSetGagne << 1) - 1)) {
            //                //Dernier set en jeu décisif
            //                if (!((score.this.m_Jeu[set].j1 >= 7
            //                    || score.this.m_Jeu[set].j2 >= 7)
            //                    && abs(score.this.m_Jeu[set].j1 - score.this.m_Jeu[set].j2) >= 2)) {

            //                    score.this.m_Jeu[set].j1 = score.this.m_Jeu[set].j2 = 0;
            //                    break;
            //                }

            //	} else {
            //                //Set normal
            //                if (!((score.this.m_Jeu[set].j1 >= nJeuGagne
            //                    || score.this.m_Jeu[set].j2 >= nJeuGagne)
            //                    && abs(score.this.m_Jeu[set].j1 - score.this.m_Jeu[set].j2) >= 2)
            //                    && !(score.this.m_Jeu[set].j1 >= nJeuGagne
            //                    && score.this.m_Jeu[set].j2 >= nJeuGagne
            //                    && abs(score.this.m_Jeu[set].j1 - score.this.m_Jeu[set].j2) == 1)
            //                    )
            //                    break;	//6/0, 6/1, 6/2, 6/3, 6/4, 7/5 ou 7/6 ou l'inverse
            //            }
            //            if (score.this.m_Jeu[set].j1 > score.this.m_Jeu[set].j2)
            //                nSetV++;
            //            else
            //                nSetD++;

            //            if ((nSetGagne <= nSetV && nSetD < nSetV) || (nSetGagne <= nSetD && nSetV < nSetD)) {	//Victoire acquise
            //                //ASSERT( FALSE);	//TODO
            //                //pDoc->Erreur( IDS_ERR_SCORE_BAD, -1, e, pDoc->FindTableau( this), b);
            //                break;
            //            }
            //        }

            //        for (; !(nSetGagne <= nSetV && nSetD < nSetV) && set < MAX_SET; set++) {	//Pas victoire acquise

            //	if( ((const CFormatMatch&)fm).isJeuDecisifDernierSet()
            //            && (set + 1 == (nSetGagne << 1) - 1)) {
            //                //Dernier set en jeu décisif
            //                ;	//Ne compte pas de jeu

            //	} else {
            //                score.this.m_Jeu[set].j1 = nJeuGagne;
            //                if (score.this.m_Jeu[set].j2 == nJeuGagne || score.this.m_Jeu[set].j2 + 1 == nJeuGagne)	//7/5, ou 7/6
            //                    score.this.m_Jeu[set].j1++;
            //            }
            //            nSetV++;
            //        }

            //        dJeu = score.deltaJeu(bVainqueur, fm /*, bEquipe */);

            //    } else {
            //        dJeu = bVainqueur ? n : -n;

            //        if (!isVide() && !deltaSet(bVainqueur, fm /*, bEquipe */) && !dJeu)
            //            return 0;		//Match nul //TODO Poule
            //    }
            return dJeu;
        }

        public deltaPoint(bVainqueur: boolean /*, BOOL bEquipe */): number {
            throw "Not implemented";

            var n = 0;
            for (var i = 0; i < MAX_SET && (this.m_Jeu[i].j1 || this.m_Jeu[i].j2); i++) {
                n += (this.m_Jeu[i].j1 - this.m_Jeu[i].j2);
            }

            var dSet: number, dJeu: number;

            //    if (isWO())
            //        return bVainqueur ? 2 : 0;
            //    else
            //        if (isAbandon())
            //            return bVainqueur ? 2 : 1;
            //        else {

            //            dSet = deltaSet(bVainqueur, fm /*, bEquipe */);
            //            dJeu = deltaJeu(bVainqueur, fm /*, bEquipe */);

            //            if (isVide() || dSet || dJeu)
            //                return bVainqueur ? 2 : 1;		//Résultat normal
            //            else
            //                return 0;	//Match nul //TODO Poule
            //        }

            return n;
        }
    }

    //===========================================

    class Licence implements ServiceLicence {

        private static reLicence = /^([0-9]{7})([A-HJ-NPR-Z])$/;
        private static keys = "ABCDEFGHJKLMNPRSTUVWXYZ";

        isValid(licence: string): boolean {

            var a = Licence.reLicence.exec(licence + " ");

            if (a === null) {
                return false;
            }

            //check licence key
            var v = parseInt(a[1]);
            var k = Licence.keys.charAt(v % 23);

            return k == a[2];
        }
    }

    //===========================================

    class Ranking implements ServiceRanking {

        private _serviceScore: Score;

        constructor(
            score: ServiceScore) {
            this._serviceScore = <Score> score;
        }

        private _champs = [
            "Points:",
            "Différence de Sets:",
            "Différence de Jeux:"
        ];

        private Points: number = 0;
        private dPoint: number;
        private dSet2: number;
        private dJeu: number;

        //- le nombre de sets des matchs (3 ou 5)
        //art52               |  Points  |   Sets   |   Jeux   |
        //- Vainqueur         |    +2    |Différence|Différence|
        //- Battu             |    +1    |Différence|Différence|
        //- Vainqueur abandon |    +2    |          |          |
        //- Battu abandon     |    +1    |          |          |
        //- Vainqueur WO      |    +2    |   +1,5   |    +5    |
        //- Battu WO          |     0    |   -1,5   |    -5    |
        //- Match nul         |     0    |          |          |
        public Empty(): void {
            this.Points = 0;
        }

        public isVide(): boolean {
            return this.Points === 0;
        }

        public NomChamp(iChamp: number): string {
            return this._champs[iChamp];
        }

        public ValeurChamp(iChamp: number): string {
            switch (iChamp) {
                case 0: return this.dPoint.toString();
                case 1: return Math.floor(this.dSet2 / 2).toString();
                case 2: return this.dJeu.toString();
            }
        }

        public AddResultat(bVictoire: number, score: string, fm: string): boolean {	//-1=défaite, 0=nul, 1=victoire
            //bVictoire: -1=défaite, 0=nul, 1=victoire

            var sc = new ScoreFFT(score, fm);

            //Compte la différence de Set
            this.dPoint += sc.deltaPoint(bVictoire > 0);	//TODO bEquipe ???
            this.dSet2 += sc.deltaSet(bVictoire > 0);	//TODO bEquipe ???
            this.dJeu += sc.deltaJeu(bVictoire > 0);	//TODO bEquipe ???

            return true;
        }

        public Ordre(): number {
            return ((this.dPoint + 0x80) << 24) + ((this.dSet2 + 0x80) << 16) + (this.dJeu + 0x8000);
        }
    }

    //===========================================

    angular.module('jat.services.type', [])
        .service('rank', Rank)
        .service('category', Category)
        .service('matchFormat', MatchFormat)
        .service('score', Score)
        .service('licence', Licence)
        .service('ranking', Ranking)
    ;
}