/* eslint-disable no-bitwise */
import { DrawLibBase } from './drawLibBase';
import { column, columnMax, columnMin, countInCol, positionBottomCol, positionMatch, positionMax, positionOpponent, positionOpponent1, positionOpponent2, positionTopCol, scanLeftBoxes } from './knockoutLib';
import { by } from '../util/find';
import { isObject } from '../util/object'
import { rank } from '../types';
import { Draw, Box, Match, PlayerIn, QEMPTY, FINAL } from '../../domain/draw';
import { GenerateType, IDrawLib } from './drawLib';
import type { Player } from '../../domain/player';
import { findGroupQualifOuts, findSeeded, groupDraw, groupFindPlayerIn, groupFindPlayerOut, isMatch, newBox, newDraw, nextGroup } from '../drawService';
import { sortPlayers } from '../tournamentService';
import { ASSERT } from '../../utils/tool';

const MIN_COL = 0,
    MAX_COL = 9,
    MAX_QUALIF = 32,
    WITH_TDS_HAUTBAS = true;

/**

---14---
        >-- 6---.
---13---	    |
                >-- 2---.
---12---    	|   	|
        >-- 5---'	    |
---11---		        |
                        >-- 0---
---10---		        |
        >-- 4---.	    |
--- 9---	    |   	|
                >-- 1---'
--- 8---	    |
        >-- 3---'
--- 7---
*/

export class Knockout extends DrawLibBase implements IDrawLib {

    /** @override */
    nbColumnForPlayers( nJoueur: number): number {

        const colMin = columnMin(this.draw.nbOut);

        let c = colMin + 1
        // eslint-disable-next-line no-empty
        for (; countInCol(c, this.draw.nbOut) < nJoueur && c < MAX_COL; c++) {}

        if (MAX_COL <= c) {
            throw new Error('Max_COL is reached ' + c);
        }

        return c - colMin + 1;
    }

    /** @override */
    resize( oldDraw?: Draw, nPlayer?: number): void {

        //ASSERT( SetDimensionOk( this.draw, oldDraw, nPlayer));

        if (nPlayer) {    //AgranditTableau to fit all players
            this.draw.nbColumn = this.nbColumnForPlayers(nPlayer);
            //this.draw.nbEntry = countInCol(iColMax(this.draw), this.draw.nbOut);
        }

        //Shift the boxes
        if (oldDraw && this.draw.nbOut !== oldDraw.nbOut) {
            const n = columnMax(this.draw.nbColumn, this.draw.nbOut) - columnMax(oldDraw.nbColumn, oldDraw.nbOut);
            if (n !== 0) {
                const top = positionTopCol(n);
                for (let i = this.draw.boxes.length - 1; i >= 0; i--) {
                    const box = this.draw.boxes[i];
                    box.position = this.positionPivotLeft(box.position, top);
                }
            }
        }
    }

    /** @override */
    generateDraw( generate: GenerateType, playersOrQ: Array<Player|number>): Draw[] {
        let m_nMatchCol: number[];
        if (generate === GenerateType.Create) {   //from registred players
            m_nMatchCol = Array(MAX_COL).fill(0);
            this.resetDraw(playersOrQ.length);
            this.fillMatchs(m_nMatchCol, playersOrQ.length - this.draw.nbOut);
        } else {    //from existing players
            m_nMatchCol = this.countMatchs();
            if (generate === GenerateType.PlusEchelonne) {
                if (!this.TirageEchelonne(m_nMatchCol)) {
                    return [];
                }
            } else if (generate === GenerateType.PlusEnLigne) {
                if (!this.TirageEnLigne(m_nMatchCol)) {
                    return [];
                }
            }
        }

        //Tri et Mélange les joueurs de même classement
        sortPlayers(playersOrQ);

        this.draw = this.buildMatches(this.draw, m_nMatchCol, playersOrQ);
        return [this.draw];
    }

