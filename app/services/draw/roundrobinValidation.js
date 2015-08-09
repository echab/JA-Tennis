var jat;
(function (jat) {
    var service;
    (function (service) {
        var RoundrobinValidation = (function () {
            function RoundrobinValidation(validation) {
                this.validation = validation;
                validation.addValidator(this);
            }
            RoundrobinValidation.prototype.validatePlayer = function (player) {
                return true;
            };
            RoundrobinValidation.prototype.validateDraw = function (draw) {
                var bRes = true;
                bRes = bRes && this.validatePoule(draw);
                bRes = bRes && this.validateMatches(draw);
                return bRes;
            };
            RoundrobinValidation.prototype.validatePoule = function (draw) {
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
            };
            RoundrobinValidation.prototype.validateMatches = function (draw) {
                var bRes = true;
                //Match avec deux joueurs gagné par un des deux joueurs
                for (var i = 0; i < draw.boxes.length; i++) {
                    var box = draw.boxes[i];
                    var boxIn = !isMatch(box) ? box : undefined;
                    var match = isMatch(box) ? box : undefined;
                    //ASSERT(-1 <= box.playerId && box.playerId < pDoc.m_nJoueur);
                    //Joueur inscrit au tableau ?
                    //Rien sur les croix (sauf les qualifiés sortants)
                    //ASSERT( !isTypePoule() || !boxes[ i].isCache() || boxes[ i].isVide() );
                    if (box.playerId) {
                    }
                }
                return bRes;
            };
            return RoundrobinValidation;
        })();
        service.RoundrobinValidation = RoundrobinValidation;
        function isMatch(box) {
            return 'score' in box;
        }
        angular.module('jat.services.validation.roundrobin', ['jat.services.validation'])
            .factory('roundrobinValidation', [
            'validation',
            function (validation) {
                return new RoundrobinValidation(validation);
            }]);
    })(service = jat.service || (jat.service = {}));
})(jat || (jat = {}));
