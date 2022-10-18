import { DrawEditor } from '../drawEditor';
import { Find } from '../util/find';
import { Validation } from '../validation';
import { validation } from '../types';

export class DrawLibBaseOk {

    //TODO DrawLibBaseOk, dispatch into knockout and roundrobin
    
// 		SetDimensionOk( draw: Draw, oldDraw?: Draw, nJoueur?: number) :boolean {
// 		
// 			IBOITE	nBoiteNew;
// 		
// 			ASSERT( 0<=m_nBoite && m_nBoite<=MAX_BOITE);
// 			
// 			if( isTypePoule()) {
// 				if( nColNew) {
// 					nBoiteNew = iBoiteMax() - ( nColNew * (nColNew +1));
// 					if (nBoiteNew <0)
// 						nBoiteNew = 0;
// 				} else
// 					nBoiteNew = 0;
// 			} else {
// 				if( nColNew && nQualNew)
// 					nBoiteNew = iHautCol( iColMinQ( nQualNew) + nColNew -1) +1;	//iHautCol( nColNew + iCol( nQualNew -1) -1) +1;
// 				else
// 					nBoiteNew = 0;
// 			}
// 		
// 			ASSERT( 0<=nBoiteNew && nBoiteNew<=MAX_BOITE);
// 		
// 			return true;
// 		}
// 
// 		MetJoueurOk(box: Box, player: Player, bForce: boolean): boolean {	//MetJoueurOk
// 
// 			//ASSERT( iJoueur !== -1);
// 
// 			//	ASSERT( !(box.playerId !== iJoueur && !bForce));
// 			//	if( box.playerId !== iJoueur && !bForce)
// 			//		{
// 			//		TRACE("Tableau en mode résultat, impossible de programmer un joueur\n");
// 			//		return false;
// 			//		}
// 
// 			if (box.locked && box.playerId !== player.id) {
// 				validation.errorDraw('IDS_ERR_PROGAM_LOC', box._draw, box);
// 				return false;
// 			}
// 
// 			var boxIn = <PlayerIn>box;
// 			if (boxIn.qualifIn && !bForce) {
// 				validation.errorDraw('IDS_ERR_TAB_ENTRANT_LOC', box._draw, box);
// 				return false;
// 			}
// 
// 			if (box.hidden) {
// 				validation.errorDraw('IDS_ERR_TAB_ENTRANT_DEVANT', box._draw, box);
// 				return false;
// 			}
// 
// 			if (box.playerId !== player.id && box.playerId) {
// 				if (!this.EnleveJoueurOk(box, true))		//Enlève le joueur précédent
// 					return false;
// 			}
// 
// 			return true;
// 		}
// 
// 		//Résultat d'un match : met le gagnant (ou le requalifié) et le score dans la box
// 		SetResultatOk(box: Match, box: Match): boolean {
// 
// 			ASSERT(!box.hidden);
// 			var boxIn = <PlayerIn>box;
// 			ASSERT(!boxIn.qualifIn);
// 
// 			//Check changement de vainqueur ou enlève vainqueur et box lockée (match suivant déjà joué)
// 			if ((box.playerId !== box.playerId || box.playerId === -1) && box.locked) {
// 				validation.errorDraw('IDS_ERR_VAINQUEUR_LOC', box._draw, box);
// 				return false;
// 			}
// 
// 			//Check changement de vainqueur par vainqueur défaillant
// 			//	if( !isTypePoule())
// 			//	if( box.score.isVainqDef()) {
// 			//		if( box.playerId === m_pBoite[ ADVERSAIRE1(box)].playerId)
// 			//			box.playerId = m_pBoite[ ADVERSAIRE2(box)].playerId;
// 			//		else
// 			//			box.playerId = m_pBoite[ ADVERSAIRE1(box)].playerId;
// 			//	}
// 
// 			if (box.playerId !== -1) {
// 				if (box._draw.locked && isMatchJoue(box) && box.locked && box.playerId !== box.playerId) {	//Pas même joueur
// 					return false;
// 				}
// 				if (!this.MetJoueurOk(box, box.playerId)) {
// 					return false;
// 				}
// 			} else {
// 				if (!this.EnleveJoueurOk(box))
// 					return false;
// 			}
// 
// 			return true;
// 		}
// 
// 		//Planification d'un match : met le court, la date et l'heure
// 		MetCreneauOk(box: Match, boite: Match): boolean {    //MetCreneauOk
// 
// 			ASSERT(!box.hidden);
// 			var boxIn = <PlayerIn>box;
// 			ASSERT(!boxIn.qualifIn);
// 			ASSERT(isMatch(box));
// 			if (isTypePoule()) {
// 				if (!isMatch(box))
// 					return false;
// 			}
// 			ASSERT(ADVERSAIRE1(box) >= iBoiteMin());
// 			ASSERT(ADVERSAIRE2(box) >= iBoiteMin());
// 			ASSERT(ADVERSAIRE1(box) <= iBoiteMax());
// 			ASSERT(ADVERSAIRE2(box) <= iBoiteMax());
// 			ASSERT(-1 <= box.m_iCourt && box.m_iCourt <= MAX_COURT);
// 
// 			return true;
// 		}
// 
// 		EnleveCreneauOk(box: Match): boolean {  //EnleveCreneauOk
// 
// 			ASSERT(!box.hidden);
// 			ASSERT(!boxIn.qualifIn);
// 			ASSERT(ADVERSAIRE1(box) >= iBoiteMin());
// 			ASSERT(ADVERSAIRE2(box) >= iBoiteMin());
// 			ASSERT(ADVERSAIRE1(box) <= iBoiteMax());
// 			ASSERT(ADVERSAIRE2(box) <= iBoiteMax());
// 			ASSERT(isMatch(box));
// 
// 			return true;
// 		}
// 
// 		MetPointageOk(box: Box, boite: Box): boolean {   //MetPointageOk
// 
// 			ASSERT(!box.hidden);
// 			ASSERT(!boxIn.qualifIn);
// 			if (isTypePoule()) {
// 				if (!isMatch(box))
// 					return false;
// 			}
// 			ASSERT(ADVERSAIRE1(box) >= iBoiteMin());
// 			ASSERT(ADVERSAIRE2(box) >= iBoiteMin());
// 			ASSERT(ADVERSAIRE1(box) <= iBoiteMax());
// 			ASSERT(ADVERSAIRE2(box) <= iBoiteMax());
// 
// 			return true;
// 		}
// 
// 		//Déprogramme un joueur, enlève le gagnant d'un match ou (avec bForce) enlève un qualifié entrant
// 		EnleveJoueurOk(box: Box, bForce?: boolean): boolean {   //EnleveJoueurOk
// 
// 			if (!box.playerId && !box.score)
// 				return true;
// 
// 			//	ASSERT( bForce);
// 			//	if( !bForce)
// 			//		{
// 			//		TRACE("Tableau en mode résultat, impossible de déprogrammer un joueur\n");
// 			//		return false;
// 			//		}
// 		
// 			if (box.locked) {
// 				validation.errorDraw('IDS_ERR_DEPROGRAM_LOC', box._draw, box);
// 				return false;
// 			}
// 
// 			var boxIn = <PlayerIn>box;
// 			if (boxIn.qualifIn && !bForce) {
// 				validation.errorDraw('IDS_ERR_DEENTRANT_LOC', box._draw, box);
// 				return false;
// 			}
// 
// 			var next = drawLib.nextGroup(box._draw);
// 			var boxOut = <Match> box;
// 			var i: number;
// 			if ((i = boxOut.qualifOut) && next) {
// 				var boxIn = drawLib.groupFindPlayerIn(next, i);
// 				if (boxIn) {
// 					if (next.locked || !next.EnleveJoueurOk(i, true))
// 						return false;
// 				}
// 			}
// 
// 			return true;
// 		}
// 
// 		SetTeteSerieOk(box: Box, iTeteSerie: number): boolean {
// 			//	iTeteSerie=0 => enlève Tête de série
// 
// 			ASSERT(0 <= iTeteSerie && iTeteSerie <= MAX_TETESERIE);
// 
// 			if (box.hidden) {
// 				validation.errorDraw('IDS_ERR_TETESERIE_BAD', box._draw, box);
// 				return false;
// 			}
// 
// 			if (iTeteSerie) {
// 				//Tête de série pas déjà prise
// 				//ASSERT( (b = FindTeteSerie( iTeteSerie)) === -1 || b === box);
// 		
// 				if (isTypePoule()) {
// 					ASSERT(box >= iBasColQ(m_nColonne));
// 				} else {
// 					//Tête de série interdite dans la dernière colonne
// 					ASSERT(iCol(box) !== iColMin());
// 				}
// 
// 				//Un qualifié ne peut pas être Tête de série
// 				var boxIn = <PlayerIn>box;
// 				var boxOut = <Match> box;
// 				ASSERT(!(boxIn.qualifIn || boxOut.qualifOut));
// 			}
// 			else {
// 				ASSERT(box.isTeteSerie());
// 			}
// 
// 			return true;
// 		}
// 
// 		SetQualifieEntrantOk(box: PlayerIn, inNumber?: number, player?: Player): boolean { //SetQualifieEntrantOk
// 			// inNumber=0 => enlève qualifié
// 			var i: number;
// 
// 			ASSERT(inNumber >= 0);
// 
// 			if (box.hidden) {
// 				validation.errorDraw('IDS_ERR_ENTRANT_BAD', box._draw, box);
// 				return false;
// 			}
// 
// 			if (isTypePoule()) {
// 				ASSERT(iColPoule(box, m_nColonne) === m_nColonne);	//Colonne de gauche
// 			}
// 
// 			//Qualifié entrant interdit dans la dernière colonne
// 			ASSERT(iCol(box) !== iColMin());
// 
// 			//Qualifié entrant interdit dans le premier tableau
// 			//ASSERT( getPrecedent() || (inNumber && iJoueur !== -1));
// 
// 			if (inNumber) {	//Ajoute un qualifié entrant
// 		
// 				var draw = box._draw;
// 
// 				var boxOut = <Match> box;
// 				if (box.isTeteSerie() || boxOut.qualifOut) {
// 					validation.errorDraw('IDS_ERR_ENTRANT_TDS_S', box._draw, box);
// 					return false;
// 				}
// 
// 				var prev = drawLib.previousGroup(draw);
// 				if (!player && prev && prev.length && inNumber !== QEMPTY) {
// 					//Va chercher le joueur dans le tableau précédent
// 					var boxOut = drawLib.groupFindPlayerOut(prev, inNumber);
// 					if (!isObject(boxOut)) {
// 						validation.errorDraw('IDS_ERR_ENTRANT_MIS', box._draw, box);
// 						return false;
// 					}
// 					player = boxOut._player;
// 				}
// 
// 				if (boxIn.qualifIn)
// 					if (!this.SetQualifieEntrantOk(box))	//Enlève le précédent qualifié
// 						return false;
// 
// 				if (player) {
// 					if (box._draw.locked || !this.MetJoueurOk(box, boxOut.playerId, true))
// 						return false;
// 				}
// 
// 				//Qualifié entrant pas déjà pris
// 				//if( getPrecedent() && (FindQualifieEntrant( inNumber) === -1 || inNumber === boxIn.qualifIn)) {
// 				if (inNumber === QEMPTY ||
// 					!FindPlayerIn(draw, inNumber)) {
// 
// 					if (!isTypePoule()) {
// 						//Cache les boites de gauche
// 						//Cache les boites de gauche
// 						this.iBoiteDeGauche(box.position, draw, true, (box) => {
// 							if (box.playerId) {
// 								return false;
// 							}
// 						});
// 					}
// 				}
// 			} else {	// Enlève un qualifié entrant
// 		
// 				ASSERT(boxIn.qualifIn);
// 
// 				if (box._draw.locked || (drawLib.previousGroup(draw) && !this.EnleveJoueurOk(box, true))) {
// 					return false;
// 				}
// 			}
// 
// 			return true;
// 		}
// 
// 		SetQualifieSortantOk(box: Match, outNumber?: number): boolean {
// 			// outNumber=0 => enlève qualifié
// 
// 			ASSERT(outNumber >= 0);
// 
// 			if (box.hidden && !isTypePoule()) {
// 				validation.errorDraw('IDS_ERR_SORTANT_HIDE', box._draw, box);
// 				return false;
// 			}
// 
// 			if (isTypePoule()) {
// 				//que dans la diagonale pour une poule ?
// 				ASSERT(iDiagonale(box) === box);
// 			} else {
// 
// 				if (outNumber)	//Ajoute un qualifié sortant
// 				{
// 					//Qualifié sortant interdit dans la première colonne
// 					ASSERT(iCol(box) !== iColMax());
// 
// 					if (box.isTeteSerie() || boxIn.qualifIn) {
// 						validation.errorDraw('IDS_ERR_SORTANT_TDS_E', box._draw, box);
// 						return false;
// 					}
// 			
// 					//Qualifié sortant pas déjà pris
// 					var group = drawLib.group(draw);
// 					ASSERT((i = getDebut().FindQualifieSortant(outNumber, &pSuite)) < 0 || (i === box && pSuite === this));
// 					//		if( FindQualifieSortant( outNumber) < 0)
// 					//			{
// 					//			TRACE("Qualifié sortant déjà placé\n");
// 					//			return false;
// 					//			}
// 			
// 					//Met à jour le tableau suivant
// 					var next = drawLib.nextGroup(box._draw);
// 					if (next) {
// 						var boxOut = <Match> box;
// 						if (box.isJoueur() && boxOut.qualifOut) {
// 							if ((i = pSuite.FindQualifieEntrant(outNumber, &pSuite)) !== -1) {
// 								ASSERT(pSuite.m_pBoite[i].playerId === box.playerId);
// 								if (pSuite.locked || !pSuite.EnleveJoueurOk(i, true))
// 									return false;
// 							}
// 						}
// 						//#ifdef	_DEBUG
// 						else {	//Vérifie que le qualifié dans le tableau suivant est bien vide
// 							pSuite = getSuivant();
// 							if ((i = pSuite.FindQualifieEntrant(outNumber, &pSuite)) !== -1)
// 								ASSERT(!pSuite.m_pBoite[i].isJoueur());
// 						}
// 						//#endif	//_DEBUG			
// 					}
// 
// 					//Enlève le précédent n° de qualifié sortant
// 					var boxOut = <Match> box;
// 					if (boxOut.qualifOut)
// 						if (!this.SetQualifieSortantOk(box))	//Enlève le qualifié
// 							return false;
// 
// 					pSuite = getSuivant();
// 					if (pSuite && box.isJoueur()) {
// 						//Met à jour le tableau suivant
// 						if ((i = pSuite.FindQualifieEntrant(outNumber, &pSuite)) !== -1) {
// 							ASSERT(!pSuite.m_pBoite[i].isJoueur());
// 							if (pSuite.locked || !pSuite.MetJoueurOk(i, box.playerId, true))
// 								return false;
// 						}
// 					}
// 
// 				}
// 				else	//Enlève un qualifié sortant
// 				{
// 					var boxOut = <Match> box;
// 					ASSERT(boxOut.qualifOut);
// 
// 					pSuite = getSuivant();
// 					if (pSuite && pSuite.locked) {
// 						validation.errorDraw('IDS_ERR_DESORTANT_SUIV_LOC', box._draw, box);
// 						return false;
// 					}
// 
// 					if (box.locked) {
// 						validation.errorDraw('IDS_ERR_DESORTANT_LOC', box._draw, box);
// 						return false;
// 					}
// 
// 					if (pSuite && box.isJoueur()) {
// 						//Met à jour le tableau suivant
// 						if ((i = pSuite.FindQualifieEntrant(boxOut.qualifOut, &pSuite)) !== -1) {
// 							ASSERT(pSuite.m_pBoite[i].isJoueur());
// 							ASSERT(pSuite.m_pBoite[i].playerId === box.playerId);
// 							if (pSuite.locked || !pSuite.EnleveJoueurOk(i, true))
// 								return false;
// 						}
// 					}
// 				}
// 			}
// 
// 			return true;
// 		}
// 
// 		//Rempli une box proprement
// 		RempliBoiteOk(box: Box, source: Box): boolean {   //RempliBoiteOk
// 
// 			var boxIn = <PlayerIn>box;
// 
// 			if (boxIn.qualifIn
// 				&& boxIn.qualifIn !== boxIn.qualifIn) {
// 
// 				ASSERT(!box.score);
// 
// 				if (!this.SetQualifieEntrantOk(box))	//Enlève
// 					return false;
// 			} else {
// 
// 				//Vide la box écrasée
// 				if (box._draw.locked || !this.EnleveJoueurOk(box, true))	//enlève le joueur, le score
// 					return false;
// 
// 				if (isCreneau(box))
// 					if (!this.EnleveCreneauOk(box))
// 						return false;
// 			}
// 
// 			//Rempli avec les nouvelles valeurs
// 			if (boxIn.qualifIn) {
// 				if (!this.SetQualifieEntrantOk(box, boxIn.qualifIn, box.playerId))
// 					return false;
// 			} else {
// 				if (box.isJoueur())
// 					if (box._draw.locked || !this.MetJoueurOk(box, box.playerId, true))
// 						return false;
// 
// 				var boxOut = <Match> box;
// 				if (boxOut.qualifOut)
// 					if (!this.SetQualifieSortantOk(box, boxOut.qualifOut))
// 						return false;
// 
// 				if (!isTypePoule() && box.isTeteSerie())
// 					if (!this.SetTeteSerieOk(box, box.isTeteSerie()))
// 						return false;
// 
// 				if (isCreneau(box))
// 					//		if( ADVERSAIRE1( box) <= iBoiteMax()
// 					//		 && ADVERSAIRE2( box) <= iBoiteMax()
// 					//		 && (box.m_iCourt !== -1
// 					//		 || !box.m_Date.isVide() 
// 					//		 || !box.m_Heure.isVide()))
// 					if (!MetCreneauOk(box, box))
// 						return false;
// 			}
// 
// 			return true;
// 		}
// 
// 		DeplaceJoueurOk(box: Box, boiteSrc: Box, pBoite: Box): boolean {  //DeplaceJoueurOk
// 
// 			ASSERT(box !== boxSource);
// 
// 			if (!this.RempliBoiteOk(boxSource, pBoite))	//Vide la source
// 				return false;
// 
// 			if (!this.RempliBoiteOk(box, boxSource))
// 				return false;
// 
// 			return true;
// 		}
// 	
// function ASSERT(b: boolean, message?: string): void {
//     if (!b) {
//         debugger;
//         throw message || 'Assertion is false';
//     }
// }

}