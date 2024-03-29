import type { GenerateType, IDrawLib } from './drawLib';
import type { Player } from '../../domain/player';
import { Draw, Match, PlayerIn, ROUNDROBIN } from '../../domain/draw';
import { DrawLibBase } from './drawLibBase';
import { indexOf, by } from '../util/find';
import { groupDraw, groupFindPlayerIn, groupFindPlayerOut, newBox, newDraw, nextGroup } from '../drawService';
import { sortPlayers } from '../tournamentService';
import { ASSERT } from '../../utils/tool';
import { positionOpponent1, iDiagonalePos, positionFirstIn, positionLastIn, positionResize, seedPositionOpponent1, seedPositionOpponent2 } from './roundrobinLib';
import { guid } from '../util/guid';

const MIN_COL = 0,
    MAX_COL_POULE = 22,
    MAX_JOUEUR = 8191,
    MAX_TABLEAU = 63;

/**
     box positions example for nbColumn=3:

           |  11   |  10   |   9   |   row:
    -------+-------+-------+-------+
       11  |-- 8 --|   5   |   2   |     2
    -------+-------+-------+-------+
       10  |   7   |-- 4 --|   1   |     1
    -------+-------+-------+-------+
        9  |   6   |   3   |-- 0 --|     0
    -------+-------+-------+-------+

col: 3      2       1       0
*/
export class Roundrobin extends DrawLibBase implements IDrawLib {

    /** @override */
    nbColumnForPlayers(nJoueur: number): number {
        return nJoueur;
    }

    /** @override */
    boxesOpponents(match: Match): { player1: PlayerIn; player2: PlayerIn } {
        const n = this.draw.nbColumn;
        const pos1 = seedPositionOpponent1(match.position, n),
            pos2 = seedPositionOpponent2(match.position, n);
        return {
            player1: by(this.draw.boxes, 'position', pos1) as PlayerIn,
            player2: by(this.draw.boxes, 'position', pos2) as PlayerIn
        }
    }

    /** @override */
    resize(oldDraw?: Draw, nJoueur?: number): void {

        if (nJoueur) {
            throw new Error("Not implemnted");
        }

        //ASSERT( SetDimensionOk( draw, oldDraw, nPlayer));

        if (oldDraw && this.draw.nbColumn !== oldDraw.nbColumn) {
            const nOld = oldDraw.nbColumn,
                nCol = this.draw.nbColumn,
                maxPos = nCol * (nCol + 1) - 1;

            //Shift the boxes positions
            for (let i = this.draw.boxes.length - 1; i >= 0; i--) {
                const box = this.draw.boxes[i];
                const b = positionResize(box.position, nOld, nCol);

                const diag = iDiagonalePos(nCol, b);
                if (b < 0 || maxPos < b
                    || b === diag || (b < diag && this.draw.type === ROUNDROBIN)) {
                    this.draw.boxes.splice(i, 1);    //remove the exceeding box
                    continue;
                }

                box.position = b;
            }

            //Append new in players and matches
            if (nCol > nOld) {
                for (let i = nCol - nOld - 1; i >= 0; i--) {

                    let b = positionOpponent1(this.draw, i);
                    const boxIn = newBox<PlayerIn>(this.draw, undefined, b);
                    this.draw.boxes.push(boxIn);

                    //Append the matches
                    const diag = iDiagonalePos(nCol, b);
                    for (b -= nCol; b >= 0; b -= nCol) {
                        if (b === diag || (b < diag && this.draw.type === ROUNDROBIN)) {
                            continue;
                        }
                        const match = newBox(this.draw, undefined, b) as Match;
                        match.score = '';
                        this.draw.boxes.push(match);
                    }
                }
            }
        }
    }

