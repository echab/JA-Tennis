﻿import { Knockout } from './knockout';
import { KnockoutLib as k } from './knockoutLib';
import { DrawLib as drawLib } from './drawLib';
import { TournamentLib as tournamentLib } from '../tournamentLib';
import { Find } from '../util/Find';
import { Guid } from '../util/Guid';
import { isObject,isArray,extend } from '../util/object';
import { shuffle,filledArray } from '../../utils/tool';
import { Services } from '../services';
import { category, rank, score, validation } from '../types';

var MAX_TETESERIE = 32,
    MAX_QUALIF = 32,
    QEMPTY = - 1,
    MAX_MATCHJOUR = 16;

export class KnockoutValidation implements IValidation {

    private knockout: Knockout;

    constructor() {
        this.knockout = <Knockout>Services.drawLibFor(DrawType.Normal);
        validation.addValidator(this);
    }

    //Override
    validatePlayer(player: Player): boolean {
        return true;
    }

    validateGroup(draw: Draw): boolean {
        var bRes = true;

        if (draw.suite) {
            var iTableau = Find.indexOf(draw._event.draws, 'id', draw.id);
            if (iTableau === 0 || !draw._previous) {
                validation.errorDraw('IDS_ERR_TAB_SUITE_PREMIER', draw);
                bRes = false;
            }

            var group = drawLib.group(draw);
            if (group) {
                if (draw.type !== group[0].type) {
                    validation.errorDraw('IDS_ERR_TAB_SUITE_TYPE', draw);
                    bRes = false;
                }
                if (draw.minRank != group[0].minRank) {
                    validation.errorDraw('IDS_ERR_TAB_SUITE_MIN', draw);
                    bRes = false;
                }
                if (draw.maxRank != group[0].maxRank) {
                    validation.errorDraw('IDS_ERR_TAB_SUITE_MAX', draw);
                    bRes = false;
                }
            }
        }

        var prevGroup = drawLib.previousGroup(draw);
        if (prevGroup) {
            if (prevGroup[0].type !== DrawType.Final && draw.minRank && prevGroup[0].maxRank) {
                if (rank.compare(draw.minRank, prevGroup[0].maxRank) < 0) {
                    validation.errorDraw('IDS_ERR_TAB_CLASSMAX_OVR', draw);
                    bRes = false;
                }
            }
        }

        var nextGroup = drawLib.nextGroup(draw);
        if (nextGroup) {
            if (draw.type !== DrawType.Final && draw.maxRank && nextGroup[0].minRank) {
                if (rank.compare(nextGroup[0].minRank, draw.maxRank) < 0) {
                    validation.errorDraw('IDS_ERR_TAB_CLASSMAX_NEXT_OVR', draw);
                    bRes = false;
                }
            }
        }

        var e = MAX_QUALIF;
        if (!draw.suite) {
            //Trouve le plus grand Qsortant
            group =  group || drawLib.group(draw);
            for (e = MAX_QUALIF; e >= 1; e--) {
                if (drawLib.groupFindPlayerOut(group, e)) {
                    break;
                }
            }
            for (var e2 = 1; e2 <= e; e2++) {
                if (!drawLib.groupFindPlayerOut(group, e2)) {
                    validation.errorDraw('IDS_ERR_TAB_SORTANT_NO', draw, undefined, 'Q' + e2);
                    bRes = false;
                }
            }
        }

        return bRes;
    }

    validateMatches(draw: Draw): boolean {
        var bRes = true;


        return bRes;
    }

