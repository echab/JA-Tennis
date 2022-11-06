/* eslint-disable no-bitwise */
import { columnMax, column, positionTopCol, positionOpponent1, positionMax, positionBottomCol } from './knockoutLib';
import { findGroupQualifOuts, findSeeded, groupDraw, groupFindPlayerOut, isMatch, isPlayerIn, nextGroup, previousGroup } from '../drawService';
import { indexOf, byId } from '../util/find';
import { category, rank, score } from '../types';
import { Draw, Box, Match, PlayerIn, QEMPTY, FINAL, KNOCKOUT } from '../../domain/draw';
import { RankString } from '../../domain/types';
import { TEvent, Tournament } from '../../domain/tournament';
import { isRegistred, isSexeCompatible } from '../tournamentService';
import { MINUTES } from '../../utils/date';
import { drawLib } from './drawLib';
import { DrawProblem } from '../../domain/validation';
import { ASSERT } from '../../utils/tool';
import { dayOf, matchesByDays } from '../planningService';

const MAX_TETESERIE = 32,
    MAX_QUALIF = 32,
    MAX_MATCHJOUR = 16;

function validateGroup(event: TEvent, draw: Draw): DrawProblem[] {
    const result: DrawProblem[] = [];

    if (draw.cont) {
        const iTableau = indexOf(event.draws, 'id', draw.id);
        if (iTableau === 0 /* || !draw._previous */) {
            result.push({ message: 'ERR_TAB_SUITE_PREMIER', draw });
        }

        const [groupStart] = groupDraw(event, draw);
        const firstDraw = event.draws[groupStart];
        if (draw.type !== firstDraw.type) {
            result.push({ message: 'ERR_TAB_SUITE_TYPE', draw });
        }
        if (draw.minRank !== firstDraw.minRank) {
            result.push({ message: 'ERR_TAB_SUITE_MIN', draw });
        }
        if (draw.maxRank !== firstDraw.maxRank) {
            result.push({ message: 'ERR_TAB_SUITE_MAX', draw });
        }
    }

    const prevGroup = previousGroup(event, draw);
    if (prevGroup) {
        const firstDraw = event.draws[prevGroup[0]];
        if (firstDraw.type !== FINAL && draw.minRank && firstDraw.maxRank) {
            if (rank.compare(draw.minRank, firstDraw.maxRank) < 0) {
                result.push({ message: 'ERR_TAB_CLASSMAX_OVR', draw });
            }
        }
    }

    const nextGrp = nextGroup(event, draw);
    if (nextGrp) {
        const firstDraw = event.draws[nextGrp[0]];
        if (draw.type !== FINAL && draw.maxRank && firstDraw.minRank) {
            if (rank.compare(firstDraw.minRank, draw.maxRank) < 0) {
                result.push({ message: 'ERR_TAB_CLASSMAX_NEXT_OVR', draw });
            }
        }
    }

    if (!draw.cont) {
        const group = groupDraw(event, draw);
        const qualifOuts = findGroupQualifOuts(event, group).map(([q]) => q).sort((a, b) => a - b).filter((q) => q !== QEMPTY);
        if (qualifOuts.length) {
            const missing: string[] = [];
            for (let e = 1; e <= qualifOuts.at(-1)!; e++) {
                if (!qualifOuts.includes(e)) {
                    missing.push(`Q${e}`);
                }
            }
            if (missing.length) {
                result.push({ message: 'ERR_TAB_SORTANT_NO', draw, detail: missing.join(' ') });
            }
        }
    }

    return result;
}

function validateMatches(draw: Draw): DrawProblem[] {
    const result: DrawProblem[] = [];

    return result;
}

