import { Knockout } from './knockout';
import { KnockoutLib as k } from './knockoutLib';
import { findSeeded, groupDraw, groupFindPlayerOut, isMatch, isPlayerIn, nextGroup, previousGroup } from '../drawService';
// import { TournamentEditor } from '../tournamentService';
import { indexOf, by, byId } from '../util/find';
import { Guid } from '../util/guid';
import { isObject,isArray,extend } from '../util/object';
import { shuffle,filledArray } from '../../utils/tool';
import { category, rank, score, validation } from '../types';
import { DrawType, Draw, Box, Match, PlayerIn } from '../../domain/draw';
import { Player } from '../../domain/player';
import { RankString } from '../../domain/types';
import { IValidation } from '../../domain/validation';
import { TEvent, Tournament } from '../../domain/tournament';
import { isRegistred, isSexeCompatible } from '../tournamentService';
import { MINUTES } from '../../utils/date';
import { drawLib } from './drawLib';

const MAX_TETESERIE = 32,
    MAX_QUALIF = 32,
    QEMPTY = - 1,
    MAX_MATCHJOUR = 16;

export class KnockoutValidation implements IValidation {

    // private lib: Knockout;

    constructor() {
        // this.lib = drawLib(DrawType.Normal) as Knockout;
        validation.addValidator(this);
    }

    /** @override */
    validatePlayer(player: Player): boolean {
        return true;
    }

    validateGroup(event: TEvent, draw: Draw): boolean {
        let bRes = true;

        if (draw.suite) {
            const iTableau = indexOf(event.draws, 'id', draw.id);
            if (iTableau === 0 /* || !draw._previous */) {
                validation.errorDraw('IDS_ERR_TAB_SUITE_PREMIER', draw);
                bRes = false;
            }

            const [groupStart] = groupDraw(event, draw);
            const firstDraw = event.draws[groupStart];
            if (draw.type !== firstDraw.type) {
                validation.errorDraw('IDS_ERR_TAB_SUITE_TYPE', draw);
                bRes = false;
            }
            if (draw.minRank != firstDraw.minRank) {
                validation.errorDraw('IDS_ERR_TAB_SUITE_MIN', draw);
                bRes = false;
            }
            if (draw.maxRank != firstDraw.maxRank) {
                validation.errorDraw('IDS_ERR_TAB_SUITE_MAX', draw);
                bRes = false;
            }
        }

        const prevGroup = previousGroup(event, draw);
        if (prevGroup) {
            const firstDraw = event.draws[prevGroup[0]];
            if (firstDraw.type !== DrawType.Final && draw.minRank && firstDraw.maxRank) {
                if (rank.compare(draw.minRank, firstDraw.maxRank) < 0) {
                    validation.errorDraw('IDS_ERR_TAB_CLASSMAX_OVR', draw);
                    bRes = false;
                }
            }
        }

        const nextGrp = nextGroup(event, draw);
        if (nextGrp) {
            const firstDraw = event.draws[nextGrp[0]];
            if (draw.type !== DrawType.Final && draw.maxRank && firstDraw.minRank) {
                if (rank.compare(firstDraw.minRank, draw.maxRank) < 0) {
                    validation.errorDraw('IDS_ERR_TAB_CLASSMAX_NEXT_OVR', draw);
                    bRes = false;
                }
            }
        }

        let e = MAX_QUALIF;
        if (!draw.suite) {
            //Trouve le plus grand Qsortant
            const group = groupDraw(event, draw);
            for (e = MAX_QUALIF; e >= 1; e--) {
                const [,m] = groupFindPlayerOut(event, group, e);
                if (m) {
                    break;
                }
            }
            for (let e2 = 1; e2 <= e; e2++) {
                const [,m] = groupFindPlayerOut(event, group, e2);
                if (!m) {
                    validation.errorDraw('IDS_ERR_TAB_SORTANT_NO', draw, undefined, undefined, 'Q' + e2);
                    bRes = false;
                }
            }
        }

        return bRes;
    }

    validateMatches(draw: Draw): boolean {
        let bRes = true;


        return bRes;
    }

