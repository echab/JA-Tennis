export class ScoreFFT implements Score {

    private static reScore = /^(([0-9]{1,2}\/[0-9]{1,2})\s+){2,5}(Ab )?$/;

    isValid(score: string): boolean {

        var a = ScoreFFT.reScore.exec(score + " ");

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

export class ScoreDeltaFFT {
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
        // var n = 0;
        // for (var i = 0; i < MAX_SET && (this.m_Jeu[i].j1 || this.m_Jeu[i].j2); i++) {
        //     n += (this.m_Jeu[i].j1 > this.m_Jeu[i].j2) ? 1 : this.m_Jeu[i].j1 < this.m_Jeu[i].j2 ? -1 : 0;
        // }
        // var dSet: number;

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

        // return dSet;
    }

    public deltaJeu(bVainqueur: boolean /*, BOOL bEquipe */): number {
        throw "Not implemented";

        // var n = 0;
        // for (var i = 0; i < MAX_SET && (this.m_Jeu[i].j1 || this.m_Jeu[i].j2); i++) {
        //     n += (this.m_Jeu[i].j1 - this.m_Jeu[i].j2);
        // }

        // var dJeu: number;

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
        // return dJeu;
    }

    public deltaPoint(bVainqueur: boolean /*, BOOL bEquipe */): number {
        throw "Not implemented";

        // var n = 0;
        // for (var i = 0; i < MAX_SET && (this.m_Jeu[i].j1 || this.m_Jeu[i].j2); i++) {
        //     n += (this.m_Jeu[i].j1 - this.m_Jeu[i].j2);
        // }

        // var dSet: number, dJeu: number;

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

        // return n;
    }
}