    private fillMatchs( m_nMatchCol: number[], nMatchRestant: number, colGauche?: number): void { //RempliMatchs

        const colMin = columnMin(this.draw.nbOut);

        colGauche = colGauche || colMin;

        for (let i = colGauche; i <= MAX_COL; i++) {
            m_nMatchCol[i] = 0;
        }

        //Rempli les autres matches de gauche normalement
        for (let c = Math.max(colGauche, colMin); nMatchRestant && c < MAX_COL; c++) {
            let iMax = Math.min(nMatchRestant, countInCol(c, this.draw.nbOut));
            if (colMin < c) {
                iMax = Math.min(iMax, 2 * m_nMatchCol[c - 1]);
            }

            m_nMatchCol[c] = iMax;
            nMatchRestant -= iMax;
        }
    }

    //Init m_nMatchCol à partir du tableau existant
    private countMatchs(): number[] { //CompteMatchs

        let b: number, c2: number | undefined, n: number, bColSansMatch: boolean;

        const m_nMatchCol: number[] = new Array(MAX_COL);

        //Compte le nombre de joueurs entrants ou qualifié de la colonne
        const colMin = columnMin(this.draw.nbOut);
        let c = colMin;
        m_nMatchCol[c] = this.draw.nbOut;
        let nMatchRestant = -m_nMatchCol[c];
        const colMax = columnMax(this.draw.nbColumn, this.draw.nbOut);
        for (c++; c <= colMax; c++) {
            n = 0;
            const bottom = positionBottomCol(c),
                top = positionTopCol(c);
            for (b = bottom; b <= top; b++) {
                const box = this.findBox<PlayerIn>(b);
                if (box && (this.isNewPlayer(box) || box.qualifIn)) {
                    n++;
                }
            }

            //En déduit le nombre de matches de la colonne
            m_nMatchCol[c] = 2 * m_nMatchCol[c - 1] - n;

            nMatchRestant += n - m_nMatchCol[c];
            if (!n) {
                c2 = c;
            }

            if (!m_nMatchCol[c]) {
                break;
            }
        }

        //Contrôle si il n'y a pas d'autres joueurs plus à gauche
        for (c++; c <= colMax; c++) {
            n = 0;
            const bottom = positionBottomCol(c),
                top = positionTopCol(c);
            for (b = bottom; b <= top; b++) {
                const box = this.findBox<PlayerIn>(b);
                if (box && (this.isNewPlayer(box) || box.qualifIn)) {
                    n++;
                }
            }
            //TODO 00/04/13: CTableau, CompteMatch à refaire pour cas tordus
            //-------.
            //       |---A---.
            //-------'       |
            //               |-------	et un coup de dés...
            //---C---.       |
            //       |---B---'
            //---D---'

            nMatchRestant += n;

            //Ajoute un match par joueur trouvé
            if (n) {
                this.fillMatchs(m_nMatchCol, n, c2);
                break;
            }
        }

        //Compte tous les joueurs entrant ou qualifiés
        c = colMin;
        nMatchRestant = -m_nMatchCol[c];
        for (; c <= colMax; c++) {
            n = 0;
            const bottom = positionBottomCol(c),
                top = positionTopCol(c);
            for (b = bottom; b <= top; b++) {
                const box = this.findBox<PlayerIn>(b);
                if (box && (this.isNewPlayer(box) || box.qualifIn)) {
                    n++;
                }
            }
            nMatchRestant += n;
        }

        for (c = colMin; c <= colMax; c++) {

            if (m_nMatchCol[c] > nMatchRestant) {
                this.fillMatchs(m_nMatchCol, nMatchRestant, c);
                break;
            }

            nMatchRestant -= m_nMatchCol[c];
        }

        //Contrôle si il n'y a pas une colonne sans match
        bColSansMatch = false;
        for (nMatchRestant = 0, c = colMin; c < colMax; c++) {
            nMatchRestant += m_nMatchCol[c];

            if (m_nMatchCol[c]) {
                if (bColSansMatch) {
                    //Refait la répartition tout à droite
                    this.fillMatchs(m_nMatchCol, nMatchRestant, c + 1);
                    break;
                }
            } else {
                bColSansMatch = true;
            }
        }

        ////TODO Contrôle qu'il n'y a pas trop de match pour les joueurs
        //bColSansMatch = false;
        //for( nMatchRestant = 0, c = iColMin( draw); c< colMax; c++) {
        //    nMatchRestant += m_nMatchCol[c];
        //
        //    if( m_nMatchCol[ c]) {
        //        if( bColSansMatch) {
        //            //Refait la répartition tout à droite
        //            this.RempliMatchs(nMatchRestant, c+1);
        //            break;
        //        }
        //    } else
        //        bColSansMatch = true;
        //}

        return m_nMatchCol;
    }