    /** @override */
    setPlayerOut(box: Match, outNumber?: number): boolean { //setPlayerOut
        // outNumber=0 => enlève qualifié

        //ASSERT(setPlayerOutOk(iBoite, outNumber));

        const nextGrp = nextGroup(this.event, this.draw.id);

        //TODOjs findBox()
        const diag = this.draw.boxes[this.iDiagonale(box)];
        const box1 = this.draw.boxes[positionOpponent1(this.draw, box.position)];

        if (outNumber) {	//Ajoute un qualifié sortant
            // //Met à jour le tableau suivant
            // if (nextgrp && box.playerId && box.qualifOut) {
            //     const boxIn = findPlayerIn(this.draw, outNumber);
            //     if (boxIn) {
            //         ASSERT(boxIn.playerId === box.playerId);
            //         if (!this.removePlayer(boxIn)) {
            //             ASSERT(false);
            //         }
            //     }
            // }

            //Enlève le précédent n° de qualifié sortant
            if (box.qualifOut)
            {if (!this.setPlayerOut(box)) {	//Enlève le qualifié
                ASSERT(false);
            }}

            this.setPlayerOut(box, outNumber);

            diag.playerId = box1.playerId;

            if (nextGrp && box.playerId) {
                //Met à jour le tableau suivant
                const [boxIn] = groupFindPlayerIn(this.event, nextGrp, outNumber);
                if (boxIn) {
                    ASSERT(!boxIn.playerId);
                    if (!this.putPlayer(boxIn, box.playerId, undefined, true)) {
                        ASSERT(false);
                    }
                }
            }

        } else {	//Enlève un qualifié sortant
            const match = box as Match;
            if (nextGrp && box.playerId && match.qualifOut) {
                //Met à jour le tableau suivant
                const [boxIn] = groupFindPlayerIn(this.event, nextGrp, match.qualifOut);
                if (boxIn) {
                    ASSERT(!!boxIn.playerId && boxIn.playerId === box.playerId);
                    if (!this.removePlayer(boxIn, undefined, true)) {
                        ASSERT(false);
                    }
                }
            }

            delete match.qualifOut;

            diag.playerId = undefined;
        }

        //#ifdef WITH_POULE
        //	if( isTypePoule())
        //		computeScore( (CDocJatennis*)((CFrameTennis*)AfxGetMainWnd()).GetActiveDocument());
        //#endif //WITH_POULE

        return true;
    }

    private GetJoueursTableau(): Array<string|number> {

        //Récupère les joueurs du tableau
        const ppJoueur: Array<string|number> = []; // playerId or Q
        const [groupStart, groupEnd] = groupDraw(this.event, this.draw.id);
        for (let j = groupStart; j < groupEnd; j++) {
            const d = this.event.draws[j];
            const first = positionFirstIn(d.nbColumn),
                last = positionLastIn(d.nbColumn);
            for (let b = last; b <= first; b++) {
                const boxIn = this.findBox<PlayerIn>(b);
                if (!boxIn) {
                    continue;
                }
                //Récupérer les joueurs et les Qualifiés entrants
                if (boxIn.qualifIn) {
                    ppJoueur.push(boxIn.qualifIn);	//no qualifie entrant
                } else if (boxIn.playerId) {
                    ppJoueur.push(boxIn.playerId);	//a player
                }
            }
        }

        return ppJoueur;
    }