    /** @override */
    validateDraw(tournament: Tournament, event: TEvent, draw: Draw, players: Player[]): boolean {
        let bRes = true;
        let nqe = 0;
        let nqs = 0;
        const isTypePoule = draw.type >= 2;
        const lib = drawLib(event,draw);

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

        const isMatchJoue = (match: Match): boolean => {
            const opponent = lib.boxesOpponents(match);
            return !!match.playerId && !!opponent.box1.playerId && !!opponent.box2.playerId;
        };
        
        const isMatchJouable = (match: Box): boolean => {
            if (!isMatch(match)) {
                return false;
            }
            const opponent = lib.boxesOpponents(match);
            return !match.playerId && !!opponent.box1.playerId && !!opponent.box2.playerId;
        };
    
        if (draw.minRank && draw.maxRank && rank.compare(draw.maxRank, draw.minRank) < 0) {
            validation.errorDraw('IDS_ERR_TAB_CLAST_INV', draw);
            bRes = false;
        }

        //DONE 00/05/10: CTableau contrôle progression des classements
        if (event.maxRank && rank.compare(event.maxRank, draw.maxRank) < 0) {
            validation.errorDraw('IDS_ERR_TAB_CLASSLIM_OVR', draw);
            bRes = false;
        }

        bRes = bRes && this.validateGroup(event, draw);

        bRes = bRes && this.validateMatches(draw);

        const colMax = k.columnMax(draw.nbColumn, draw.nbOut);
        const pClastMaxCol: RankString[] = new Array(colMax + 1);
        pClastMaxCol[colMax] = 'NC';    //pClastMaxCol[colMax].Start(); pClastMaxCol[colMax].Next();

        //Match avec deux joueurs gagné par un des deux joueurs
        for (let i = 0; i < draw.boxes.length; i++) {
            const box = draw.boxes[i];
            const boxIn = isPlayerIn(box) ? box : undefined;
            const match = isMatch(box) ? box : undefined;
            const b = box.position;

            //ASSERT(-1 <= box.playerId && box.playerId < tournament.players.length);
            //Joueur inscrit au tableau ?

            const c = k.column(b);
            if (b === k.positionTopCol(c)) {
                if (c < colMax) {
                    pClastMaxCol[c] = pClastMaxCol[c + 1];
                    //pClastMinCol[ c] = pClastMinCol[ c+1];
                }
            }

            const player = byId(players, box.playerId);

            if (boxIn
                && boxIn.order !== undefined
                && boxIn.order < 0
                && !boxIn.qualifIn
                && !box.hidden
                ) {
                validation.errorDraw('IDS_ERR_TAB_DUPLI', draw, boxIn, player);
                bRes = false;
            }

            //if( boxes[ i].order >= 0 && player) 
            if (player && boxIn && lib.isJoueurNouveau(boxIn) && !boxIn.qualifIn) {

                //DONE 00/03/07: Tableau, joueur sans classement
                //DONE 00/03/04: Tableau, Classement des joueurs correspond au limites du tableau
                if (!player.rank) {
                    validation.errorDraw('IDS_ERR_CLAST_NO', draw, boxIn, player);
                    bRes = false;
                } else {

                    //Players rank within draw min and max ranks
                    if (!rank.within(player.rank, draw.minRank, draw.maxRank)) {
                        validation.errorDraw('IDS_ERR_CLAST_MIS', draw, boxIn, player, player.rank);
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
                        validation.errorDraw('IDS_ERR_CLAST_PROGR', draw, boxIn, player, player.rank);
                        bRes = false;
                    }
                    //}

                }

                //Check inscriptions
                if (!isSexeCompatible(event, player.sexe)) {
                    validation.errorDraw('IDS_ERR_EPR_SEXE', draw, boxIn, player);

                } else if (!isRegistred(event, player)) {
                    validation.errorDraw('IDS_ERR_INSCR_NO', draw, boxIn, player);
                }

                //DONE 00/05/11: CTableau, check categorie
                //Check Categorie
                if (player.category && !category.isCompatible(event.category, player.category)) {
                    validation.errorDraw('IDS_ERR_CATEG_MIS', draw, boxIn, player);
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

                //TODO boxesOpponents(match)
                const opponent = lib.boxesOpponents(match);

                ASSERT(!!opponent.box1 && !!opponent.box2);

                if (!match.score) {

                    if (match.playerId) {
                        validation.errorDraw('IDS_ERR_VAINQ_SCORE_NO', draw, match, player, player?.name);
                        bRes = false;
                    }

                } else {
                    ASSERT(b < k.positionBottomCol(draw.nbColumn, draw.nbOut)); //Pas de match colonne de gauche

                    if (!match.playerId) {
                        validation.errorDraw('IDS_ERR_SCORE_VAINQ_NO', draw, match);
                        bRes = false;
                    }

                    if (!score.isValid(match.score)) {
                        validation.errorDraw('IDS_ERR_SCORE_BAD', draw, match, player, match.score as string);
                        bRes = false;
                    }

                    //ASSERT( boxes[ i].playerId==-1 || player.isInscrit( tournament.FindEpreuve( this)) );
                    ASSERT(k.column(b) < colMax);
                    if (!opponent.box1.playerId || !opponent.box2.playerId) {
                        validation.errorDraw('IDS_ERR_MATCH_JOUEUR_NO', draw, match);
                        bRes = false;

                    } else if (opponent.box1.playerId != match.playerId
                        && opponent.box2.playerId != match.playerId) {
                        validation.errorDraw('IDS_ERR_VAINQUEUR_MIS', draw, match, player);
                        bRes = false;
                    }
                }

                if (!isMatchJoue(match)) {

                    //match before opponent 2
                    const opponent1 = lib.boxesOpponents(opponent.box1 as Match);
                    const opponent2 = lib.boxesOpponents(opponent.box2 as Match);

                    const player1 = byId(players, opponent.box1.playerId); // opponent.box1._player
                    const player2 = byId(players, opponent.box2.playerId); // opponent.box2._player

                    const player21 = byId(players, opponent2.box1.playerId)!; // opponent2.box1._player
                    const player22 = byId(players, opponent2.box2.playerId)!; // opponent2.box2._player

                    const player11 = byId(players, opponent1.box1.playerId)!; // opponent1.box1._player
                    const player12 = byId(players, opponent1.box2.playerId)!; // opponent1.box2._player

                    if (player1) {
                        if (player2) {
                            if (!CompString(player1.club, player2.club)) {
                                validation.errorDraw('IDS_ERR_MEME_CLUB1', draw, match, player, player1.club);
                                bRes = false;
                            }
                        } else if (isMatchJouable(opponent.box2)) { //!isTypePoule &&

                            if (!CompString(player1.club, player21.club)) {
                                validation.errorDraw('IDS_ERR_MEME_CLUB2', draw, match, player, player1.club);
                                bRes = false;
                            } else if (!CompString(player1.club, player22.club)) {
                                validation.errorDraw('IDS_ERR_MEME_CLUB2', draw, match, player, player1.club);
                                bRes = false;
                            }
                        }
                    } else if (isTypePoule) {
                        //TODO Poule
                    } else if (player2) {
                        if (isMatchJouable(opponent.box1)) {
                            if (!CompString(player2.club, player11.club)) {
                                validation.errorDraw('IDS_ERR_MEME_CLUB2', draw, match, player, player2.club);
                                bRes = false;
                            } else if (!CompString(player2.club, player12.club)) {
                                validation.errorDraw('IDS_ERR_MEME_CLUB2', draw, match, player, player2.club);
                                bRes = false;
                            }
                        }
                    } else if (isMatchJouable(opponent.box1) && isMatchJouable(opponent.box2)) {
                        if (!CompString(player11.club, player21.club)
                            || !CompString(player11.club, player22.club)) {
                            validation.errorDraw('IDS_ERR_MEME_CLUB2', draw, match, player, player11.club);
                            bRes = false;
                        }
                        if (!CompString(player12.club, player21.club)
                            || !CompString(player12.club, player22.club)) {
                            validation.errorDraw('IDS_ERR_MEME_CLUB2', draw, match, player, player12.club);
                            bRes = false;
                        }
                    }
                }

                //DONE 01/08/01 (00/07/27): Date d'un match entre dates de l'épreuve
                if (match.date) {
                    if (event.start
                        && match.date < event.start) {
                        validation.errorDraw('IDS_ERR_DATE_MATCH_EPREUVE', draw, match, player, match.date.toDateString());
                        bRes = false;
                    }

                    if (event.end
                        && event.end < match.date) {
                        validation.errorDraw('IDS_ERR_DATE_MATCH_EPREUVE', draw, match, player, match.date.toDateString());
                        bRes = false;
                    }

                    if (tournament.info.start && tournament.info.end && tournament._day){
                        tournament._dayCount = dateDiff(tournament.info.start, tournament.info.end, UnitDate.Day) + 1;

                        if (tournament._dayCount) {
                            const iDay = dateDiff(match.date, tournament.info.start, UnitDate.Day);
                            if (0 <= iDay && iDay < tournament._dayCount) {	//v0998

                                const dayMatches = tournament._day[iDay];
                                ASSERT(dayMatches.length <= MAX_MATCHJOUR);

                                for (let m = dayMatches.length - 1; m >= 0; m--) {
                                    const match2 = dayMatches[m];

                                    if (match2.position != match.position
                                        && match2.place == match.place
                                        && match2.date
                                        && Math.abs(match.date.getTime() - match2.date.getTime()) < tournament.info.slotLength * MINUTES) {
                                        validation.errorDraw('IDS_ERR_PLN_OVERLAP', draw, match, player, match.date.toDateString());
                                        bRes = false;
                                    }
                                }
                            } else {
                                //Match en dehors du planning
                                validation.errorDraw('IDS_ERR_DATE_MATCH_TOURNOI', draw, match, player, match.date.toDateString());
                                bRes = false;
                            }
                        }
                    }

                    //TODO 00/07/27: Date d'un match après les matches précédents (au moins 3 heures) ça test pas bien à tous les coups
                    //TODO 00/12/20: Dans tous les tableaux où le joueur est inscrit, date des matches différentes pour un même joueur
                    ASSERT(k.positionOpponent1(b) <= k.positionMax(draw.nbColumn, draw.nbOut));

                    //DONE 01/08/19 (00/12/20): Dans Poule, date des matches différentes pour un même joueur

                    if (match.date) {

                        //if (!isTypePoule) {
                        const match1 = opponent.box1 as Match;
                        const match2 = opponent.box2 as Match;

                        if (isMatch(opponent.box1)
                            && match1.date) {
                            if (match.date < match1.date) {
                                validation.errorDraw('IDS_ERR_DATE_MATCHS', draw, match, player, match.date.toDateString());
                                bRes = false;
                            } else if (match.date.getTime() < (match1.date.getTime() + ((tournament.info.slotLength * MINUTES) << 1))) {
                                validation.errorDraw('IDS_ERR_DATE_MATCHS', draw, match, player, match.date.toDateString());
                                bRes = false;
                            }
                        }

                        if (isMatch(opponent.box2) && match2.date) {
                            if (match.date < match2.date) {
                                validation.errorDraw('IDS_ERR_DATE_MATCHS', draw, match, player, match.date.toDateString());
                                bRes = false;
                            } else if (match.date.getTime() < (match2.date.getTime() + ((tournament.info.slotLength * MINUTES) << 1))) {
                                validation.errorDraw('IDS_ERR_DATE_MATCHS', draw, match, player, match.date.toDateString());
                                bRes = false;
                            }
                        }
                        //}

                        if (!match.playerId && !match.place && tournament.places?.length && tournament._dayCount) {
                            validation.errorDraw('IDS_ERR_PLN_COURT_NO', draw, match, player);
                            bRes = false;
                        }
                    }

                }


                //DONE 01/08/01 (00/05/28): CTableau, interdit d'avoir plus de Qualifiés que de joueurs admis directement

                //DONE 01/08/19 (00/05/28): CTableau, interdit de prévoir plus d'un tour d'écart entre deux joueurs de même classement

                //DONE 01/08/19 (00/05/28): CTableau, interdit de faire entrer un joueur plus loin qu'un joueur de classement supérieur au sien

            }

            if (boxIn) {
                const e = boxIn.qualifIn;
                if (e && e != QEMPTY) {
                    nqe++;

                    ASSERT(!isTypePoule || (b >= k.positionBottomCol(draw.nbColumn, draw.nbOut)));	//Qe que dans colonne de gauche

                    const iTableau = indexOf(event.draws, 'id', draw.id);
                    if (iTableau == 0) {
                        validation.errorDraw('IDS_ERR_TAB_ENTRANT_TAB1', draw, boxIn, player);
                        bRes = false;
                    }
                    //ASSERT( iTableau != 0);

                    //DONE 00/03/07: CTableau, qualifié entrant en double
                    let j: Box | undefined;
                    if (!draw.suite && (j = lib.findPlayerIn(e)) && (j.position != b)) {
                        validation.errorDraw('IDS_ERR_TAB_ENTRANT_DUP', draw, boxIn, player);
                        bRes = false;
                    }

                    const group = previousGroup(event, draw);
                    if (group) {
                        //DONE 00/03/07: CTableau, les joueurs qualifiés entrant et sortant correspondent
                        const [d,m] = groupFindPlayerOut(event, group, e);
                        if (!m) {
                            validation.errorDraw('IDS_ERR_TAB_ENTRANT_PREC_NO', draw, boxIn, player);
                            bRes = false;
                        } else if (m.playerId != boxIn.playerId) {
                            validation.errorDraw('IDS_ERR_TAB_ENTRANT_PREC_MIS', draw, boxIn, player);
                            bRes = false;
                        }
                    }
                }
            }

            if (match) {
                const e = match.qualifOut;
                if (e) {
                    nqs++;

                    //ASSERT(!isTypePoule || (b == iDiagonale(b)));	//Qs que dans diagonale des poules

                    //DONE 00/03/07: CTableau, qualifié sortant en double
                    let j = lib.findPlayerOut(e);
                    if (j && (j.position != b)) {
                        validation.errorDraw('IDS_ERR_TAB_SORTANT_DUP', draw, match, player);
                        bRes = false;
                    }

                    if (draw.type === DrawType.Final) {
                        validation.errorDraw('IDS_ERR_TAB_SORTANT_FINAL', draw, box, player);
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
            for (let e2 = 0, e = 1; e <= MAX_TETESERIE; e++) {
                const [d,boxIn] = findSeeded(event, draw, e);
                if (boxIn && d) {
                    if (e > e2 + 1) {
                        validation.errorDraw('IDS_ERR_TAB_TETESERIE_NO', d, boxIn, undefined, 'Seeded ' + e);
                        bRes = false;
                    }

                    if (isMatch(boxIn)) {
                        validation.errorDraw('IDS_ERR_TAB_TETESERIE_ENTRANT', d, boxIn, undefined, 'Seeded ' + e);
                        bRes = false;
                    }

                    for (let i = 0; i < draw.boxes.length; i++) {
                        const boxIn2 = draw.boxes[i] as PlayerIn;
                        if (boxIn2.seeded == e && boxIn2.position !== boxIn.position) {
                            validation.errorDraw('IDS_ERR_TAB_TETESERIE_DUP', d, boxIn, undefined, 'Seeded ' + e);
                            bRes = false;
                        }
                    }

                    e2 = e;
                }
            }
        }

        //Tous les qualifiés sortants du tableau précédent sont utilisés
        if (!draw.suite) {
            const pT = previousGroup(event, draw);
            if (pT && pT.length) {
                for (let e = 1; e <= MAX_QUALIF; e++) {
                    const [d,boxOut] = groupFindPlayerOut(event, pT, e);
                    const boxIn = lib.findPlayerIn(e);
                    if (boxOut && !boxIn) {
                        validation.errorDraw('IDS_ERR_TAB_SORTANT_PREC_NO', draw, undefined, undefined, 'Q' + boxOut.qualifOut);
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
            const [,groupEnd] = groupDraw(event, draw);
            if (draw.suite || event.draws[groupEnd-1]?.id !== draw.id) {
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
    //    return by(match._draw.boxes, 'position', positionOpponent1(match.position));
    //}
    //private boxOpponent2(match: Match): Box {
    //    return by(match._draw.boxes, 'position', positionOpponent2(match.position));
    //}
}

function ASSERT(b: boolean, message?: string): void {
    if (!b) {
        debugger;
        throw message || 'Assertion is false';
    }
}

function CompString(a?: string, b?: string): number {
    //sort empty/null value at the end
    if (!a) {
        return 1;
    }
    if (!b) {
        return -1;
    }
    //upper case comparison
    const u = a.toUpperCase(), v = b.toUpperCase();
    return u == v ? 0 : u < v ? -1 : 1;
}

enum UnitDate {
    Day = 1000 * 60 * 60 * 24,
    Hour = 1000 * 60 * 60
}

function dateDiff(first: Date, second: Date, unit: UnitDate) {

    // Copy date parts of the timestamps, discarding the time parts.
    const one = new Date(first.getFullYear(), first.getMonth(), first.getDate());
    const two = new Date(second.getFullYear(), second.getMonth(), second.getDate());

    return Math.floor((two.getTime() - one.getTime()) / unit);
}