    private TirageEchelonne( m_nMatchCol: number[]): boolean {		//Suivant

        const colMin = columnMin(this.draw.nbOut);
        const colMax = columnMax(this.draw.nbColumn, this.draw.nbOut);

        //Enlève le premier match possible en partant de la gauche
        for (let c = MAX_COL - 1; c > colMin; c--) {
            if (undefined === m_nMatchCol[c]) {
                continue;
            }
            if (m_nMatchCol[c] > 1 && ((c + 1) < colMax)) {

                if ((m_nMatchCol[c + 1] + 1) > 2 * (m_nMatchCol[c] - 1)) {
                    continue;
                }

                m_nMatchCol[c]--;

                //Remet le match plus à droite
                c++;
                m_nMatchCol[c]++;

                return true;
            }
        }
        return false;
    }

    private TirageEnLigne( m_nMatchCol: number[]): boolean {	//Precedent

        const colMin = columnMin(this.draw.nbOut);

        //Cherche où est-ce qu'on peut ajouter un match en partant de la gauche
        let nMatchRestant = 0;
        for (let c = MAX_COL - 1; c > colMin; c--) {
            if (undefined === m_nMatchCol[c]) {
                continue;
            }
            let iMax = Math.min(nMatchRestant + m_nMatchCol[c], countInCol(c, this.draw.nbOut));
            if (c > colMin) {
                iMax = Math.min(iMax, 2 * m_nMatchCol[c - 1]);
            }
            if (m_nMatchCol[c] < iMax) {
                //Ajoute le match en question
                m_nMatchCol[c]++;
                nMatchRestant--;

                //Reset les autres matches de gauche
                this.fillMatchs(m_nMatchCol, nMatchRestant, c + 1);
                return true;
            }

            nMatchRestant += m_nMatchCol[c];
        }
        return false;
    }