function validateDraw(tournament: Tournament, event: TEvent, draw: Draw): DrawProblem[] {
    const result: DrawProblem[] = [];
    const players = tournament.players;
    let nqe = 0;
    let nqs = 0;
    const isTypePoule = draw.type >= 2;
    const lib = drawLib(event, draw);

    if (draw.type !== KNOCKOUT
        && draw.type !== FINAL) {
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
        const {player1, player2 } = lib.boxesOpponents(match);
        return !!match.playerId && !!player1.playerId && !!player2.playerId;
    };

    const isMatchJouable = (match: Box): boolean => {
        if (!isMatch(match)) {
            return false;
        }
        const {player1, player2 } = lib.boxesOpponents(match);
        return !match.playerId && !!player1.playerId && !!player2.playerId;
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

    const colMax = columnMax(draw.nbColumn, draw.nbOut);
    const pClastMaxCol: RankString[] = new Array(colMax + 1);
    pClastMaxCol[colMax] = 'NC';    //pClastMaxCol[colMax].Start(); pClastMaxCol[colMax].Next();

    //Match avec deux joueurs gagné par un des deux joueurs
    for (const box of draw.boxes) {
        const boxIn = isPlayerIn(box) ? box : undefined;
        const match = isMatch(box) ? box : undefined;
        const b = box.position;

        //ASSERT(-1 <= box.playerId && box.playerId < tournament.players.length);
        //Joueur inscrit au tableau ?

        const c = column(b);
        if (b === positionTopCol(c)) {
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
        if (player && boxIn && lib.isNewPlayer(boxIn) && !boxIn.qualifIn) {

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

            ASSERT(positionOpponent1(b) <= positionMax(draw.nbColumn, draw.nbOut));

            const { player1, player2 } = lib.boxesOpponents(match);

            ASSERT(!!player1 && !!player2);

            if (!match.score) {

                if (match.playerId) {
                    result.push({ message: 'ERR_VAINQ_SCORE_NO', draw, box: match, player, detail: player?.name });
                }

            } else {
                ASSERT(b < positionBottomCol(draw.nbColumn, draw.nbOut)); //Pas de match colonne de gauche

                if (!match.playerId) {
                    result.push({ message: 'ERR_SCORE_VAINQ_NO', draw, box: match });
                }

                if (!score.isValid(match.score)) {
                    result.push({ message: 'ERR_SCORE_BAD', draw, box: match, player, detail: match.score as string });
                }

                //ASSERT( boxes[ i].playerId==-1 || player.isInscrit( tournament.FindEpreuve( this)) );
                ASSERT(column(b) < colMax);
                if (!player1.playerId || !player2.playerId) {
                    result.push({ message: 'ERR_MATCH_JOUEUR_NO', draw, box: match });

                } else if (player1.playerId !== match.playerId
                    && player2.playerId !== match.playerId) {
                    result.push({ message: 'ERR_VAINQUEUR_MIS', draw, box: match, player });
                }
            }

            if (!isMatchJoue(match)) {

                const p1 = byId(players, player1.playerId);
                const p2 = byId(players, player2.playerId);

                //match before opponent 2
                const opponent1 = lib.boxesOpponents(player1 as Match);
                const opponent2 = lib.boxesOpponents(player2 as Match);

                const player21 = byId(players, opponent2.player1?.playerId);
                const player22 = byId(players, opponent2.player2?.playerId);

                const player11 = byId(players, opponent1.player1?.playerId);
                const player12 = byId(players, opponent1.player2?.playerId);

                if (p1) {
                    if (p2) {
                        if (!CompString(p1.club, p2.club)) {
                            result.push({ message: 'ERR_MEME_CLUB1', draw, box: match, player, detail: p1.club });
                        }
                    } else if (isMatchJouable(player2)) { //!isTypePoule &&

                        if (!CompString(p1.club, player21?.club)) {
                            result.push({ message: 'ERR_MEME_CLUB2', draw, box: match, player, detail: p1.club });
                        } else if (!CompString(p1.club, player22?.club)) {
                            result.push({ message: 'ERR_MEME_CLUB2', draw, box: match, player, detail: p1.club });
                        }
                    }
                } else if (isTypePoule) {
                    //TODO Poule
                } else if (p2) {
                    if (isMatchJouable(player1)) {
                        if (!CompString(p2.club, player11?.club)) {
                            result.push({ message: 'ERR_MEME_CLUB2', draw, box: match, player, detail: p2.club });
                        } else if (!CompString(p2.club, player12?.club)) {
                            result.push({ message: 'ERR_MEME_CLUB2', draw, box: match, player, detail: p2.club });
                        }
                    }
                } else if (isMatchJouable(player1) && isMatchJouable(player2)) {
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

                if (tournament.info.start && tournament.info.end) {
                    const day = dayOf(match.date, tournament.info);
                    if (isFinite(day)) {
                        const dayMatches = matchesByDays(tournament)[day];
                        ASSERT(dayMatches && dayMatches.length <= MAX_MATCHJOUR);

                        for (let m = dayMatches.length - 1; m >= 0; m--) {
                            const match2 = dayMatches[m].match;

                            if (match2.position !== match.position
                                && match2.place === match.place
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

                //TODO 00/07/27: Date d'un match après les matches précédents (au moins 3 heures) ça test pas bien à tous les coups
                //TODO 00/12/20: Dans tous les tableaux où le joueur est inscrit, date des matches différentes pour un même joueur
                ASSERT(positionOpponent1(b) <= positionMax(draw.nbColumn, draw.nbOut));

                //DONE 01/08/19 (00/12/20): Dans Poule, date des matches différentes pour un même joueur

                if (match.date) {

                    //if (!isTypePoule) {
                    const match1 = player1 as Match;
                    const match2 = player2 as Match;

                    if (isMatch(player1)
                        && match1.date) {
                        if (match.date < match1.date) {
                            result.push({ message: 'ERR_DATE_MATCHS', draw, box: match, player, detail: match.date.toDateString() });
                        } else if (match.date.getTime() < (match1.date.getTime() + ((tournament.info.slotLength * MINUTES) << 1))) {
                            result.push({ message: 'ERR_DATE_MATCHS', draw, box: match, player, detail: match.date.toDateString() });
                        }
                    }

                    if (isMatch(player2) && match2.date) {
                        if (match.date < match2.date) {
                            result.push({ message: 'ERR_DATE_MATCHS', draw, box: match, player, detail: match.date.toDateString() });
                        } else if (match.date.getTime() < (match2.date.getTime() + ((tournament.info.slotLength * MINUTES) << 1))) {
                            result.push({ message: 'ERR_DATE_MATCHS', draw, box: match, player, detail: match.date.toDateString() });
                        }
                    }
                    //}

                    if (!match.playerId && match.place === undefined && tournament.places?.length
                    //  && tournament._dayCount
                    ) {
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
            if (e && e !== QEMPTY) {
                nqe++;

                ASSERT(!isTypePoule || (b >= positionBottomCol(draw.nbColumn, draw.nbOut)));	//Qe que dans colonne de gauche

                const iTableau = indexOf(event.draws, 'id', draw.id);
                if (iTableau === 0) {
                    result.push({ message: 'ERR_TAB_ENTRANT_TAB1', draw, box: boxIn, player, detail: `Q${e}` });
                }
                //ASSERT( iTableau !== 0);

                //DONE 00/03/07: CTableau, qualifié entrant en double
                let j: Box | undefined;
                if (!draw.cont && (j = lib.findPlayerIn(e)) && (j.position !== b)) {
                    result.push({ message: 'ERR_TAB_ENTRANT_DUP', draw, box: boxIn, player });
                }

                const prevGroup = previousGroup(event, draw);
                if (prevGroup) {
                    //DONE 00/03/07: CTableau, les joueurs qualifiés entrant et sortant correspondent
                    const [, m] = groupFindPlayerOut(event, prevGroup, e);
                    if (!m) {
                        result.push({ message: 'ERR_TAB_ENTRANT_PREC_NO', draw, box: boxIn, player });
                    } else if (m.playerId !== boxIn.playerId) {
                        result.push({ message: 'ERR_TAB_ENTRANT_PREC_MIS', draw, box: boxIn, player });
                    }
                }
            }
        }

        if (match) {
            const e = match.qualifOut;
            if (e) {
                nqs++;

                //ASSERT(!isTypePoule || (b === iDiagonale(b)));	//Qs que dans diagonale des poules

                //DONE 00/03/07: CTableau, qualifié sortant en double
                const j = lib.findPlayerOut(e);
                if (j && (j.position !== b)) {
                    result.push({ message: 'ERR_TAB_SORTANT_DUP', draw, box: match, player, detail: `Q${e}` });
                }

                if (draw.type === FINAL) {
                    result.push({ message: 'ERR_TAB_SORTANT_FINAL', draw, box, player, detail: `Q${e}` });
                }
                /*
                pSuite = getSuivant();
                if( pSuite && (j = pSuite.findPlayerIn( e, &pSuite)) !== -1) {
                    if( boxes[ i].playerId !== pSuite.boxes[ j].playerId) {
                        result.push({message:'ERR_TAB_ENTRANT_PREC_MIS', tournament.events[ iEpreuve].FindTableau( pSuite}), j);
                    }
                }
                */
            }
        }

    }

    //Check Têtes de série
    //	if( !isTypePoule)
    if (!draw.cont) {
        for (let e2 = 0, e = 1; e <= MAX_TETESERIE; e++) {
            const [d, boxIn] = findSeeded(event, draw, e);
            if (boxIn && d) {
                if (e > e2 + 1) {
                    result.push({ message: 'ERR_TAB_TETESERIE_NO', draw: d, box: boxIn, detail: 'Seeded ' + e });
                }

                if (isMatch(boxIn)) {
                    result.push({ message: 'ERR_TAB_TETESERIE_ENTRANT', draw: d, box: boxIn, detail: 'Seeded ' + e });
                }

                for (const box of draw.boxes) {
                    const boxIn2 = box as PlayerIn;
                    if (boxIn2.seeded === e && boxIn2.position !== boxIn.position) {
                        result.push({ message: 'ERR_TAB_TETESERIE_DUP', draw: d, box: boxIn, detail: 'Seeded ' + e });
                    }
                }

                e2 = e;
            }
        }
    }

    //Tous les qualifiés sortants du tableau précédent sont utilisés
    if (!draw.cont) {
        const prevGroup = previousGroup(event, draw);
        if (prevGroup) {
            const qualifOuts = findGroupQualifOuts(event, prevGroup).filter(([q]) => q !== QEMPTY);
            const missing = qualifOuts.filter(([q]) => !lib.findPlayerIn(q)).map(([q]) => `Q${q}`);
            if (missing.length) {
                result.push({ message: 'ERR_TAB_SORTANT_PREC_NO', draw, detail: missing.join(' ') });
            }
        }
    }

    if (isTypePoule && nqs < draw.nbOut) {
        result.push({ message: 'ERR_POULE_SORTANT_NO', draw });
    }

    if (draw.type === FINAL) {
        const [, groupEnd] = groupDraw(event, draw);
        if (draw.cont || event.draws[groupEnd - 1]?.id !== draw.id) {
            result.push({ message: 'ERR_TAB_SUITE_FINAL', draw });
        }

        if (draw.nbOut !== 1) {
            result.push({ message: 'ERR_TAB_FINAL_NQUAL', draw });
        }
    }

    return result;
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
    return u === v ? 0 : u < v ? -1 : 1;
}

// export const knockoutValidation: IValidation = ;

export const knockoutValidation = { validateDraw };
