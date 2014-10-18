'use strict';

// FFT validation services

module jat.service {

    export class FFTValidation implements IValidation {

        constructor(
            private validation: jat.service.Validation,
            private drawLib: jat.service.DrawLib,
            private knockout: jat.service.Knockout,
            private find: jat.service.Find
            ) {
            validation.addValidator(this);
        }

        validatePlayer(player: models.Player): boolean {
            var bRes = true;

            //if (player.sexe == 'F'
            //    && player.rank
            //    && !player.rank.Division()
            //    //&& ((CClassement( N50) <= player.rank) && (player.rank < CClassement( N35)))
            //    ) {
            //    this.validation.errorDraw('IDS_ERR_CLAST_1SERIE', player);
            //    bRes = false;
            //}

            return bRes;
        }

        validateDraw(draw: models.Draw): boolean {
            var bRes = true;

            var isTypePoule = draw.type >= 2;

            var pColClast: { [rank: string]: number } = {};

            var nqe = 0;

            //TODOjs
            for (var i = 0; i < draw.boxes.length; i++) {
                var box = draw.boxes[i];
                var boxIn = !isMatch(box) ? <models.PlayerIn>box : undefined;
                var match = isMatch(box) ? <models.Match>box : undefined;

                var player = box._player;


                //VERIFIE //1   //progression des classements
                //rank progress, no more than two ranks difference into a column
                if (player && !isTypePoule) {
                    var c = column(box.position);

                    var colRank = pColClast[player.rank];
                    if (!colRank) {
                        pColClast[player.rank] = c;
                    } else if (Math.abs(colRank - c) > 1) {
                        this.validation.errorDraw('IDS_ERR_CLAST_PROGR2', draw, box, player.rank);
                        bRes = false;
                    }
                }

                if (isTypePoule) {
                    //DONE 01/08/19 (00/12/20): Dans Poule, date des matches différentes pour un même joueur

                    ////TODOjs
                    ////VERIFIE //2
                    ////matches précédents de la colonne
                    //for (var j = iHautCol(iColPoule(i, m_nColonne)); j > i; j--) {

                    //    if (isMatch(j) && !boxes[j].m_Date.isVide()
                    //        && boxes[i].m_Date == boxes[j].m_Date) {
                    //        this.validation.errorDraw('IDS_ERR_POULE_DATE_MATCH', boxes[ADVERSAIRE2(i)].m_iJoueur, iEpreuve, iTableau, i);
                    //        bRes = false;
                    //        break;
                    //    }
                    //}
                    //if (j <= i) {
                    //    //matches précédents de la ligne
                    //    for (var j = ADVERSAIRE1(i) - GetnColonne(); j > i; j -= GetnColonne()) {

                    //        if (isMatch(j) && !boxes[j].m_Date.isVide()
                    //            && boxes[i].m_Date == boxes[j].m_Date) {
                    //            this.validation.errorDraw('IDS_ERR_POULE_DATE_MATCH', boxes[ADVERSAIRE1(i)].m_iJoueur, iEpreuve, iTableau, i);
                    //            bRes = false;
                    //            break;
                    //        }
                    //    }
                    //}
                }


                //VERIFIE	//3
                //DONE 00/03/04: CTableau, Deux qualifiés entrants se rencontrent

                if (!isTypePoule && match) {
                    var opponent = this.knockout.boxesOpponents(match);
                    if ((<models.PlayerIn> opponent.box1).qualifIn
                        && (<models.PlayerIn> opponent.box2).qualifIn) {
                        this.validation.errorDraw('IDS_ERR_ENTRANT_MATCH', draw, opponent.box1);
                        bRes = false;
                    }
                }

                //VERIFIE	//4

                if (boxIn && boxIn.qualifIn) {
                    nqe++;
                }

                if (isTypePoule && nqe > 1) {
                    this.validation.errorDraw('IDS_ERR_POULE_ENTRANT_OVR', draw, box);
                    bRes = false;
                }
            }

            if (draw.type === models.DrawType.Final) {

                //VERIFIE	//5
                var boxT = this.drawLib.FindTeteSerie(draw, 1);
                if (!boxT) {
                    var boxMax = this.find.by(draw.boxes, 'position', positionMax(draw.nbColumn, draw.nbOut));
                    this.validation.errorDraw('IDS_ERR_TAB_TETESERIE_FINAL_NO', draw, boxMax);
                    bRes = false;
                }
            }




            //******************SAME old code using lpfn******************
            //ST_EPREUVE epreuve;
            //ST_TABLEAU tableau;
            //ST_BOITE boite, boite1, boite2;
            //ST_JOUEUR joueur;
            //ST_SELECTION sel;
            //short e, t, b, b2, m;
            //short	nqe = 0;
            //short nTeteDeSerie = 0;
            //ICOL c;
            //IBOITE bMin;
            //IBOITE bMax;
            //ICOL colMax;
            //ICOL colMin;
            //CMapWordToPtr pColClast;

            //            memset( &sel, -1, sizeof(ST_SELECTION));
            //            sel.size = PosAfter(sel, nMessage);	//sizeof( ST_SELECTION);

            //            for (e = (iEpreuve != -1 ? iEpreuve : 0); e < 32; e++) {
            //                epreuve.size = sizeof(ST_EPREUVE);
            //                if (!glpfn.GetEpreuve(pDoc, e, &epreuve))
            //                    break;

            //                sel.iEpreuve = e;

            //                if (iEpreuve != -1 && iTableau == -1) {

            //			//Check seulement l'épreuve

            //	#ifdef _DEBUG
            ////				wsprintf( gszBuf, "FFT: VerifieEpreuve( \"%s\")", epreuve.Nom);
            ////				glpfn.AddMessage( pDoc, gszBuf, &sel);
            //	#endif //_DEBUG

            //		} else {

            //                    //Check les tableaux

            //                    for (t = (iTableau != -1 && iEpreuve != -1 ? iTableau : 0); t < 64; t++) {
            //                        tableau.size = sizeof(ST_TABLEAU);
            //                        if (!glpfn.GetTableau(pDoc, e, t, &tableau))
            //                            break;

            //                        sel.iTableau = t;

            //	#ifdef _DEBUG
            ////				wsprintf( gszBuf, "FFT: VerifieTableau( \"%s\", \"%s\")", epreuve.Nom, tableau.Nom);
            ////				glpfn.AddMessage( pDoc, gszBuf, &sel);
            //	#endif //_DEBUG

            //				if (tableau.Type == 1) {	//Tableau Final(bonus)

            //                            if (epreuve.Consolante) {
            //                                LOADSTRING(IDS_ERR_TAB_FINAL_CONSOLATION, gszBuf, sizeof(gszBuf));
            //                                glpfn.AddMessage(pDoc, gszBuf, &sel);
            //                                bRes = -1;
            //                            }
            //                        }


            //                        if (ISPOULE(tableau)) {	//Poule

            //	#ifdef WITH_POULE
            //					bMin = 0;
            //                            bMax = tableau.nColonne * (tableau.nColonne + 1) - 1;

            //                            nqe = 0;
            //                            for (b = bMax; b >= bMin; b--) {
            //                                if (!glpfn.GetBoite(pDoc, e, t, b, &boite))
            //                                    break;

            //                                sel.iBoite = b;

            //                                if (boite.QualifieEntrant)
            //                                    nqe++;

            //                                //DONE 01/08/19 (00/12/20): Dans Poule, date des matches différentes pour un même joueur

            //                                //Un match
            //                                //Match avec une date
            //                                //Poule
            //                                //2================
            //                                //matches précédents de la colonne
            //                                for (b2 = iHautColPoule(iColPoule(b, (ICOL) tableau.nColonne), (ICOL) tableau.nColonne); b2 > b; b2--) {

            //                                    if (!glpfn.GetBoite(pDoc, e, t, b2, &boite2))
            //                                        break;

            //                                    if (iColPoule(b2, (ICOL) tableau.nColonne) < tableau.nColonne	//isMatch( b2)
            //                                        && !boite2.bCache
            //                                        && * boite2.Date
            //                                        && !_strcmpi(boite.Date, boite2.Date)
            //                                        ) {
            //                                        if (glpfn.GetBoite(pDoc, e, t, ADVERSAIRE2_POULE(b, (ICOL) tableau.nColonne), &boite2))
            //                                            sel.iJoueur = boite2.idJoueur;
            //                                        LOADSTRING(IDS_ERR_POULE_DATE_MATCH, gszBuf, sizeof(gszBuf));
            //                                        glpfn.AddMessage(pDoc, gszBuf, &sel);
            //                                        sel.iJoueur = -1;
            //                                        bRes = -1;
            //                                        break;
            //                                    }
            //                                }
            //                                if (b2 <= b) {
            //                                    //matches précédents de la ligne
            //                                    for (b2 = ADVERSAIRE1_POULE(b, (ICOL) tableau.nColonne) - tableau.nColonne; b2 > b; b2 -= tableau.nColonne) {

            //                                        if (!glpfn.GetBoite(pDoc, e, t, b2, &boite2))
            //                                            break;

            //                                        if (iColPoule(b2, (ICOL) tableau.nColonne) < tableau.nColonne	//isMatch( b2)
            //                                            && !boite2.bCache
            //                                            && * boite2.Date
            //                                            && !_strcmpi(boite.Date, boite2.Date)
            //                                            ) {
            //                                            if (glpfn.GetBoite(pDoc, e, t, ADVERSAIRE1_POULE(b, (ICOL) tableau.nColonne), &boite2))
            //                                                sel.iJoueur = boite2.idJoueur;
            //                                            LOADSTRING(IDS_ERR_POULE_DATE_MATCH, gszBuf, sizeof(gszBuf));
            //                                            glpfn.AddMessage(pDoc, gszBuf, &sel);
            //                                            sel.iJoueur = -1;
            //                                            bRes = -1;
            //                                            break;
            //                                        }
            //                                    }
            //                                }
            //                            }
            //                            sel.iBoite = -1;

            //                            //Poule
            //                            //4================
            //                            if (nqe > 1) {
            //                                LOADSTRING(IDS_ERR_POULE_ENTRANT_OVR, gszBuf, sizeof(gszBuf));
            //                                glpfn.AddMessage(pDoc, gszBuf, &sel);
            //                                bRes = -1;
            //					}
            //	#endif //WITH_POULE

            //				}
            //                        else {	//Normal ou Final

            //                            bMin = iBoiteMinQ(tableau.nSortant);
            //                            bMax = iBoiteMaxQ((ICOL) tableau.nColonne, tableau.nSortant);
            //                            colMax = iColMaxQ((ICOL) tableau.nColonne, tableau.nSortant);
            //                            colMin = iColMinQ(tableau.nSortant);

            //                            //				const IObjectFactory* pFactOld = GET_APP.m_pFactA;
            //                            //				GET_APP.m_pFactA = m_pFactT;	//Utilisé par le constructeur de CClassement
            //                            CClassement * pClastMaxCol = new CClassement[colMax + 1];
            //                            pClastMaxCol[colMax].Start(); pClastMaxCol[colMax].Next();	//NC
            //                            //				GET_APP.m_pFactA = pFactOld;


            //                            //Match avec deux joueurs gagné par un des deux joueurs
            //                            for (b = bMax; b >= bMin; b--) {
            //                                if (!glpfn.GetBoite(pDoc, e, t, b, &boite))
            //                                    break;

            //                                if (boite.TeteDeSerie)
            //                                    nTeteDeSerie++;

            //                                //Un match
            //                                //3================
            //                                //DONE 00/03/04: CTableau, Deux qualifiés entrants se rencontrent

            //                                if (glpfn.GetBoite(pDoc, e, t, ADVERSAIRE1(b), &boite1)
            //                                    && glpfn.GetBoite(pDoc, e, t, ADVERSAIRE2(b), &boite2)) {

            //                                    if (boite1.QualifieEntrant
            //                                        && boite2.QualifieEntrant) {
            //                                        LOADSTRING(IDS_ERR_ENTRANT_MATCH, gszBuf, sizeof(gszBuf));
            //                                        sel.iBoite = ADVERSAIRE1(b);
            //                                        glpfn.AddMessage(pDoc, gszBuf, &sel);
            //                                        sel.iBoite = -1;
            //                                        bRes = -1;
            //                                    }

            //                                }

            //                                if (boite.idJoueur != -1) {	//un joueur
            //                                    if (!glpfn.GetJoueur(pDoc, boite.idJoueur, &joueur))
            //                                        break;

            //							CClassement clast; clast.Init(joueur.ClastSimpl, joueur.Sexe == 'F');

            //                                    c = iCol(b);
            //                                    if (b == iHautCol(c)) {
            //                                        if (c < colMax) {
            //                                            pClastMaxCol[c] = pClastMaxCol[c + 1];
            //                                            //					pClastMinCol[ c] = pClastMinCol[ c+1];
            //                                        }
            //                                    }

            //                                    //Un joueur nouveau avec un classement
            //                                    if (boite.iOrdre > 0
            //                                        && !clast.isVide()
            //                                    //	 && !joueur.Etranger
            //                                        ) {

            //                                        if (pClastMaxCol[c] < clast)
            //                                            pClastMaxCol[c] = clast;

            //                                        //1================
            //                                        m = clast.GetId();
            //								LPVOID cc;
            //                                        if (!pColClast.Lookup(m, cc))
            //                                            pColClast[m] = c;
            //								else if (abs( ((short)(long) cc) - c) > 1)
            //								{
            //                                            LOADSTRING(IDS_ERR_CLAST_PROGR2, gszBuf, sizeof(gszBuf));
            //                                            sel.iBoite = b;
            //                                            glpfn.AddMessage(pDoc, gszBuf, &sel);
            //                                            bRes = -1;
            //                                        }
            //                                    }
            //                                }
            //                            }

            //                            pColClast.RemoveAll();
            //                            delete []pClastMaxCol;


            //                            if (tableau.Type == 1) {	//Tableau Final(bonus)

            //                                //Tableau final
            //                                //5================
            //                                if (nTeteDeSerie == 0) {
            //                                    LOADSTRING(IDS_ERR_TAB_TETESERIE_FINAL_NO, gszBuf, sizeof(gszBuf));
            //                                    sel.iBoite = bMax;
            //                                    glpfn.AddMessage(pDoc, gszBuf, &sel);
            //                                    sel.iBoite = -1;
            //                                    bRes = -1;
            //                                }
            //                            }

            //                        }


            //                        if (iTableau != -1)
            //                            break;
            //                    }

            //                    if (iEpreuve != -1)
            //                        break;
            //                }
            //            }

            return bRes;


        }
    }

    function isMatch(box: models.Box): boolean {
        return 'score' in box;
    }

    function column(pos: number): number {    //iCol
        //TODO, use a table
        var col = -1;
        for (pos++; pos; pos >>= 1, col++) { }
        return col;
    }

    function columnMax(nCol: number, nQ?: number): number { //iColMaxQ
        return !nQ || nQ === 1
            ? nCol - 1
            : column(nQ - 2) + nCol;
    }

    function positionTopCol(col: number): number { // iHautCol
        return (1 << (col + 1)) - 2;
    }

    function positionMax(nCol: number, nQ?: number): number {   //iBoiteMaxQ
        return !nQ || nQ === 1
            ? (1 << nCol) - 2  //iHautCol
            : positionTopCol(columnMax(nCol, nQ));
    }

    angular.module('jat.services.validation.fft', ['jat.services.validation'])
        .factory('fftValidation', [
            'validation', 'drawLib', 'knockout', 'find',
            (validation: jat.service.Validation, drawLib: jat.service.DrawLib, knockout: jat.service.Knockout, find: jat.service.Find) => {
            return new FFTValidation(validation, drawLib, knockout, find);
        }]);

} 