    //Place les matches dans l'ordre
    private buildMatches(oldDraw: Draw, m_nMatchCol: number[], players: Array<Player|number>): Draw { //ConstruitMatch

        const draw = this.draw = newDraw(this.event, oldDraw);
        draw.boxes = [];

        const colMin = columnMin(draw.nbOut),
            colMax = columnMax(draw.nbColumn, draw.nbOut);

        //Calcule OrdreInv
        const pOrdreInv = this.listReverseOrder(draw);

        //Nombre de Tête de série
        let nTeteSerie = draw.nbOut;
        if (nTeteSerie === 1) {
            nTeteSerie = countInCol((colMax - colMin) >> 1);
        }

        const max = positionMax(draw.nbColumn, draw.nbOut);
        const pbMatch: boolean[] = new Array(max + 1);

        let iJoueur = 0,
            m = 0,
            nj = 0;
        let c = -1;
        let o = 0
        for (; o <= max; o++) {
            const b = pOrdreInv[o];
            if (b === -1) {
                continue;
            }
            if (column(b) !== c) {
                c = column(b);

                m = m_nMatchCol[c] || 0;
                nj = c > colMin ? 2 * m_nMatchCol[c - 1] - m : 0;
            }

            //fou les joueurs
            const posMatch = positionMatch(b);
            if (nj > 0) {
                if (pbMatch[posMatch]) {
                    iJoueur++;
                    nj--;

                    const box = newBox(draw, this.event.matchFormat, b);
                    draw.boxes.push(box);
                }
            } else {
                //fou les matches
                if (m > 0 && (c === colMin || pbMatch[posMatch])) {
                    pbMatch[b] = true;
                    m--;

                    const match = newBox<Match>(draw, this.event.matchFormat, b);
                    match.score = '';
                    draw.boxes.push(match);
                }
            }

            if (iJoueur >= players.length) {
                break;
            }
        }

        //fou les joueurs en commençant par les qualifiés entrants
        iJoueur = 0;    //players.length - 1;
        for (; o > 0; o--) {
            const b = pOrdreInv[o];
            if (b === -1) {
                continue;
            }

            //fou les joueurs
            if (!pbMatch[b] && pbMatch[positionMatch(b)]) {

                //Qualifiés entrants se rencontrent
                let qualif = typeof players[iJoueur] === 'number' ? players[iJoueur] as number : 0;
                if (qualif) {
                    const boxIn2 = this.findBox<PlayerIn>(positionOpponent(b));
                    if (boxIn2?.qualifIn) {
                        //2 Qualifiés entrants se rencontrent
                        for (let t = iJoueur + 1; t >= nTeteSerie; t--) {
                            if (isObject(players[t])) {
                                //switch
                                const p = players[t];
                                players[t] = qualif;
                                players[iJoueur] = p;
                                qualif = 0;
                                break;
                            }
                        }
                    }
                }

                const boxIn = this.findBox<PlayerIn>(b);
                if (boxIn) {
                    delete (boxIn as Partial<Match>).score; //not a match
                    boxIn.order = iJoueur + 1; // TODO test
                    if (qualif) {	//Qualifié entrant
                        this.setPlayerIn(boxIn, qualif);
                    } else {	//Joueur
                        this.putPlayer(boxIn, (players[iJoueur] as Player).id);

                        if ((!draw.minRank || !rank.isNC(draw.minRank))
                            || (!draw.maxRank || !rank.isNC(draw.maxRank))) {
                            //Mets les têtes de série (sauf tableau NC)
                            let t;
                            if (WITH_TDS_HAUTBAS) {
                                t = this.seededQhb(b, draw.nbOut);
                            } else {
                                t = this.seededQ(b, draw.nbOut);
                            }
                            if (t <= nTeteSerie) {
                                const tt = findSeeded(this.event, draw, t);
                                if (!tt.length || tt[0].id === oldDraw.id) {
                                    boxIn.seeded = t;
                                }
                            }
                        }
                    }
                    iJoueur++;
                }
            }

            if (iJoueur > players.length) {
                break;
            }
        }

        //	for( b=positionBottomCol(columnMin(draw.nbOut)); b<=positionMax(draw.nbColumn, draw.nbOut); b++)
        //		draw.boxes[ b].setLockMatch( false);

        //Mets les qualifiés sortants
        if (draw.type !== FINAL) {

            //Find the first unused qualif number
            const group = groupDraw(this.event, draw);
            let i;
            if (group) {
                const qualifOuts = findGroupQualifOuts(this.event, group).filter(([, d]) => d.id !== oldDraw.id).map(([q]) => q).sort();
                for (i = 1; i <= MAX_QUALIF; i++) {
                    // const [,m] = groupFindPlayerOut(this.event, group, i);
                    const m = qualifOuts.includes(i);
                    if (!m) {
                        break;
                    }
                }
            } else {
                i = 1;
            }

            const bottom = positionBottomCol(colMin);
            const top = positionTopCol(colMin);
            for (let b = top; b >= bottom && i <= MAX_QUALIF; b-- , i++) {
                const boxOut = this.findBox<Match>(b);
                if (boxOut) {
                    this.setPlayerOut(boxOut, i);
                }
            }
        }

        return draw;
    }

    /** @override */
    boxesOpponents(match: Match): { player1: PlayerIn; player2: PlayerIn } {

        const pos1 = positionOpponent1(match.position),
            pos2 = positionOpponent2(match.position);
        return {
            player1: by(this.draw.boxes, 'position', pos1) as PlayerIn,
            player2: by(this.draw.boxes, 'position', pos2) as PlayerIn
        };
    }

    /** @override */
    computeScore(): boolean {
        return true;
    }

    isNewPlayer(box: Box): boolean {	//Première apparition du joueur dans le tableau
        if (!box) {
            return false;
        }
        const boxIn = box as PlayerIn;
        const { player1, player2 } = this.boxesOpponents(box as Match);
        return !!box.playerId
            &&
            (
                !!boxIn.qualifIn
                ||
                !(
                    (player1?.playerId)
                    ||
                    (player2?.playerId)
                )
            );
    }

