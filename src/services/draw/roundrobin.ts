import type { GenerateType, IDrawLib } from './drawLib';
import type { Player } from '../../domain/player';
import { DrawType, Draw, Box, Match, PlayerIn } from '../../domain/draw';
import { DrawLibBase } from './drawLibBase';
import { indexOf, by } from '../util/find';
import { groupDraw, groupFindPlayerIn, newBox, newDraw, nextGroup } from '../drawService';
import { sortPlayers } from '../tournamentService';

const MIN_COL = 0,
    MAX_COL_POULE = 22,
    MAX_JOUEUR = 8191,
    MAX_TABLEAU = 63,
    QEMPTY = - 1;

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
    boxesOpponents(match: Match): { box1: Box; box2: Box } {
        const n = this.draw.nbColumn;
        const pos1 = seedPositionOpponent1(match.position, n),
            pos2 = seedPositionOpponent2(match.position, n);
        return {
            box1: by(this.draw.boxes, 'position', pos1) as Box,
            box2: by(this.draw.boxes, 'position', pos2) as Box
        }
    }

    /** @override */
    resize(oldDraw?: Draw, nJoueur?: number): void {

        if (nJoueur) {
            throw "Not implemnted";
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
                    || b === diag || (b < diag && this.draw.type === DrawType.PouleSimple)) {
                    this.draw.boxes.splice(i, 1);    //remove the exceeding box
                    continue;
                }

                box.position = b;
            }

            //Append new in players and matches
            if (nCol > nOld) {
                for (let i = nCol - nOld - 1; i >= 0; i--) {

                    let b = ADVERSAIRE1(this.draw, i);
                    const boxIn = newBox<PlayerIn>(this.draw, undefined, b);
                    this.draw.boxes.push(boxIn);

                    //Append the matches
                    const diag = iDiagonalePos(nCol, b);
                    for (b -= nCol; b >= 0; b -= nCol) {
                        if (b === diag || (b < diag && this.draw.type === DrawType.PouleSimple)) {
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
    findPlayerIn(iQualifie: number): PlayerIn | undefined {

        ASSERT(iQualifie >= 0);

        if (!this.draw.boxes) {
            return;
        }

        for (let i = this.draw.boxes.length - 1; i >= 0; i--) {
            const boxIn = this.draw.boxes[i] as PlayerIn;
            if (!boxIn) {
                continue;
            }
            const e = boxIn.qualifIn;
            if (e === iQualifie || (!iQualifie && e)) {
                return boxIn;
            }

        }
    }

    /** @override */
    findPlayerOut(iQualifie: number): Match | undefined {

        ASSERT(0 < iQualifie);

        if (iQualifie === QEMPTY || !this.draw.boxes) {
            return;
        }

        for (let i = 0; i < this.draw.boxes.length; i++) {
            const boxOut = this.draw.boxes[i] as Match;
            if (boxOut && boxOut.qualifOut === iQualifie) {
                return boxOut;
            }
        }
    }

    /** @override */
    setPlayerOut(box: Match, outNumber?: number): boolean { //setPlayerOut
        // outNumber=0 => enlève qualifié

        //ASSERT(setPlayerOutOk(iBoite, outNumber));

        const next = nextGroup(this.event, this.draw);

        //TODOjs findBox()
        const diag = this.draw.boxes[this.iDiagonale(box)];
        const box1 = this.draw.boxes[ADVERSAIRE1(this.draw, box.position)];

        if (outNumber) {	//Ajoute un qualifié sortant
            // //Met à jour le tableau suivant
            // if (next && box.playerId && box.qualifOut) {
            //     const boxIn = this.findPlayerIn(outNumber);
            //     if (boxIn) {
            //         ASSERT(boxIn.playerId === box.playerId);
            //         if (!this.removePlayer(boxIn)) {
            //             ASSERT(false);
            //         }
            //     }
            // }

            //Enlève le précédent n° de qualifié sortant
            if (box.qualifOut)
                if (!this.setPlayerOut(box)) {	//Enlève le qualifié
                    ASSERT(false);
                }

            this.setPlayerOut(box, outNumber);

            diag.playerId = box1.playerId;

            if (next && box.playerId) {
                //Met à jour le tableau suivant
                const [,boxIn] = groupFindPlayerIn(this.event, next, outNumber);
                if (boxIn) {
                    ASSERT(!boxIn.playerId);
                    if (!this.putPlayer(boxIn, box.playerId, undefined, true)) {
                        ASSERT(false);
                    }
                }
            }

        } else {	//Enlève un qualifié sortant
            const match = box as Match;
            if (next && box.playerId && match.qualifOut) {
                //Met à jour le tableau suivant
                const [,boxIn] = groupFindPlayerIn(this.event, next, match.qualifOut);
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
        const [groupStart, groupEnd] = groupDraw(this.event, this.draw);
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
    generateDraw(generate: GenerateType, registeredPlayersOrQ: (Player|number)[]): Draw[] {
        const refDraw = this.draw;

        const [groupStart] = groupDraw(this.event, refDraw);
        let iTableau = indexOf(this.event.draws, 'id', this.event.draws[groupStart].id);
        if (iTableau === -1) {
            iTableau = this.event.draws.length;  //append the draws at the end of the event
        }

        const players: Array<Player|number> = registeredPlayersOrQ;

        //Tri et Mélange les joueurs de même classement
        sortPlayers(players);

        const event = this.event;

        const nDraw = Math.floor((players.length + (refDraw.nbColumn - 1)) / refDraw.nbColumn) || 1;

        if ((event.draws.length + nDraw) >= MAX_TABLEAU) {
            throw ('Maximum refDraw count is reached'); //TODOjs
            //return;
        }

        const draws: Draw[] = [];

        //Créé les poules
        const name = refDraw.name;
        for (let t = 0; t < nDraw; t++) {
            let draw;
            if (t === 0) {
                draw = refDraw;
            } else {
                draw = newDraw(event, refDraw);
                draw.suite = true;
            }
            draw.boxes = [];
            draw.name = name + (nDraw > 1 ? ' (' + (t + 1) + ')' : '');

            for (let i = draw.nbColumn - 1; i >= 0 && players.length; i--) {

                let b = ADVERSAIRE1(draw, i);
                const j = t + (draw.nbColumn - i - 1) * nDraw;

                const boxIn = newBox<PlayerIn>(draw, undefined, b);
                draw.boxes.push(boxIn);

                if (j < players.length) {
                    const qualif = 'number' === typeof players[j] ? players[j] as number : 0;
                    if (qualif) {	//Qualifié entrant
                        if (!this.setPlayerIn(boxIn, qualif)) {
                            return [];
                        }
                    } else if (!this.putPlayer(boxIn, (players[j] as Player).id)) {
                        return [];
                    }
                }

                //Append the matches
                const diag = iDiagonalePos(draw.nbColumn, b);
                for (b -= draw.nbColumn; b >= 0; b -= draw.nbColumn) {
                    if (b === diag || (b < diag && draw.type === DrawType.PouleSimple)) {
                        continue;
                    }
                    const match = newBox<Match>(draw, undefined, b);
                    match.score = '';
                    draw.boxes.push(match);
                }
            }

            //Ajoute 1 tête de série
            const boxT = this.findBox<PlayerIn>(ADVERSAIRE1(draw, draw.nbColumn - 1));
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
        throw "Not implemented";

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
        //        if (boxes[b].m_iJoueur != boxes[v].m_iJoueur) {
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

    isJoueurNouveau(box: Box): boolean {
        throw new Error('Not implemented RoundRobin.isJoueurNouveau');
    }
}

function ASSERT(b: boolean, message?: string): void {
    if (!b) {
        debugger;
        throw message || 'Assertion is false';
    }
}

function column(pos: number, nCol: number): number { //iColPoule
    return Math.floor(pos / nCol);
}

function row(pos: number, nCol: number): number { //iRowPoule
    return pos % nCol;
}

function positionFirstIn(nCol: number): number {
    return nCol * (nCol + 1);
}
function positionLastIn(nCol: number): number {
    return nCol * nCol + 1;
}

function seedPositionOpponent1(pos: number, nCol: number): number {    //POULE_ADVERSAIRE1
    return (pos % nCol) + (nCol * nCol);
}

function seedPositionOpponent2(pos: number, nCol: number): number {    //POULE_ADVERSAIRE2
    return Math.floor(pos / nCol) + (nCol * nCol);
}


function positionMatchPoule(row: number, col: number, nCol: number): number { //IMATCH
    return (col * nCol) + row;
}

function positionResize(pos: number, nColOld: number, nCol: number): number {
    const r = row(pos, nColOld),
        col = column(pos, nColOld);
    return (nCol - nColOld + r) + nCol * (nCol - nColOld + col);
}

// function iDiagonale(box: Box): number {
//     const n = box._draw.nbColumn;
//     return (box.position % n) * (n + 1);
// }
function iDiagonalePos(nbColumn: number, pos: number): number {
    return (pos % nbColumn) * (nbColumn + 1);
}

function ADVERSAIRE1(draw: Draw, pos: number): number {
    const n = draw.nbColumn;
    return pos % n + n * n;
};