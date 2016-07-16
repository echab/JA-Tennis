import { DrawLibBase,IDrawLib } from './drawLibBase';
import { DrawLib } from './drawLib';
import { KnockoutLib } from './knockoutLib';
import { TournamentLib } from '../tournamentLib';
import {Find} from '../util/Find';
import {Guid} from '../util/Guid';
import { TEvent } from '../../models/tournament';
import { Draw,Match,Box,ISize,IPoint } from '../../models/draw';
import { Player,PlayerIn } from '../../models/player';
import { DrawType } from '../../models/enums';
import { Rank,Ranking } from '../../models/types';
import { GenerateType } from '../../models/enums';
import { isObject,isArray,extend } from '../util/object'
import { shuffle } from '../../utils/tool';
import { Services } from '../services';
import { filledArray } from '../../utils/tool'

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

    constructor(
        drawLib: DrawLib,
        private tournamentLib: TournamentLib,
        private ranking: Ranking,
        rank: Rank,
        find: Find,
        guid: Guid
        ) {
        super(drawLib, rank);
        Services.registerDrawlib(this, DrawType.PouleSimple);
        Services.registerDrawlib(this, DrawType.PouleAR);
    }

    private findBox(draw: Draw, position: number, create?: boolean): Box {
        var box = Find.by(draw.boxes, 'position', position);
        if (!box && create) {
            box = this.drawLib.newBox(draw, undefined, position);
        }
        return box;
    }

    //Override
    public nbColumnForPlayers(draw: Draw, nJoueur: number): number {
        return nJoueur;
    }

    //Override
    public boxesOpponents(match: Match): { box1: Box; box2: Box } {
        var n = match._draw.nbColumn;
        var pos1 = seedPositionOpponent1(match.position, n),
            pos2 = seedPositionOpponent2(match.position, n);
        return {
            box1: < Box > Find.by(match._draw.boxes, 'position', pos1),
            box2: <Box> Find.by(match._draw.boxes, 'position', pos2)
        }
    }

    //Override
    public getSize(draw: Draw): ISize {

        if (!draw.nbColumn) {
            return { width: 1, height: 1 };
        }

        var n = draw.nbColumn;
        return {
            width: (n + 1), // * (dimensions.boxWidth + dimensions.interBoxWidth) - dimensions.interBoxWidth,
            height: n   // * (dimensions.boxHeight + dimensions.interBoxHeight) - dimensions.interBoxHeight
        };
    }

    //Override
    public computePositions(draw: Draw): IPoint[] {
        //nothing to do for round robin
        return;
    }

    //Override
    public resize(draw: Draw, oldDraw?: Draw, nJoueur?: number): void {

        if (nJoueur) {
            throw "Not implemnted";
        }
        
        //ASSERT( SetDimensionOk( draw, oldDraw, nPlayer));

        if (oldDraw && draw.nbColumn !== oldDraw.nbColumn) {
            var nOld = oldDraw.nbColumn,
                nCol = draw.nbColumn,
                maxPos = nCol * (nCol + 1) - 1;

            //Shift the boxes positions
            for (var i = draw.boxes.length - 1; i >= 0; i--) {
                var box = draw.boxes[i];
                var b = positionResize(box.position, nOld, nCol);

                var diag = iDiagonalePos(nCol, b);
                if (b < 0 || maxPos < b
                    || b === diag || (b < diag && draw.type === DrawType.PouleSimple)) {
                    draw.boxes.splice(i, 1);    //remove the exceeding box
                    continue;
                }

                box.position = b;
            }

            //Append new in players and matches
            if (nCol > nOld) {
                for (var i = nCol - nOld - 1; i >= 0; i--) {

                    var b = ADVERSAIRE1(draw, i);
                    var boxIn = <PlayerIn>this.drawLib.newBox(draw, undefined, b);
                    draw.boxes.push(boxIn);

                    //Append the matches
                    var diag = iDiagonalePos(nCol, b);
                    for (b -= nCol; b >= 0; b -= nCol) {
                        if (b === diag || (b < diag && draw.type === DrawType.PouleSimple)) {
                            continue;
                        }
                        var match = <Match>this.drawLib.newBox(draw, undefined, b);
                        match.score = '';
                        draw.boxes.push(match);
                    }
                }
            }
        }
    }

    //Override
    public findPlayerIn(draw: Draw, iQualifie: number): PlayerIn {

        ASSERT(iQualifie >= 0);

        if (!draw.boxes) {
            return;
        }

        for (var i = draw.boxes.length - 1; i >= 0; i--) {
            var boxIn = <PlayerIn>draw.boxes[i];
            if (!boxIn) {
                continue;
            }
            var e = boxIn.qualifIn;
            if (e === iQualifie || (!iQualifie && e)) {
                return boxIn;
            }

        }
    }

    //Override
    public findPlayerOut(draw: Draw, iQualifie: number): Match {

        ASSERT(0 < iQualifie);

        if (iQualifie === QEMPTY || !draw.boxes) {
            return;
        }

        for (var i = 0; i < draw.boxes.length; i++) {
            var boxOut = <Match>draw.boxes[i];
            if (boxOut && boxOut.qualifOut === iQualifie) {
                return boxOut;
            }
        }
    }

    //Override
    public setPlayerIn(box: PlayerIn, inNumber?: number, player?: Player): boolean { //setPlayerIn
        // inNumber=0 => enlève qualifié

        var draw = box._draw;
        //ASSERT(setPlayerInOk(iBoite, inNumber, iJoueur));

        if (inNumber) {	//Ajoute un qualifié entrant
            var prev = this.drawLib.previousGroup(draw);
            if (!player && prev && inNumber != QEMPTY) {
                //Va chercher le joueur dans le tableau précédent
                var boxOut = this.drawLib.groupFindPlayerOut(prev, inNumber);
                if (isObject(boxOut)) {	//V0997
                    player = boxOut._player;
                }
            }

            if (box.qualifIn) {
                if (!this.setPlayerIn(box)) {	//Enlève le précédent qualifié
                    ASSERT(false);
                }
            }

            if (player) {
                if (!this.putPlayer(box, player)) {
                    ASSERT(false);
                }
            }

            //Qualifié entrant pas déjà pris
            if (inNumber == QEMPTY ||
                !this.findPlayerIn(draw, inNumber)) {

                this.setPlayerIn(box, inNumber);
            }
        } else {	// Enlève un qualifié entrant

            box.qualifIn = 0;

            if (this.drawLib.previousGroup(draw) && !this.removePlayer(box)) {
                ASSERT(false);
            }
        }

        return true;
    }

    //Override
    public setPlayerOut(box: Match, outNumber?: number): boolean { //setPlayerOut
        // outNumber=0 => enlève qualifié

        //ASSERT(setPlayerOutOk(iBoite, outNumber));

        var next = this.drawLib.nextGroup(box._draw);

        //TODOjs findBox()
        var diag = box._draw.boxes[iDiagonale(box)];
        var box1 = box._draw.boxes[ADVERSAIRE1(box._draw, box.position)];

        if (outNumber) {	//Ajoute un qualifié sortant
            //Met à jour le tableau suivant
            if (next && box.playerId && box.qualifOut) {
                var boxIn = this.findPlayerIn(box._draw, outNumber);
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
            this.drawLib.initBox(diag, box._draw);

            if (next && box.playerId) {
                //Met à jour le tableau suivant
                var boxIn = this.drawLib.groupFindPlayerIn(next, outNumber);
                if (boxIn) {
                    ASSERT(!boxIn.playerId);
                    if (!this.putPlayer(boxIn, box._player, true)) {
                        ASSERT(false);
                    }
                }
            }

        } else {	//Enlève un qualifié sortant
            var match = <Match>box;
            if (next && box.playerId) {
                //Met à jour le tableau suivant
                var boxIn = this.drawLib.groupFindPlayerIn(next, match.qualifOut);
                if (boxIn) {
                    ASSERT(boxIn.playerId && boxIn.playerId === box.playerId);
                    if (!this.removePlayer(boxIn, true)) {
                        ASSERT(false);
                    }
                }
            }

            delete match.qualifOut;

            diag.playerId = undefined;
            this.drawLib.initBox(diag, box._draw);
        }

        //#ifdef WITH_POULE
        //	if( isTypePoule())
        //		computeScore( (CDocJatennis*)((CFrameTennis*)AfxGetMainWnd()).GetActiveDocument());
        //#endif //WITH_POULE

        return true;
    }

    private GetJoueursTableau(draw: Draw): Array<Player|number> {

        //Récupère les joueurs du tableau
        var ppJoueur: Array<Player|number> = [];
        var draws = this.drawLib.group(draw);
        for (var j = 0; j < draws.length; j++) {
            var d = draws[j];
            var first = positionFirstIn(d.nbColumn),
                last = positionLastIn(d.nbColumn);
            for (var b = last; b <= first; b++) {
                var boxIn = <PlayerIn>this.findBox(d, b);
                if (!boxIn) {
                    continue;
                }
                //Récupérer les joueurs et les Qualifiés entrants
                if (boxIn.qualifIn) {
                    ppJoueur.push(boxIn.qualifIn);	//no qualifie entrant
                } else if (boxIn.playerId) {
                    ppJoueur.push(boxIn._player);	//a player
                }
            }
        }

        return ppJoueur;
    }

    //Override
    public generateDraw(refDraw: Draw, generate?: GenerateType, afterIndex?: number): Draw[] {

        var oldDraws = this.drawLib.group(refDraw);
        var iTableau = Find.indexOf(refDraw._event.draws, 'id', oldDraws[0].id);
        if (iTableau === -1) {
            iTableau = refDraw._event.draws.length;  //append the draws at the end of the event
        }

        var players: Array<Player|number> = this.tournamentLib.GetJoueursInscrit(refDraw);

        //Récupère les qualifiés sortants du tableau précédent
        var prev = afterIndex >= 0 ? draw._event.draws[afterIndex] : undefined; // = this.drawLib.previousGroup(refDraw);
        if (prev) {
            players = players.concat(this.drawLib.groupFindAllPlayerOut(prev, true));
        }

        //Tri et Mélange les joueurs de même classement
        this.tournamentLib.TriJoueurs(players);

        var event = refDraw._event;

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
                draw = this.drawLib.newDraw(event, refDraw);
                draw.suite = true;
            }
            draw.boxes = [];
            draw.name = name + (nDraw > 1 ? ' (' + (t + 1) + ')' : '');

            for (var i = draw.nbColumn - 1; i >= 0 && players.length; i--) {

                var b = ADVERSAIRE1(draw, i);
                var j = t + (draw.nbColumn - i - 1) * nDraw;

                var boxIn = <PlayerIn>this.drawLib.newBox(draw, undefined, b);
                draw.boxes.push(boxIn);

                if (j < players.length) {
                    var qualif = 'number' === typeof players[j] ? <number>players[j] : 0;
                    if (qualif) {	//Qualifié entrant
                        if (!this.setPlayerIn(boxIn, qualif)) {
                            return;
                        }
                    } else if (!this.putPlayer(boxIn, <Player>players[j])) {
                        return;
                    }
                }

                //Append the matches
                var diag = iDiagonalePos(draw.nbColumn, b);
                for (b -= draw.nbColumn; b >= 0; b -= draw.nbColumn) {
                    if (b === diag || (b < diag && draw.type === DrawType.PouleSimple)) {
                        continue;
                    }
                    var match = <Match>this.drawLib.newBox(draw, undefined, b);
                    match.score = '';
                    draw.boxes.push(match);
                }
            }

            //Ajoute 1 tête de série
            var boxT = <PlayerIn>this.findBox(draw, ADVERSAIRE1(draw, draw.nbColumn - 1));
            boxT.seeded = t + 1;

            draws.push(draw);
        }

        return draws;
    }

    //Calcul classement des poules
    //Override
    public computeScore(draw: Draw): boolean {

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

function iDiagonale(box: Box): number {
    var n = box._draw.nbColumn;
    return (box.position % n) * (n + 1);
}
function iDiagonalePos(nbColumn: number, pos: number): number {
    return (pos % nbColumn) * (nbColumn + 1);
}

function ADVERSAIRE1(draw: Draw, pos: number): number {
    var n = draw.nbColumn;
    return pos % n + n * n;
};

// angular.module('jat.services.roundrobin', ['jat.services.services', 'jat.services.tournamentLib', 'jat.services.drawLib', 'jat.services.type', 'jat.services.find'])
//     .factory('roundrobin', [
//         'services',
//         'drawLib',
//         'tournamentLib',
//         'ranking',
//         'rank',
//         'find',
//         'guid',
//         (services: Services,
//             drawLib: DrawLib,
//             tournamentLib: TournamentLib,
//             ranking: Ranking,
//             rank: Rank,
//             find: Find,
//             guid: Guid) => {
//             return new Roundrobin(services, drawLib, tournamentLib, ranking, rank, find, guid);
//         }]);