import { KnockoutLib as k } from './knockoutLib';
import { findSeeded, groupDraw, groupFindPlayerOut, isMatch, isPlayerIn, nextGroup, previousGroup } from '../drawService';
import { indexOf, byId } from '../util/find';
import { category, rank, score } from '../types';
import { DrawType, Draw, Box, Match, PlayerIn } from '../../domain/draw';
import { Player } from '../../domain/player';
import { RankString } from '../../domain/types';
import { TEvent, Tournament } from '../../domain/tournament';
import { isRegistred, isSexeCompatible } from '../tournamentService';
import { MINUTES } from '../../utils/date';
import { drawLib } from './drawLib';
import { DrawError } from '../../domain/validation';

const MAX_TETESERIE = 32,
    MAX_QUALIF = 32,
    QEMPTY = - 1,
    MAX_MATCHJOUR = 16;

function validateGroup(event: TEvent, draw: Draw): DrawError[] {
    const result: DrawError[] = [];

    if (draw.suite) {
        const iTableau = indexOf(event.draws, 'id', draw.id);
        if (iTableau === 0 /* || !draw._previous */) {
            result.push({ message: 'ERR_TAB_SUITE_PREMIER', draw });
        }

        const [groupStart] = groupDraw(event, draw);
        const firstDraw = event.draws[groupStart];
        if (draw.type !== firstDraw.type) {
            result.push({ message: 'ERR_TAB_SUITE_TYPE', draw });
        }
        if (draw.minRank != firstDraw.minRank) {
            result.push({ message: 'ERR_TAB_SUITE_MIN', draw });
        }
        if (draw.maxRank != firstDraw.maxRank) {
            result.push({ message: 'ERR_TAB_SUITE_MAX', draw });
        }
    }

    const prevGroup = previousGroup(event, draw);
    if (prevGroup) {
        const firstDraw = event.draws[prevGroup[0]];
        if (firstDraw.type !== DrawType.Final && draw.minRank && firstDraw.maxRank) {
            if (rank.compare(draw.minRank, firstDraw.maxRank) < 0) {
                result.push({ message: 'ERR_TAB_CLASSMAX_OVR', draw });
            }
        }
    }

    const nextGrp = nextGroup(event, draw);
    if (nextGrp) {
        const firstDraw = event.draws[nextGrp[0]];
        if (draw.type !== DrawType.Final && draw.maxRank && firstDraw.minRank) {
            if (rank.compare(firstDraw.minRank, draw.maxRank) < 0) {
                result.push({ message: 'ERR_TAB_CLASSMAX_NEXT_OVR', draw });
            }
        }
    }

    let e = MAX_QUALIF;
    if (!draw.suite) {
        //Trouve le plus grand Qsortant
        const group = groupDraw(event, draw);
        for (e = MAX_QUALIF; e >= 1; e--) {
            const [, m] = groupFindPlayerOut(event, group, e);
            if (m) {
                break;
            }
        }
        for (let e2 = 1; e2 <= e; e2++) {
            const [, m] = groupFindPlayerOut(event, group, e2);
            if (!m) {
                result.push({ message: 'ERR_TAB_SORTANT_NO', draw, detail: 'Q' + e2 });
            }
        }
    }

    return result;
}

function validateMatches(draw: Draw): DrawError[] {
    const result: DrawError[] = [];


    return result;
}

