module jat.service {

    export class RoundrobinValidation implements IValidation {

        constructor(
            private validation: jat.service.Validation
            ) {
            validation.addValidator(this);
        }

        validatePlayer(player: models.Player): boolean {
            return true;
        }

        validateDraw(draw: models.Draw): boolean {
            var bRes = true;

            bRes = bRes && this.validatePoule(draw);

            bRes = bRes && this.validateMatches(draw);



            return bRes;
        }

        validatePoule(draw: models.Draw): boolean {
            var bRes = true;

            //TODOjs
            ////Compte le nombre de Qs de la poule (et pas dans suite)
            //var e = 0;
            //for (var i = draw.nbColumn - 1; i >= 0; i--) {
            //    if (boxes[iDiagonale(i)].isQualifieSortant())
            //        e++;
            //}

            //for (i = draw.nbColumn - 1; i >= 0; i--) {
            //    j = ADVERSAIRE1(i);

            //    //comparer les Qs avec le classement de CalculeScore
            //    if (e) {
            //        if (boxes[j].m_iClassement
            //            && boxes[iDiagonale(j)].isQualifieSortant()) {

			//		if(boxes[j].m_iClassement > (char)e) {
            //                this.validation.error('IDS_ERR_POU_QSORTANT', draw, j);
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

            //        this.validation.error('IDS_ERR_POU_JOUEUR_NO', draw, j);
            //        bRes = false;
            //        break;
            //    }
            //}

            //date des matches différentes pour un même joueur

            //TODO Poule, isValide

            return bRes;
        }

        validateMatches(draw: models.Draw): boolean {
            var bRes = true;

            //Match avec deux joueurs gagné par un des deux joueurs
            for (var i = 0; i < draw.boxes.length; i++) {
                var box = draw.boxes[i];
                var boxIn = !isMatch(box) ? <models.PlayerIn>box : undefined;
                var match = isMatch(box) ? <models.Match>box : undefined;

                //ASSERT(-1 <= box.playerId && box.playerId < pDoc.m_nJoueur);
                //Joueur inscrit au tableau ?

                //Rien sur les croix (sauf les qualifiés sortants)
                //ASSERT( !isTypePoule() || !boxes[ i].isCache() || boxes[ i].isVide() );

                if (box.playerId) {

                    //TODOjs
                    //if (i >= iBasColQ(m_nColonne)) {	//Colonne joueurs
                    //} else {

                    //    var box1 = draw.boxes[ADVERSAIRE1(i)];
                    //    var box2 = draw.boxes[ADVERSAIRE2(i)];

                    //    if (!box1.playerId || !box2.playerId) {
                    //        this.validation.error('IDS_ERR_MATCH_JOUEUR_NO', draw, box);
                    //        bRes = false;
                    //    } else {
                    //        if (box.playerId != box1.playerId && box.playerId != box2.playerId) {
                    //            this.validation.error('IDS_ERR_VAINQUEUR_MIS', draw, box);
                    //            bRes = false;
                    //        }
                    //    }
                    //}
                }


            }

            return bRes;
        }
    }

    function isMatch(box: models.Box): boolean {
        return 'score' in box;
    }

    angular.module('jat.services.validation.roundrobin', ['jat.services.validation'])
        .factory('roundrobinValidation', (validation: jat.service.Validation) => {
            return new RoundrobinValidation(validation);
        });
}  