    /** @override */
    setPlayerIn(box: PlayerIn, inNumber?: number, playerId?: string): boolean { //setPlayerIn
        // inNumber=0 => enlève qualifié

        const usedNumber = inNumber && inNumber !== QEMPTY && this.findPlayerIn(inNumber);

        const res = super.setPlayerIn(box, inNumber, playerId);
        if (res) {
            if (inNumber) {	//Ajoute un qualifié entrant
                //Qualifié entrant pas déjà pris
                if (!usedNumber) {
                    //Cache les boites de gauche
                    scanLeftBoxes(this.draw, box.position, true, (box) => {
                        box.hidden = true;  //TODOjs delete the box from draw.boxes
                    });
                }
            } else {
                //Réaffiche les boites de gauche
                scanLeftBoxes(this.draw, box.position, true, (box) => {
                    delete box.hidden;
                });
            }
        }

        return res;
    }

    /** @override */
    setPlayerOut(box: Match, outNumber?: number): boolean { //setPlayerOut
        // outNumber=0 => enlève qualifié

        const nextGrp = nextGroup(this.event, this.draw);

        //ASSERT(setPlayerOutOk(iBoite, outNumber));

        if (outNumber) {	//Ajoute un qualifié sortant

            //Met à jour le tableau suivant
            let boxIn: PlayerIn | undefined;
            if (nextGrp && box.playerId && box.qualifOut) {
                [,boxIn] = groupFindPlayerIn(this.event, nextGrp, outNumber);
                if (boxIn) {
                    ASSERT(boxIn.playerId === box.playerId);
                    if (!this.removePlayer(boxIn)) {
                        throw new Error("Can not remove player");
                    }
                }
            }

            //Enlève le précédent n° de qualifié sortant
            if (box.qualifOut) {
                if (!this.setPlayerOut(box)) {	//Enlève le qualifié
                    ASSERT(false);
                }
            }

            box.qualifOut = outNumber;

            //Met à jour le tableau suivant
            if (nextGrp && box.playerId && boxIn) {
                this.putPlayer(boxIn, box.playerId, undefined, true);
            }

        } else {	//Enlève un qualifié sortant
            if (nextGrp && box.playerId && box.qualifOut) {
                //Met à jour le tableau suivant
                const [,boxIn] = groupFindPlayerIn(this.event, nextGrp, box.qualifOut);
                if (boxIn) {
                    ASSERT(!!boxIn.playerId && boxIn.playerId === box.playerId);
                    if (!this.removePlayer(boxIn, undefined, true)) {
                        throw new Error("Can not remove player");
                    }
                }
            }

            delete box.qualifOut;
        }

        return true;
    }

