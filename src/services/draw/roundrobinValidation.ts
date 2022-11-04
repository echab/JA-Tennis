import { Draw, DrawType, Box, Match, PlayerIn } from '../../domain/draw';
import type { Player } from '../../domain/player';
import type { TEvent, Tournament } from '../../domain/tournament';
import { DrawProblem } from '../../domain/validation';
import { isMatch, isPlayerIn } from '../drawService';

function validateDraw(tournament: Tournament, event: TEvent, draw: Draw): DrawProblem[] {
    const result: DrawProblem[] = [];

    if (draw.type === DrawType.Roundrobin
        || draw.type === DrawType.RoundrobinReturn) {

        result.splice(-1,0,...validatePoule(draw));

        result.splice(-1,0,...validateMatches(draw));
    }


    return result;
}

function validatePoule(draw: Draw): DrawProblem[] {
    const result: DrawProblem[] = [];

    //TODOjs
    ////Compte le nombre de Qs de la poule (et pas dans cont)
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
    //                result.push({message:'ERR_POU_QSORTANT', draw, box:boxes[j]});
    //            }
    //        }
    //    }
    //}

    //for (i = draw.nbColumn - 1; i >= 0; i--) {
    //    j = ADVERSAIRE1(i);

    //    //Poule complète, avec assez de joueurs
    //    if (boxes[j].playerId === -1
    //        && !boxes[j].isQualifieEntrant()) {

    //        result.push({message:'ERR_POU_JOUEUR_NO', draw, box:boxes[j]});
    //        break;
    //    }
    //}

    //date des matches différentes pour un même joueur

    //TODO Poule, isValide

    return result;
}

function validateMatches(draw: Draw): DrawProblem[] {
    const result: DrawProblem[] = [];

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
            //        result.push({message:'ERR_MATCH_JOUEUR_NO', draw, box});
            //    } else {
            //        if (box.playerId !== box1.playerId && box.playerId !== box2.playerId) {
            //            result.push({message:'ERR_VAINQUEUR_MIS', draw, box});
            //        }
            //    }
            //}
        }


    }

    return result;
}

export const roundrobinValidation = { validateDraw };
