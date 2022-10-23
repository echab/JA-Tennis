import { ValidationService } from '../validationService';
import { category, rank, score, validation } from '../types';
import { Draw, DrawType, Box, Match, PlayerIn } from '../../domain/draw';
import { Player } from '../../domain/player';
import { IValidation } from '../../domain/validation';
import { TEvent, Tournament } from '../../domain/tournament';
import { isMatch, isPlayerIn } from '../drawService';

export class RoundrobinValidation implements IValidation {

    constructor() {
        validation.addValidator(this);
    }

    /** @override */
    validatePlayer(player: Player): boolean {
        return true;
    }

    /** @override */
    validateDraw(tournament: Tournament, event: TEvent, draw: Draw, players: Player[]): boolean {
        let bRes = true;

        if (draw.type === DrawType.PouleSimple
            || draw.type === DrawType.PouleAR) {
                
            bRes = bRes && this.validatePoule(draw);

            bRes = bRes && this.validateMatches(draw);
        }


        return bRes;
    }

    validatePoule(draw: Draw): boolean {
        let bRes = true;

        //TODOjs
        ////Compte le nombre de Qs de la poule (et pas dans suite)
        //let e = 0;
        //for (let i = draw.nbColumn - 1; i >= 0; i--) {
        //    if (boxes[iDiagonale(i)].isQualifieSortant())
        //        e++;
        //}

        //for (i = draw.nbColumn - 1; i >= 0; i--) {
        //    j = ADVERSAIRE1(i);

        //    //comparer les Qs avec le classement de computeScore
        //    if (e) {
        //        if (boxes[j].m_iClassement
        //            && boxes[iDiagonale(j)].isQualifieSortant()) {

        //		if(boxes[j].m_iClassement > (char)e) {
        //                this.validation.errorDraw('IDS_ERR_POU_QSORTANT', draw, j);
        //                bRes = false;
        //            }
        //        }
        //    }
        //}

        //for (i = draw.nbColumn - 1; i >= 0; i--) {
        //    j = ADVERSAIRE1(i);

        //    //Poule complète, avec assez de joueurs
        //    if (boxes[j].playerId == -1
        //        && !boxes[j].isQualifieEntrant()) {

        //        this.validation.errorDraw('IDS_ERR_POU_JOUEUR_NO', draw, j);
        //        bRes = false;
        //        break;
        //    }
        //}

        //date des matches différentes pour un même joueur

        //TODO Poule, isValide

        return bRes;
    }

    validateMatches(draw: Draw): boolean {
        let bRes = true;

        //Match avec deux joueurs gagné par un des deux joueurs
        for (let i = 0; i < draw.boxes.length; i++) {
            const box = draw.boxes[i];
            const boxIn = isPlayerIn(box) ? box : undefined;
            const match = isMatch(box) ? box : undefined;

            //ASSERT(-1 <= box.playerId && box.playerId < pDoc.m_nJoueur);
            //Joueur inscrit au tableau ?

            //Rien sur les croix (sauf les qualifiés sortants)
            //ASSERT( !isTypePoule() || !boxes[ i].isCache() || boxes[ i].isVide() );

            if (box.playerId) {

                //TODOjs
                //if (i >= iBasColQ(m_nColonne)) {	//Colonne joueurs
                //} else {

                //    const box1 = draw.boxes[ADVERSAIRE1(i)];
                //    const box2 = draw.boxes[ADVERSAIRE2(i)];

                //    if (!box1.playerId || !box2.playerId) {
                //        this.validation.errorDraw('IDS_ERR_MATCH_JOUEUR_NO', draw, box);
                //        bRes = false;
                //    } else {
                //        if (box.playerId != box1.playerId && box.playerId != box2.playerId) {
                //            this.validation.errorDraw('IDS_ERR_VAINQUEUR_MIS', draw, box);
                //            bRes = false;
                //        }
                //    }
                //}
            }


        }

        return bRes;
    }
}