    //Override
    validateDraw(draw: Draw): boolean {
        var bRes = true;
        var nqe = 0;
        var nqs = 0;
        var tournament = draw._event._tournament;
        var isTypePoule = draw.type >= 2;
        var lib = Services.drawLibFor(draw);

        if (draw.type !== DrawType.Normal
            && draw.type !== DrawType.Final) {
            return true;
        }

        //Interdits:
        // - De faire rencontrer 2 Qualifiés entre eux
        // - D'avoir plus de Qualifiés que de joueurs admis directement
        // - De prévoir plus d'un tour d'écart entre deux joueurs de même classement
        // - De faire entrer un joueur plus loin qu'un joueur de classement supérieur au sien

        //Buts à atteindre:
        // Faire jouer chaque joueur
        // - Une première fois à classement inférieur
        // - Eventuellement à égalité de classement
        // - Ensuite à un classement supérieur au sien
        // - Ecart maximal souhaité DEUX échelons

        if (draw.minRank && draw.maxRank && rank.compare(draw.maxRank, draw.minRank) < 0) {
            validation.errorDraw('IDS_ERR_TAB_CLAST_INV', draw);
            bRes = false;
        }

        //DONE 00/05/10: CTableau contrôle progression des classements
        if (draw._event.maxRank && rank.compare(draw._event.maxRank, draw.maxRank) < 0) {
            validation.errorDraw('IDS_ERR_TAB_CLASSLIM_OVR', draw);
            bRes = false;
        }

        bRes = bRes && this.validateGroup(draw);

        bRes = bRes && this.validateMatches(draw);

        var colMax = k.columnMax(draw.nbColumn, draw.nbOut);
        var pClastMaxCol: RankString[] = new Array(colMax + 1);
        pClastMaxCol[colMax] = 'NC';    //pClastMaxCol[colMax].Start(); pClastMaxCol[colMax].Next();

        //Match avec deux joueurs gagné par un des deux joueurs
        for (var i = 0; i < draw.boxes.length; i++) {
            var box = draw.boxes[i];
            var boxIn = !isMatch(box) ? <PlayerIn>box : undefined;
            var match = isMatch(box) ? <Match>box : undefined;
            var b = box.position;

            //ASSERT(-1 <= box.playerId && box.playerId < tournament.players.length);
            //Joueur inscrit au tableau ?

            var c = k.column(b);
            if (b === k.positionTopCol(c)) {
                if (c < colMax) {
                    pClastMaxCol[c] = pClastMaxCol[c + 1];
                    //pClastMinCol[ c] = pClastMinCol[ c+1];
                }
            }

            if (boxIn
                && boxIn.order < 0
                && !boxIn.qualifIn
                && !box.hidden
                ) {
                validation.errorDraw('IDS_ERR_TAB_DUPLI', draw, boxIn);
                bRes = false;
            }

            var player = box._player;

            //if( boxes[ i].order >= 0 && player) 
            if (player && boxIn && this.knockout.isJoueurNouveau(boxIn) && !boxIn.qualifIn) {

                //DONE 00/03/07: Tableau, joueur sans classement
                //DONE 00/03/04: Tableau, Classement des joueurs correspond au limites du tableau
                if (!player.rank) {
                    validation.errorDraw('IDS_ERR_CLAST_NO', draw, boxIn);
                    bRes = false;
                } else {

                    //Players rank within draw min and max ranks
                    if (!rank.within(player.rank, draw.minRank, draw.maxRank)) {
                        validation.errorDraw('IDS_ERR_CLAST_MIS', draw, boxIn, player.rank);
                        bRes = false;
                    }

                    //DONE: 01/07/15 (00/05/11): CTableau, isValide revoir tests progression des classements
                    //if (!isTypePoule) {
                    if (pClastMaxCol[c] < player.rank) {
                        pClastMaxCol[c] = player.rank;
                    }

                    //if( player.rank < pClastMinCol[ c])
                    //	pClastMinCol[ c] = player.rank;

                    if (c < colMax
                        && pClastMaxCol[c + 1]
                        && rank.compare(player.rank, pClastMaxCol[c + 1]) < 0) {
                        validation.errorDraw('IDS_ERR_CLAST_PROGR', draw, boxIn, player.rank);
                        bRes = false;
                    }
                    //}

                }

                //Check inscriptions
                if (!tournamentLib.isSexeCompatible(draw._event, player.sexe)) {
                    validation.errorDraw('IDS_ERR_EPR_SEXE', draw, boxIn);

                } else if (!tournamentLib.isRegistred(draw._event, player)) {
                    validation.errorDraw('IDS_ERR_INSCR_NO', draw, boxIn);
                }

                //DONE 00/05/11: CTableau, check categorie
                //Check Categorie
                if (!category.isCompatible(draw._event.category, player.category)) {
                    validation.errorDraw('IDS_ERR_CATEG_MIS', draw, boxIn);
                }
            }

            //if (!isMatch(box) && match.score) {

            //    //DONE 01/07/13: CTableau, isValid score sans match
            //    validation.errorDraw('IDS_ERR_SCORE_MATCH_NO', draw, box);
            //    bRes = false;
            //}

            if (match) {

                //DONE 00/01/10: 2 joueurs du même club
                //DONE 00/03/03: Test de club identique même si le club est vide
                //TODO 00/07/27: Test de club identique avec des matches joués



                ASSERT(k.positionOpponent1(b) <= k.positionMax(draw.nbColumn, draw.nbOut));

                //TODO drawLib.boxesOpponents(match)
                var opponent = this.knockout.boxesOpponents(match);

                ASSERT(!!opponent.box1 && !!opponent.box2);

                if (!match.score) {

                    if (match.playerId) {
                        validation.errorDraw('IDS_ERR_VAINQ_SCORE_NO', draw, match, match._player.name);
                        bRes = false;
                    }

                } else {
                    ASSERT(b < k.positionBottomCol(draw.nbColumn, draw.nbOut)); //Pas de match colonne de gauche

                    if (!match.playerId) {
                        validation.errorDraw('IDS_ERR_SCORE_VAINQ_NO', draw, match);
                        bRes = false;
                    }

                    if (!score.isValid(match.score)) {
                        validation.errorDraw('IDS_ERR_SCORE_BAD', draw, match, <string>match.score);
                        bRes = false;
                    }

                    //ASSERT( boxes[ i].playerId==-1 || player.isInscrit( tournament.FindEpreuve( this)) );
                    ASSERT(k.column(b) < colMax);
                    if (!opponent.box1.playerId || !opponent.box2.playerId) {
                        validation.errorDraw('IDS_ERR_MATCH_JOUEUR_NO', draw, match);
                        bRes = false;

                    } else if (opponent.box1.playerId != match.playerId
                        && opponent.box2.playerId != match.playerId) {
                        validation.errorDraw('IDS_ERR_VAINQUEUR_MIS', draw, match);
                        bRes = false;
                    }
                }

                if (!this.isMatchJoue(match)) {

                    //match before opponent 2
                    var opponent1 = lib.boxesOpponents(<Match>opponent.box1);
                    var opponent2 = lib.boxesOpponents(<Match>opponent.box2);

                    if (opponent.box1.playerId) {
                        if (opponent.box2.playerId) {
                            if (!CompString(opponent.box1._player.club, opponent.box2._player.club)) {
                                validation.errorDraw('IDS_ERR_MEME_CLUB1', draw, match, opponent.box1._player.club);
                                bRes = false;
                            }
                        } else if (this.isMatchJouable(opponent.box2)) { //!isTypePoule &&

                            if (!CompString(opponent.box1._player.club, opponent2.box1._player.club)) {
                                validation.errorDraw('IDS_ERR_MEME_CLUB2', draw, match, opponent.box1._player.club);
                                bRes = false;
                            } else if (!CompString(opponent.box1._player.club, opponent2.box2._player.club)) {
                                validation.errorDraw('IDS_ERR_MEME_CLUB2', draw, match, opponent.box1._player.club);
                                bRes = false;
                            }
                        }
                    } else if (isTypePoule) {
                        //TODO Poule
                    } else if (opponent.box2.playerId) {
                        if (this.isMatchJouable(opponent.box1)) {
                            if (!CompString(opponent.box2._player.club, opponent1.box1._player.club)) {
                                validation.errorDraw('IDS_ERR_MEME_CLUB2', draw, match, opponent.box2._player.club);
                                bRes = false;
                            } else if (!CompString(opponent.box2._player.club, opponent1.box2._player.club)) {
                                validation.errorDraw('IDS_ERR_MEME_CLUB2', draw, match, opponent.box2._player.club);
                                bRes = false;
                            }
                        }
                    } else if (this.isMatchJouable(opponent.box1) && this.isMatchJouable(opponent.box2)) {

                        if (!CompString(opponent1.box1._player.club, opponent2.box1._player.club)
                            || !CompString(opponent1.box1._player.club, opponent2.box2._player.club)) {
                            validation.errorDraw('IDS_ERR_MEME_CLUB2', draw, match, opponent1.box1._player.club);
                            bRes = false;
                        }
                        if (!CompString(opponent1.box2._player.club, opponent2.box1._player.club)
                            || !CompString(opponent1.box2._player.club, opponent2.box2._player.club)) {
                            validation.errorDraw('IDS_ERR_MEME_CLUB2', draw, match, opponent1.box2._player.club);
                            bRes = false;
                        }
                    }
                }

                //DONE 01/08/01 (00/07/27): Date d'un match entre dates de l'épreuve
                if (match.date) {
                    if (draw._event.start
                        && match.date < draw._event.start) {
                        validation.errorDraw('IDS_ERR_DATE_MATCH_EPREUVE', draw, match, match.date.toDateString());
                        bRes = false;
                    }

                    if (draw._event.end
                        && draw._event.end < match.date) {
                        validation.errorDraw('IDS_ERR_DATE_MATCH_EPREUVE', draw, match, match.date.toDateString());
                        bRes = false;
                    }

                    tournament._dayCount = dateDiff(tournament.info.start, tournament.info.end, UnitDate.Day) + 1;

                    if (tournament._dayCount) {
                        var iDay = dateDiff(match.date, tournament.info.start, UnitDate.Day);
                        if (0 <= iDay && iDay < tournament._dayCount) {	//v0998

                            var dayMatches = tournament._day[iDay];
                            ASSERT(dayMatches.length <= MAX_MATCHJOUR);

                            for (var m = dayMatches.length - 1; m >= 0; m--) {
                                var match2 = dayMatches[m];

                                if (match2.position != match.position
                                    && match2.place == match.place
                                    && Math.abs(match.date.getTime() - match2.date.getTime()) < tournament.info.slotLength) {
                                    validation.errorDraw('IDS_ERR_PLN_OVERLAP', draw, match, match.date.toDateString());
                                    bRes = false;
                                }
                            }
                        } else {
                            //Match en dehors du planning
                            validation.errorDraw('IDS_ERR_DATE_MATCH_TOURNOI', draw, match, match.date.toDateString());
                            bRes = false;
                        }
                    }

                    //TODO 00/07/27: Date d'un match après les matches précédents (au moins 3 heures) ça test pas bien à tous les coups
                    //TODO 00/12/20: Dans tous les tableaux où le joueur est inscrit, date des matches différentes pour un même joueur
                    ASSERT(k.positionOpponent1(b) <= k.positionMax(draw.nbColumn, draw.nbOut));

                    //DONE 01/08/19 (00/12/20): Dans Poule, date des matches différentes pour un même joueur

                    //if (!isTypePoule) {
                    var match1 = <Match>opponent.box1;
                    var match2 = <Match>opponent.box2;

                    if (isMatch(opponent.box1)
                        && match1.date) {
                        if (match.date < match1.date) {
                            validation.errorDraw('IDS_ERR_DATE_MATCHS', draw, match, match.date.toDateString());
                            bRes = false;
                        } else if (match.date.getTime() < (match1.date.getTime() + (tournament.info.slotLength << 1))) {
                            validation.errorDraw('IDS_ERR_DATE_MATCHS', draw, match, match.date.toDateString());
                            bRes = false;
                        }
                    }

                    if (isMatch(opponent.box2) && match2.date) {
                        if (match.date < match2.date) {
                            validation.errorDraw('IDS_ERR_DATE_MATCHS', draw, match, match.date.toDateString());
                            bRes = false;
                        } else if (match.date.getTime() < (match2.date.getTime() + (tournament.info.slotLength << 1))) {
                            validation.errorDraw('IDS_ERR_DATE_MATCHS', draw, match, match.date.toDateString());
                            bRes = false;
                        }
                    }
                    //}

                    if (match.date) {
                        if (!match.playerId && !match.place && tournament.places.length && tournament._dayCount) {
                            validation.errorDraw('IDS_ERR_PLN_COURT_NO', draw, match);
                            bRes = false;
                        }
                    }

                }


                //DONE 01/08/01 (00/05/28): CTableau, interdit d'avoir plus de Qualifiés que de joueurs admis directement

                //DONE 01/08/19 (00/05/28): CTableau, interdit de prévoir plus d'un tour d'écart entre deux joueurs de même classement

                //DONE 01/08/19 (00/05/28): CTableau, interdit de faire entrer un joueur plus loin qu'un joueur de classement supérieur au sien

            }

            if (boxIn) {
                var e = boxIn.qualifIn;
                if (e && e != QEMPTY) {
                    nqe++;

                    ASSERT(!isTypePoule || (b >= k.positionBottomCol(draw.nbColumn, draw.nbOut)));	//Qe que dans colonne de gauche

                    var iTableau = Find.indexOf(draw._event.draws, 'id', draw.id);
                    if (iTableau == 0) {
                        validation.errorDraw('IDS_ERR_TAB_ENTRANT_TAB1', draw, boxIn);
                        bRes = false;
                    }
                    //ASSERT( iTableau != 0);

                    //DONE 00/03/07: CTableau, qualifié entrant en double
                    var j: Box;
                    if (!draw.suite && (j = lib.findPlayerIn(draw, e)) && (j.position != b || j._draw.id != draw.id)) {
                        validation.errorDraw('IDS_ERR_TAB_ENTRANT_DUP', draw, boxIn);
                        bRes = false;
                    }

                    var group = drawLib.previousGroup(draw);
                    if (group) {
                        //DONE 00/03/07: CTableau, les joueurs qualifiés entrant et sortant correspondent
                        j = drawLib.groupFindPlayerOut(group, e);
                        if (!j) {
                            validation.errorDraw('IDS_ERR_TAB_ENTRANT_PREC_NO', draw, boxIn);
                            bRes = false;
                        } else if (j.playerId != boxIn.playerId) {
                            validation.errorDraw('IDS_ERR_TAB_ENTRANT_PREC_MIS', draw, boxIn);
                            bRes = false;
                        }
                    }
                }
            }

            if (match) {
                var e = match.qualifOut;
                if (e) {
                    nqs++;

                    //ASSERT(!isTypePoule || (b == iDiagonale(b)));	//Qs que dans diagonale des poules

                    //DONE 00/03/07: CTableau, qualifié sortant en double
                    j = lib.findPlayerOut(draw, e);
                    if (j && (j.position != b || j._draw.id != draw.id)) {
                        validation.errorDraw('IDS_ERR_TAB_SORTANT_DUP', draw, match);
                        bRes = false;
                    }

                    if (draw.type === DrawType.Final) {
                        validation.errorDraw('IDS_ERR_TAB_SORTANT_FINAL', draw, box);
                        bRes = false;
                    }
                    /*			
                    pSuite = getSuivant();
                    if( pSuite && (j = pSuite.findPlayerIn( e, &pSuite)) != -1) {
                        if( boxes[ i].playerId != pSuite.boxes[ j].playerId) {
                            validation.errorDraw('IDS_ERR_TAB_ENTRANT_PREC_MIS', tournament.events[ iEpreuve].FindTableau( pSuite), j);
                            bRes=false;
                        }
                    }
                    */
                }
            }

        }

        //Check Têtes de série
        //	if( !isTypePoule)
        if (!draw.suite) {
            for (var e2 = 0, e = 1; e <= MAX_TETESERIE; e++) {
                boxIn = drawLib.findSeeded(draw, e);
                if (boxIn) {
                    if (e > e2 + 1) {
                        validation.errorDraw('IDS_ERR_TAB_TETESERIE_NO', boxIn._draw, boxIn, 'Seeded ' + e);
                        bRes = false;
                    }

                    if (isMatch(boxIn)) {
                        validation.errorDraw('IDS_ERR_TAB_TETESERIE_ENTRANT', boxIn._draw, boxIn, 'Seeded ' + e);
                        bRes = false;
                    }

                    for (var i = 0; i < draw.boxes.length; i++) {
                        var boxIn2 = <PlayerIn>draw.boxes[i];
                        if (boxIn2.seeded == e && boxIn2.position !== boxIn.position) {
                            validation.errorDraw('IDS_ERR_TAB_TETESERIE_DUP', boxIn._draw, boxIn, 'Seeded ' + e);
                            bRes = false;
                        }
                    }

                    e2 = e;
                }
            }
        }

        //Tous les qualifiés sortants du tableau précédent sont utilisés
        if (!draw.suite) {
            var pT = drawLib.previousGroup(draw);
            if (pT && pT.length) {
                for (var e = 1; e <= MAX_QUALIF; e++) {
                    var boxOut = drawLib.groupFindPlayerOut(pT, e);
                    boxIn = lib.findPlayerIn(draw, e);
                    if (boxOut && !boxIn) {
                        validation.errorDraw('IDS_ERR_TAB_SORTANT_PREC_NO', draw, undefined, 'Q' + boxOut.qualifOut);
                        bRes = false;
                    }
                }
            }
        }

        if (isTypePoule && nqs < draw.nbOut) {
            validation.errorDraw('IDS_ERR_POULE_SORTANT_NO', draw);
            bRes = false;
        }

        if (draw.type === DrawType.Final) {

            if (draw.suite || group[group.length - 1].id !== draw.id) {
                validation.errorDraw('IDS_ERR_TAB_SUITE_FINAL', draw);
                bRes = false;
            }

            if (draw.nbOut != 1) {
                validation.errorDraw('IDS_ERR_TAB_FINAL_NQUAL', draw);
                bRes = false;
            }
        }

        return bRes;
    }