    /** @override */
    findPlayerIn( iQualifie: number): PlayerIn | undefined {

        ASSERT(0 <= iQualifie);

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
    findPlayerOut( iQualifie: number): Match | undefined {

        ASSERT(0 < iQualifie);

        if (iQualifie === QEMPTY || !this.draw.boxes) {
            return;
        }

        // TODO could have duplicates!
        return by<Match>(this.draw.boxes as Match[], "qualifOut", iQualifie);
    }

    //private box1(match: Match): Box {
    //    const pos = positionOpponent1(match.position);
    //    return by(match._draw.boxes, 'position', pos) as Box;
    //}
    //private box2(match: Match): Box {
    //    const pos = positionOpponent2(match.position);
    //    return by(match._draw.boxes, 'position', pos) as Box;
    //}

    //formule de décalage à droite:
    //
    // iNew = i - pivot * 2 ^ (log2(i+1) -log2(pivot+1))
    //
    //   pivot: iBoite qui devient 0
    //   i    : une case à gauche du pivot
    //   iNew : la même case après décalage
    //
    //formule de décalage à gauche:
    //
    // iNew = i + pivot * 2 ^ log2(i + 1)
    //
    //   pivot: iBoite qui est remplacée par 0
    //   i    : une case à gauche du pivot
    //   iNew : la même case après décalage

    // /** @deprecated see knockoutLib.scanLeftBoxes */
    // private scanLeftBoxes(position: number,  bToutesBoites: boolean, callback: (box: Box) => void): void { //iBoiteDeGauche

    //     let b: number;
    //     let bOk: boolean = false;

    //     //ASSERT_VALID(pTableau);

    //     for (let pos = position; ;) {
    //         let box: Box | undefined;
    //         let j = pos - position * exp2(column(pos) - column(position));
    //         do {
    //             j++;
    //             b = j + position * exp2(column(j));

    //             box = this.findBox(b);
    //             if (!box) {
    //                 return;
    //             }
    //             bOk = (!!box.playerId || bToutesBoites);
    //         } while (!bOk);

    //         if (bOk) {
    //             callback(box);
    //         }
    //         pos = b;
    //     }
    // }

    private positionPivotLeft(pos: number, pivot: number): number {    //iBoitePivotGauche
        return pos + pivot * exp2(column(pos));
    }

    //Têtes de série de bas en haut (FFT)

    //Numéro du tête de série d'une boite (identique dans plusieurs boites)
    private seededQ(i: number, nQualifie: number): number { //iTeteSerieQ

        //ASSERT(0 <= i && i < MAX_BOITE);
        ASSERT(1 <= nQualifie && nQualifie <= countInCol(column(i)));

        if (column(i) === columnMin(nQualifie)) {
            //Colonne de droite, numéroter 1 à n en partant du bas (OK!)
            if (nQualifie === 1 << column(nQualifie - 1)) { 	//Puissance de deux ?
                return i === 0 ? 1 : this.seededQ(i, 1);	// TODO à corriger
            } else {
                return 1 + this.iPartieQ(i, nQualifie);
            }
        } else {
            //Tête de série précédente (de droite)
            const t = this.seededQ(positionMatch(i), nQualifie);
            let v: boolean,
                d: number,
                c: number;

            if (nQualifie === 1 << column(nQualifie - 1)) {	//Puissance de deux ?
                d = i;
            } else {
                d = this.shiftLeftQ(i, nQualifie);
            }

            v = !!(d & 1);	//Ok pour demi-partie basse

            if ((c = column(d)) > 1
                && d > positionTopCol(c) - (countInCol(c, nQualifie) >> 1)) {
                v = !v;		//Inverse pour le demi-partie haute
            }

            return v ?
                t :			//La même tête de série se propage
                1 + countInCol(column(i), nQualifie) - t;	//Nouvelle tête de série complémentaire
        }
    }

    private listReverseOrder({ nbColumn, nbOut }: Draw): number[] {
        const result: number[] = [];

        const colMax = columnMax(nbColumn, nbOut);

        let c = columnMin(nbOut);
        for (; c <= colMax; c++) {
            const bottom = positionBottomCol(c),
                top = positionTopCol(c);
            for (let i = bottom; i <= top; i++) {
                if (WITH_TDS_HAUTBAS) {
                    result[this.orderQhb(i, nbOut)] = i;
                } else {
                    result[this.orderQ(i, nbOut)] = i;
                }
            }
        }
        return result;
    }

    //Ordre de remplissage des boites en partant de la droite
    //et en suivant les têtes de série
    private orderQ(i: number, nQualifie: number): number { //iOrdreQ

        //ASSERT(0 <= i && i < MAX_BOITE);
        ASSERT(1 <= nQualifie && nQualifie <= countInCol(column(i)));
        return this.seededQ(i, nQualifie) - 1
            + countInCol(column(i), nQualifie)
            - nQualifie;
    }

    //Partie du tableau de i par rapport au qualifié sortant
    //retour: 0 à nQualifie-1, en partant du bas
    iPartieQ(i: number, nQualifie: number): number {   //not private for Sped?

        //ASSERT(0 <= i && i < MAX_BOITE);
        ASSERT(1 <= nQualifie && nQualifie <= countInCol(column(i)));
        const c = column(i);
        return Math.floor((i - positionBottomCol(c, nQualifie)) / countInCol(c - columnMin(nQualifie)));
        // 	return MulDiv( i - positionBottomCol(c, nQualifie), 1, countInCol(c - columnMin( nQualifie)) );
        //TODOjs? pb division entière
    }

    //Numére de boite de la partie de tableau, ramenée à un seul qualifié
    private shiftLeftQ(i: number, nQualifie: number): number { // iDecaleGaucheQ

        //ASSERT(0 <= i && i < MAX_BOITE);
        ASSERT(1 <= nQualifie && nQualifie <= countInCol(column(i)));
        const c: number = column(i);
        return i
            - this.iPartieQ(i, nQualifie) * countInCol(c - columnMin(nQualifie))
            - positionBottomCol(c, nQualifie)
            + positionBottomCol(c - columnMin(nQualifie));
    }

    //Têtes de série de haut en bas (non FFT)

    //Numéro du tête de série d'une boite (identique dans plusieurs boites)
    private seededQhb(i: number, nQualifie: number): number { //iTeteSerieQhb

        //ASSERT(0 <= i && i < MAX_BOITE);
        ASSERT(1 <= nQualifie && nQualifie <= countInCol(column(i)));

        if (column(i) === columnMin(nQualifie)) {
            //Colonne de droite, numéroter 1 à n en partant du bas (OK!)
            if (nQualifie === 1 << column(nQualifie - 1)) 	//Puissance de deux ?
            {return i === 0 ? 1 : this.seededQhb(i, 1);}	// TODO à corriger
            else
            {return 1 + this.partQhb(i, nQualifie);}
        } else {
            //Tête de série précédente (de droite)
            const t: number = this.seededQhb(positionMatch(i), nQualifie);
            let v: boolean,
                d: number,
                c: number;

            if (nQualifie === 1 << column(nQualifie - 1)) {	//Puissance de deux ?
                d = i;
            } else {
                d = this.shifthLeftQhb(i, nQualifie);
            }
            v = !!(d & 1);	//Ok pour demi-partie basse

            if ((c = column(d)) > 1
                && d <= positionTopCol(c) - (countInCol(c) >> 1)) {
                v = !v;		//Inverse pour le demi-partie basse		//v1.11.0.1 (décommenté)
            }
            return !v ?		//seul différence haut-bas !
                t :			//La même tête de série se propage
                1 + countInCol(column(i), nQualifie) - t;	//Nouvelle tête de série complémentaire
        }
    }

    //Ordre de remplissage des boites en partant de la droite
    //et en suivant les têtes de série
    private orderQhb(i: number, nQualifie: number): number { //iOrdreQhb

        //ASSERT(0 <= i && i < MAX_BOITE);
        ASSERT(1 <= nQualifie && nQualifie <= countInCol(column(i)));
        return this.seededQhb(i, nQualifie) - 1
            + countInCol(column(i), nQualifie)
            - nQualifie;
    }

    //Partie du tableau de i par rapport au qualifié sortant
    //retour: 0 à nQualifie-1, en partant du bas
    private partQhb(i: number, nQualifie: number): number { //iPartieQhb

        //ASSERT(0 <= i && i < MAX_BOITE);
        ASSERT(1 <= nQualifie && nQualifie <= countInCol(column(i)));
        const c: number = column(i);
        //	return (i - positionBottomCol(c, nQualifie) ) / countInCol(c - columnMin( nQualifie) );
        return (nQualifie - 1) - Math.floor((i - positionBottomCol(c, nQualifie)) / countInCol(c - columnMin(nQualifie)));
        // 	return MulDiv( i - positionBottomCol(c, nQualifie), 1, countInCol(c - columnMin( nQualifie)) );
        //TODOjs? pb division entière
    }

    private shifthLeftQhb(i: number, nQualifie: number): number { //iDecaleGaucheQhb

        //ASSERT(0 <= i && i < MAX_BOITE);
        ASSERT(1 <= nQualifie && nQualifie <= countInCol(column(i)));
        const c: number = column(i);
        return i
            - (nQualifie - 1 - this.partQhb(i, nQualifie)) * countInCol(c - columnMin(nQualifie))
            - positionBottomCol(c, nQualifie)
            + positionBottomCol(c - columnMin(nQualifie));
    }
}

// function log2(x: number): number { // = column(x-1)
//     ASSERT(x > 0);
//     let sh = x;
//     let i = -1
//     for (; sh; sh >>= 1, i++);
//     return i;
// }

function exp2(col: number): number {
    return 1 << col;
}