function validateDraw(tournament: Tournament, event: TEvent, draw: Draw): DrawError[] {
    const result: DrawError[] = [];
    const players = tournament.players;
    let nqe = 0;
    let nqs = 0;
    const isTypePoule = draw.type >= 2;
    const lib = drawLib(event, draw);

    if (draw.type !== DrawType.Normal
        && draw.type !== DrawType.Final) {
        return result;
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
        result.push({ message: 'ERR_TAB_CLAST_INV', draw });
    }

    //DONE 00/05/10: CTableau contrôle progression des classements
    if (event.maxRank && rank.compare(event.maxRank, draw.maxRank) < 0) {
        result.push({ message: 'ERR_TAB_CLASSLIM_OVR', draw });
    }

    result.splice(-1, 0, ...validateGroup(event, draw));

    result.splice(-1, 0, ...validateMatches(draw));

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
            result.push({ message: 'ERR_TAB_DUPLI', draw, box: boxIn, player });
        }

        //if( boxes[ i].order >= 0 && player) 
        if (player && boxIn && lib.isJoueurNouveau(boxIn) && !boxIn.qualifIn) {

            //DONE 00/03/07: Tableau, joueur sans classement
            //DONE 00/03/04: Tableau, Classement des joueurs correspond au limites du tableau
            if (!player.rank) {
                result.push({ message: 'ERR_CLAST_NO', draw, box: boxIn, player });
            } else {

                //Players rank within draw min and max ranks
                if (!rank.within(player.rank, draw.minRank, draw.maxRank)) {
                    result.push({ message: 'ERR_CLAST_MIS', draw, box: boxIn, player, detail: player.rank });
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
                    result.push({ message: 'ERR_CLAST_PROGR', draw, box: boxIn, player, detail: player.rank });
                }
                //}

            }

            //Check inscriptions
            if (!isSexeCompatible(event, player.sexe)) {
                result.push({ message: 'ERR_EPR_SEXE', draw, box: boxIn, player, detail: player.sexe });

            } else if (!isRegistred(event, player)) {
                result.push({ message: 'ERR_INSCR_NO', draw, box: boxIn, player });
            }

            //DONE 00/05/11: CTableau, check categorie
            //Check Categorie
            if (player.category && !category.isCompatible(event.category, player.category)) {
                result.push({ message: 'ERR_CATEG_MIS', draw, box: boxIn, player, detail:player.category });
            }
        }

        //if (!isMatch(box) && match.score) {

        //    //DONE 01/07/13: CTableau, isValid score sans match
        //    result.push({message:'ERR_SCORE_MATCH_NO', draw, box});
        //        //}

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
                    result.push({ message: 'ERR_VAINQ_SCORE_NO', draw, box: match, player, detail: player?.name });
                }

            } else {
                ASSERT(b < k.positionBottomCol(draw.nbColumn, draw.nbOut)); //Pas de match colonne de gauche

                if (!match.playerId) {
                    result.push({ message: 'ERR_SCORE_VAINQ_NO', draw, box: match });
                }

                if (!score.isValid(match.score)) {
                    result.push({ message: 'ERR_SCORE_BAD', draw, box: match, player, detail: match.score as string });
                }

                //ASSERT( boxes[ i].playerId==-1 || player.isInscrit( tournament.FindEpreuve( this)) );
                ASSERT(k.column(b) < colMax);
                if (!opponent.box1.playerId || !opponent.box2.playerId) {
                    result.push({ message: 'ERR_MATCH_JOUEUR_NO', draw, box: match });

                } else if (opponent.box1.playerId != match.playerId
                    && opponent.box2.playerId != match.playerId) {
                    result.push({ message: 'ERR_VAINQUEUR_MIS', draw, box: match, player });
                }
            }

            if (!isMatchJoue(match)) {

                const player1 = byId(players, opponent.box1.playerId); // opponent.box1._player
                const player2 = byId(players, opponent.box2.playerId); // opponent.box2._player

                //match before opponent 2
                const opponent1 = lib.boxesOpponents(opponent.box1 as Match);
                const opponent2 = lib.boxesOpponents(opponent.box2 as Match);

                const player21 = byId(players, opponent2.box1?.playerId); // opponent2.box1._player
                const player22 = byId(players, opponent2.box2?.playerId); // opponent2.box2._player

                const player11 = byId(players, opponent1.box1?.playerId); // opponent1.box1._player
                const player12 = byId(players, opponent1.box2?.playerId); // opponent1.box2._player

                if (player1) {
                    if (player2) {
                        if (!CompString(player1.club, player2.club)) {
                            result.push({ message: 'ERR_MEME_CLUB1', draw, box: match, player, detail: player1.club });
                        }
                    } else if (isMatchJouable(opponent.box2)) { //!isTypePoule &&

                        if (!CompString(player1.club, player21?.club)) {
                            result.push({ message: 'ERR_MEME_CLUB2', draw, box: match, player, detail: player1.club });
                        } else if (!CompString(player1.club, player22?.club)) {
                            result.push({ message: 'ERR_MEME_CLUB2', draw, box: match, player, detail: player1.club });
                        }
                    }
                } else if (isTypePoule) {
                    //TODO Poule
                } else if (player2) {
                    if (isMatchJouable(opponent.box1)) {
                        if (!CompString(player2.club, player11?.club)) {
                            result.push({ message: 'ERR_MEME_CLUB2', draw, box: match, player, detail: player2.club });
                        } else if (!CompString(player2.club, player12?.club)) {
                            result.push({ message: 'ERR_MEME_CLUB2', draw, box: match, player, detail: player2.club });
                        }
                    }
                } else if (isMatchJouable(opponent.box1) && isMatchJouable(opponent.box2)) {
                    if (!CompString(player11?.club, player21?.club)
                        || !CompString(player11?.club, player22?.club)) {
                        result.push({ message: 'ERR_MEME_CLUB2', draw, box: match, player, detail: player11?.club });
                    }
                    if (!CompString(player12?.club, player21?.club)
                        || !CompString(player12?.club, player22?.club)) {
                        result.push({ message: 'ERR_MEME_CLUB2', draw, box: match, player, detail: player12?.club });
                    }
                }
            }

            //DONE 01/08/01 (00/07/27): Date d'un match entre dates de l'épreuve
            if (match.date) {
                if (event.start
                    && match.date < event.start) {
                    result.push({ message: 'ERR_DATE_MATCH_EPREUVE', draw, box: match, player, detail: match.date.toDateString() });
                }

                if (event.end
                    && event.end < match.date) {
                    result.push({ message: 'ERR_DATE_MATCH_EPREUVE', draw, box: match, player, detail: match.date.toDateString() });
                }

                if (tournament.info.start && tournament.info.end && tournament._day) {
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
                                    result.push({ message: 'ERR_PLN_OVERLAP', draw, box: match, player, detail: match.date.toDateString() });
                                }
                            }
                        } else {
                            //Match en dehors du planning
                            result.push({ message: 'ERR_DATE_MATCH_TOURNOI', draw, box: match, player, detail: match.date.toDateString() });
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
                            result.push({ message: 'ERR_DATE_MATCHS', draw, box: match, player, detail: match.date.toDateString() });
                        } else if (match.date.getTime() < (match1.date.getTime() + ((tournament.info.slotLength * MINUTES) << 1))) {
                            result.push({ message: 'ERR_DATE_MATCHS', draw, box: match, player, detail: match.date.toDateString() });
                        }
                    }

                    if (isMatch(opponent.box2) && match2.date) {
                        if (match.date < match2.date) {
                            result.push({ message: 'ERR_DATE_MATCHS', draw, box: match, player, detail: match.date.toDateString() });
                        } else if (match.date.getTime() < (match2.date.getTime() + ((tournament.info.slotLength * MINUTES) << 1))) {
                            result.push({ message: 'ERR_DATE_MATCHS', draw, box: match, player, detail: match.date.toDateString() });
                        }
                    }
                    //}

                    if (!match.playerId && !match.place && tournament.places?.length && tournament._dayCount) {
                        result.push({ message: 'ERR_PLN_COURT_NO', draw, box: match, player });
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
                    result.push({ message: 'ERR_TAB_ENTRANT_TAB1', draw, box: boxIn, player, detail: `Q${e}` });
                }
                //ASSERT( iTableau != 0);

                //DONE 00/03/07: CTableau, qualifié entrant en double
                let j: Box | undefined;
                if (!draw.suite && (j = lib.findPlayerIn(e)) && (j.position != b)) {
                    result.push({ message: 'ERR_TAB_ENTRANT_DUP', draw, box: boxIn, player });
                }

                const group = previousGroup(event, draw);
                if (group) {
                    //DONE 00/03/07: CTableau, les joueurs qualifiés entrant et sortant correspondent
                    const [d, m] = groupFindPlayerOut(event, group, e);
                    if (!m) {
                        result.push({ message: 'ERR_TAB_ENTRANT_PREC_NO', draw, box: boxIn, player });
                    } else if (m.playerId != boxIn.playerId) {
                        result.push({ message: 'ERR_TAB_ENTRANT_PREC_MIS', draw, box: boxIn, player });
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
                    result.push({ message: 'ERR_TAB_SORTANT_DUP', draw, box: match, player });
                }

                if (draw.type === DrawType.Final) {
                    result.push({ message: 'ERR_TAB_SORTANT_FINAL', draw, box, player, detail: `Q${e}` });
                }
                /*			
                pSuite = getSuivant();
                if( pSuite && (j = pSuite.findPlayerIn( e, &pSuite)) != -1) {
                    if( boxes[ i].playerId != pSuite.boxes[ j].playerId) {
                        result.push({message:'ERR_TAB_ENTRANT_PREC_MIS', tournament.events[ iEpreuve].FindTableau( pSuite}), j);
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
            const [d, boxIn] = findSeeded(event, draw, e);
            if (boxIn && d) {
                if (e > e2 + 1) {
                    result.push({ message: 'ERR_TAB_TETESERIE_NO', draw: d, box: boxIn, detail: 'Seeded ' + e });
                }

                if (isMatch(boxIn)) {
                    result.push({ message: 'ERR_TAB_TETESERIE_ENTRANT', draw: d, box: boxIn, detail: 'Seeded ' + e });
                }

                for (let i = 0; i < draw.boxes.length; i++) {
                    const boxIn2 = draw.boxes[i] as PlayerIn;
                    if (boxIn2.seeded == e && boxIn2.position !== boxIn.position) {
                        result.push({ message: 'ERR_TAB_TETESERIE_DUP', draw: d, box: boxIn, detail: 'Seeded ' + e });
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
                const [d, boxOut] = groupFindPlayerOut(event, pT, e);
                const boxIn = lib.findPlayerIn(e);
                if (boxOut && !boxIn) {
                    result.push({ message: 'ERR_TAB_SORTANT_PREC_NO', draw, detail: 'Q' + boxOut.qualifOut });
                }
            }
        }
    }

    if (isTypePoule && nqs < draw.nbOut) {
        result.push({ message: 'ERR_POULE_SORTANT_NO', draw });
    }

    if (draw.type === DrawType.Final) {
        const [, groupEnd] = groupDraw(event, draw);
        if (draw.suite || event.draws[groupEnd - 1]?.id !== draw.id) {
            result.push({ message: 'ERR_TAB_SUITE_FINAL', draw });
        }

        if (draw.nbOut != 1) {
            result.push({ message: 'ERR_TAB_FINAL_NQUAL', draw });
        }
    }

    return result;
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

// export const knockoutValidation: IValidation = ;

export const knockoutValidation = { validateDraw };