    //private boxOpponent1(match: Match): Box {
    //    return Find.by(match._draw.boxes, 'position', positionOpponent1(match.position));
    //}
    //private boxOpponent2(match: Match): Box {
    //    return Find.by(match._draw.boxes, 'position', positionOpponent2(match.position));
    //}

    private isMatchJoue(match: Match): boolean {
        var opponent = this.knockout.boxesOpponents(match);
        return !!match.playerId && !!opponent.box1.playerId && !!opponent.box2.playerId;
    }
    private isMatchJouable(match: Box): boolean {
        if (!isMatch(match)) {
            return false;
        }
        var opponent = this.knockout.boxesOpponents(<Match> match);
        return !match.playerId && !!opponent.box1.playerId && !!opponent.box2.playerId;
    }

}

function ASSERT(b: boolean, message?: string): void {
    if (!b) {
        debugger;
        throw message || 'Assertion is false';
    }
}

function isMatch(box: Box): boolean {
    return 'score' in box;
}

function CompString(a: string, b: string): number {
    //sort empty/null vale at the end
    if (!a) {
        return 1;
    }
    if (!b) {
        return -1;
    }
    //upper case comparison
    var u = a.toUpperCase(), v = b.toUpperCase();
    return u == v ? 0 : u < v ? -1 : 1;
}

enum UnitDate {
    Day = 1000 * 60 * 60 * 24,
    Hour = 1000 * 60 * 60
}

function dateDiff(first: Date, second: Date, unit: UnitDate) {

    // Copy date parts of the timestamps, discarding the time parts.
    var one = new Date(first.getFullYear(), first.getMonth(), first.getDate());
    var two = new Date(second.getFullYear(), second.getMonth(), second.getDate());

    return Math.floor((two.getTime() - one.getTime()) / unit);
}