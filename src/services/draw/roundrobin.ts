import { DrawLibBase } from './drawLibBase';
import { indexOf, by } from '../util/find';
import { shuffle,filledArray } from '../../utils/tool';
import { rank, ranking } from '../types'
import { DrawType, Draw, Box, Match } from '../../domain/draw';
import { drawLib, GenerateType, IDrawLib } from './drawLib';
import { PlayerIn, Player } from '../../domain/player';
import { Ranking } from '../../domain/types';
import { groupDraw, groupFindAllPlayerOut, groupFindPlayerIn, groupFindPlayerOut, newBox, newDraw, nextGroup, previousGroup } from '../drawService';
import { sortPlayers } from '../tournamentService';
import { TEvent } from '../../domain/tournament';

var MIN_COL = 0,
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

    private findBox(position: number, create?: boolean): Box | undefined {
        var box = by(this.draw.boxes, 'position', position);
        if (!box && create) {
            box = newBox(this.draw, undefined, position);
        }
        return box;
    }

    /** @override */
    nbColumnForPlayers(nJoueur: number): number {
        return nJoueur;
    }

    /** @override */
    boxesOpponents(match: Match): { box1: Box; box2: Box } {
        var n = this.draw.nbColumn;
        var pos1 = seedPositionOpponent1(match.position, n),
            pos2 = seedPositionOpponent2(match.position, n);
        return {
            box1: < Box > by(this.draw.boxes, 'position', pos1),
            box2: <Box> by(this.draw.boxes, 'position', pos2)
        }
    }

    /** @override */
    resize(oldDraw?: Draw, nJoueur?: number): void {

        if (nJoueur) {
            throw "Not implemnted";
        }
        
        //ASSERT( SetDimensionOk( draw, oldDraw, nPlayer));

        if (oldDraw && this.draw.nbColumn !== oldDraw.nbColumn) {
            var nOld = oldDraw.nbColumn,
                nCol = this.draw.nbColumn,
                maxPos = nCol * (nCol + 1) - 1;

            //Shift the boxes positions
            for (var i = this.draw.boxes.length - 1; i >= 0; i--) {
                var box = this.draw.boxes[i];
                var b = positionResize(box.position, nOld, nCol);

                var diag = iDiagonalePos(nCol, b);
                if (b < 0 || maxPos < b
                    || b === diag || (b < diag && this.draw.type === DrawType.PouleSimple)) {
                    this.draw.boxes.splice(i, 1);    //remove the exceeding box
                    continue;
                }

                box.position = b;
            }

            //Append new in players and matches
            if (nCol > nOld) {
                for (var i = nCol - nOld - 1; i >= 0; i--) {

                    var b = ADVERSAIRE1(this.draw, i);
                    var boxIn = <PlayerIn>newBox(this.draw, undefined, b);
                    this.draw.boxes.push(boxIn);

                    //Append the matches
                    var diag = iDiagonalePos(nCol, b);
                    for (b -= nCol; b >= 0; b -= nCol) {
                        if (b === diag || (b < diag && this.draw.type === DrawType.PouleSimple)) {
                            continue;
                        }
                        var match = <Match>newBox(this.draw, undefined, b);
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

        for (var i = this.draw.boxes.length - 1; i >= 0; i--) {
            var boxIn = <PlayerIn>this.draw.boxes[i];
            if (!boxIn) {
                continue;
            }
            var e = boxIn.qualifIn;
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

        for (var i = 0; i < this.draw.boxes.length; i++) {
            var boxOut = <Match>this.draw.boxes[i];
            if (boxOut && boxOut.qualifOut === iQualifie) {
                return boxOut;
            }
        }
    }

    /** @override */
    setPlayerIn(box: PlayerIn, inNumber?: number, playerId?: string): boolean { //setPlayerIn
        // inNumber=0 => enlève qualifié

        // var draw = box._draw;
        //ASSERT(setPlayerInOk(iBoite, inNumber, iJoueur));

        if (inNumber) {	//Ajoute un qualifié entrant
            var prev = previousGroup(this.draw);
            if (!playerId && prev && inNumber != QEMPTY) {
                //Va chercher le joueur dans le tableau précédent
                var [d,boxOut] = groupFindPlayerOut(this.event, prev, inNumber);
                if (boxOut) {	//V0997
                    playerId = boxOut.playerId;
                }
            }

            if (box.qualifIn) {
                if (!this.setPlayerIn(box)) {	//Enlève le précédent qualifié
                    ASSERT(false);
                }
            }

            if (playerId) {
                if (!this.putPlayer(box, playerId)) {
                    ASSERT(false);
                }
            }

            //Qualifié entrant pas déjà pris
            if (inNumber == QEMPTY ||
                !this.findPlayerIn(inNumber)) {

                this.setPlayerIn(box, inNumber);
            }
        } else {	// Enlève un qualifié entrant

            box.qualifIn = 0;

            if (previousGroup(this.draw) && !this.removePlayer(box)) {
                ASSERT(false);
            }
        }

        return true;
    }

    /** @override */
    setPlayerOut(box: Match, outNumber?: number): boolean { //setPlayerOut
        // outNumber=0 => enlève qualifié

        //ASSERT(setPlayerOutOk(iBoite, outNumber));

        var next = nextGroup(this.draw);

        //TODOjs findBox()
        var diag = this.draw.boxes[this.iDiagonale(box)];
        var box1 = this.draw.boxes[ADVERSAIRE1(this.draw, box.position)];

        if (outNumber) {	//Ajoute un qualifié sortant
            //Met à jour le tableau suivant
            if (next && box.playerId && box.qualifOut) {
                var boxIn = this.findPlayerIn(outNumber);
                if (boxIn) {
                    ASSERT(boxIn.playerId === box.playerId);
                    if (!this.removePlayer(boxIn)) {
                        ASSERT(false);
                    }
                }
            }

            //Enlève le précédent n° de qualifié sortant
            if (box.qualifOut)
                if (!this.setPlayerOut(box)) {	//Enlève le qualifié
                    ASSERT(false);
                }

            this.setPlayerOut(box, outNumber);

            diag.playerId = box1.playerId;

            if (next && box.playerId) {
                //Met à jour le tableau suivant
                const [d,boxIn] = groupFindPlayerIn(this.event, next, outNumber);
                if (boxIn && d) {
                    ASSERT(!boxIn.playerId);
                    const lib = drawLib(this.event, d);
                    if (!lib.putPlayer(boxIn, box.playerId, true)) {
                        ASSERT(false);
                    }
                }
            }

        } else {	//Enlève un qualifié sortant
            var match = <Match>box;
            if (next && box.playerId && match.qualifOut) {
                //Met à jour le tableau suivant
                const [d,boxIn] = groupFindPlayerIn(this.event, next, match.qualifOut);
                if (boxIn && d) {
                    ASSERT(!!boxIn.playerId && boxIn.playerId === box.playerId);
                    const lib = drawLib(this.event, d);
                    if (!lib.removePlayer(boxIn, true)) {
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
        const draws = groupDraw(this.draw);
        for (let j = 0; j < draws.length; j++) {
            const d = draws[j];
            const first = positionFirstIn(d.nbColumn),
                last = positionLastIn(d.nbColumn);
            for (let b = last; b <= first; b++) {
                const boxIn = <PlayerIn>this.findBox(b);
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

        var oldDraws = groupDraw(refDraw);
        var iTableau = indexOf(this.event.draws, 'id', oldDraws[0].id);
        if (iTableau === -1) {
            iTableau = this.event.draws.length;  //append the draws at the end of the event
        }

        var players: Array<Player|number> = registeredPlayersOrQ;

        //Tri et Mélange les joueurs de même classement
        sortPlayers(players);

        var event = this.event;

        var nDraw = Math.floor((players.length + (refDraw.nbColumn - 1)) / refDraw.nbColumn);
        if (!nDraw) {
            nDraw = 1;
        }

        if ((event.draws.length + nDraw) >= MAX_TABLEAU) {
            throw ('Maximum refDraw count is reached'); //TODOjs
            //return;
        }

        var draws: Draw[] = [];

        //Créé les poules
        var name = refDraw.name;
        for (var t = 0; t < nDraw; t++) {

            if (t === 0) {
                var draw = refDraw;
            } else {
                draw = newDraw(event, refDraw);
                draw.suite = true;
            }
            draw.boxes = [];
            draw.name = name + (nDraw > 1 ? ' (' + (t + 1) + ')' : '');

            for (var i = draw.nbColumn - 1; i >= 0 && players.length; i--) {

                var b = ADVERSAIRE1(draw, i);
                var j = t + (draw.nbColumn - i - 1) * nDraw;

                var boxIn = <PlayerIn>newBox(draw, undefined, b);
                draw.boxes.push(boxIn);

                if (j < players.length) {
                    var qualif = 'number' === typeof players[j] ? <number>players[j] : 0;
                    if (qualif) {	//Qualifié entrant
                        if (!this.setPlayerIn(boxIn, qualif)) {
                            return [];
                        }
                    } else if (!this.putPlayer(boxIn, (players[j] as Player).id)) {
                        return [];
                    }
                }

                //Append the matches
                var diag = iDiagonalePos(draw.nbColumn, b);
                for (b -= draw.nbColumn; b >= 0; b -= draw.nbColumn) {
                    if (b === diag || (b < diag && draw.type === DrawType.PouleSimple)) {
                        continue;
                    }
                    var match = <Match>newBox(draw, undefined, b);
                    match.score = '';
                    draw.boxes.push(match);
                }
            }

            //Ajoute 1 tête de série
            var boxT = <PlayerIn>this.findBox(ADVERSAIRE1(draw, draw.nbColumn - 1));
            boxT.seeded = t + 1;

            draws.push(draw);
        }

        return draws;
    }

    //Calcul classement des poules
    /** @override */
    computeScore(): boolean {

        //TODO
        throw "Not implemented";

        var m_pOrdrePoule: Ranking[];    //classement de chaque joueur de la poule

        //this.ranking.

        //for (var b = 0; b < draw.nbColumn; b++) {

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

        //var e = draw._event;

        //for (var b = iBoiteMin(); b < iBasColQ(m_nColonne); b++) {

        //    if (isMatch(b) && isMatchJoue(b)) {
        //        bJoue = TRUE;

        //        ASSERT(!boxes[b].m_Score.isVainqDef());

        //        var v = ADVERSAIRE1(b);
        //        var d = ADVERSAIRE2(b);
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
    var r = row(pos, nColOld),
        col = column(pos, nColOld);
    return (nCol - nColOld + r) + nCol * (nCol - nColOld + col);
}

// function iDiagonale(box: Box): number {
//     var n = box._draw.nbColumn;
//     return (box.position % n) * (n + 1);
// }
function iDiagonalePos(nbColumn: number, pos: number): number {
    return (pos % nbColumn) * (nbColumn + 1);
}

function ADVERSAIRE1(draw: Draw, pos: number): number {
    var n = draw.nbColumn;
    return pos % n + n * n;
};