    /** @override */
    generateDraw(generate: GenerateType, playersOrQ: Array<Player|number>, prevGroup?: [number,number]): Draw[] {
        const refDraw = this.draw;

        const [groupStart] = groupDraw(this.event, refDraw.id);
        let iTableau = indexOf(this.event.draws, 'id', this.event.draws[groupStart].id);
        if (iTableau === -1) {
            iTableau = this.event.draws.length;  //append the draws at the end of the event
        }

        const players: Array<Player|number> = playersOrQ;

        //Tri et Mélange les joueurs de même classement
        sortPlayers(players);

        const event = this.event;

        const nDraw = Math.floor((players.length + (refDraw.nbColumn - 1)) / refDraw.nbColumn) || 1;

        if ((event.draws.length + nDraw) >= MAX_TABLEAU) {
            throw new Error('Maximum refDraw count is reached'); //TODOjs
            //return;
        }

        const draws: Draw[] = [];

        //Créé les poules
        const name = refDraw.name;
        for (let t = 0; t < nDraw; t++) {
            let draw: Draw;
            if (t === 0) {
                draw = refDraw as Draw;
                if (!draw.id) {
                    draw.id = guid('d');
                }
            } else {
                draw = newDraw(event, refDraw);
                draw.cont = true;
            }
            draw.boxes = [];
            draw.name = name + (nDraw > 1 ? ' (' + (t + 1) + ')' : '');

            for (let i = draw.nbColumn - 1; i >= 0 && players.length; i--) {

                let b = positionOpponent1(draw, i);
                const j = t + (draw.nbColumn - i - 1) * nDraw;

                const boxIn = newBox<PlayerIn>(draw, undefined, b);
                draw.boxes.push(boxIn);

                if (j < players.length) {
                    const qualif = typeof players[j] === 'number' ? players[j] as number : 0;
                    if (qualif) {	//Qualifié entrant
                        const [match] = groupFindPlayerOut(this.event, prevGroup ?? [0,0], qualif);
                        const playerId = match?.playerId;
                        this.setPlayerIn(boxIn, qualif, playerId);
                    } else {
                        this.putPlayer(boxIn, (players[j] as Player).id);
                    }
                }

                //Append the matches
                const diag = iDiagonalePos(draw.nbColumn, b);
                for (b -= draw.nbColumn; b >= 0; b -= draw.nbColumn) {
                    if (b === diag || (b < diag && draw.type === ROUNDROBIN)) {
                        continue;
                    }
                    const match = newBox<Match>(draw, undefined, b);
                    match.score = '';
                    draw.boxes.push(match);
                }
            }

            //Ajoute 1 tête de série
            const boxT = this.findBox<PlayerIn>(positionOpponent1(draw, draw.nbColumn - 1));
            if (boxT) {
                boxT.seeded = t + 1;
            }

            draws.push(draw);
        }

        return draws;
    }

    //Calcul classement des poules
    /** @override */
    computeScore(): boolean {

        //TODO
        throw new Error("Not implemented");

        // const m_pOrdrePoule: Ranking[];    //classement de chaque joueur de la poule

        //this.ranking.

        //for (let b = 0; b < draw.nbColumn; b++) {

        //    if (m_pOrdrePoule[b])
        //        m_pOrdrePoule[b].Release();	//V0997

        //    //		if( !m_pOrdrePoule[ b])
        //    m_pFactT.CreateObject(IID_OrdrePoule, (LPLPUNKNOWNJ) & m_pOrdrePoule[b]);
        //    ASSERT( m_pOrdrePoule[ b]);

        //    pB = boxes[ADVERSAIRE1(b)];
        //    pB.m_iClassement = 0;
        //    iPlace[b] = ADVERSAIRE1(b);	//v1.12.1	//(char)ADVERSAIRE1( b);	//b;	//(m_nColonne-1 - b);
        //}

        //if (!draw || !m_pOrdrePoule[0]) {
        //    return false;
        //}

        ////ASSERT(m_pFactT == pDoc.m_pFactD);

        //const e = draw._event;

        //for (let b = iBoiteMin(); b < iBasColQ(m_nColonne); b++) {

        //    if (isMatch(b) && isMatchJoue(b)) {
        //        bJoue = TRUE;

        //        ASSERT(!boxes[b].m_Score.isVainqDef());

        //        const v = ADVERSAIRE1(b);
        //        const d = ADVERSAIRE2(b);
        //        if (boxes[b].m_iJoueur !== boxes[v].m_iJoueur) {
        //            v += d; d = v - d; v -= d;	//swap
        //        }
        //        //v: vainqueur  d:défait

        //        m_pOrdrePoule[v % draw.nbColumn].AddResultat(1, boxes[b].m_Score, boxes[b].FormatMatch());

        //        m_pOrdrePoule[d % draw.nbColumn].AddResultat(-1, boxes[b].m_Score, boxes[b].FormatMatch());

        //    }
        //}

        ////Calcul le classement
        //if (bJoue) {
        //    gpTableau = this;
        //    qsort( &iPlace, m_nColonne, sizeof(IBOITE), (int(__cdecl *)(const void *,const void *))compareScorePoule);	//v1.12.1
        //    gpTableau = NULL;

        //    for (b = 0; b < m_nColonne; b++) {
        //        boxes[iPlace[b]].m_iClassement = m_nColonne - (char) b;
        //    }
        //}

        return true;
    }

    isNewPlayer(/* box: Box */): boolean {
        throw new Error('Not implemented RoundRobin.isJoueurNouveau');
    }
}
