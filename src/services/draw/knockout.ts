import { DrawLibBase } from './drawLibBase';
import { KnockoutLib as k } from './knockoutLib';
import { by, byId } from '../util/find';
import { isObject } from '../util/object'
import { shuffle, filledArray } from '../../utils/tool';
import { rank } from '../types';
import { DrawType, Draw, Box, Match } from '../../domain/draw';
import { drawLib, GenerateType, IDrawLib } from './drawLib';
import { Player, PlayerIn } from '../../domain/player';
import { groupDraw, groupFindPlayerIn, groupFindPlayerOut, newBox, newDraw, nextGroup, previousGroup } from '../drawService';
import { sortPlayers } from '../tournamentService';
import { TEvent } from '../../domain/tournament';

var MIN_COL = 0,
    MAX_COL = 9,
    MAX_QUALIF = 32,
    QEMPTY = - 1,
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

    private findBox( position: number, create?: boolean): Box | undefined {
        var box = by(this.draw.boxes, 'position', position);
        if (!box && create) {
            box = newBox(this.draw, undefined, position);
        }
        return box;
    }

    /** @override */
    nbColumnForPlayers( nJoueur: number): number {

        
        var colMin = k.columnMin(this.draw.nbOut);

        for (var c = colMin + 1; k.countInCol(c, this.draw.nbOut) < nJoueur && c < MAX_COL; c++) {
        }

        if (MAX_COL <= c) {
            throw 'Max_COL is reached ' + c;
        }

        return c - colMin + 1;
    }

    /** @override */
    resize( oldDraw?: Draw, nPlayer?: number): void {

        //ASSERT( SetDimensionOk( this.draw, oldDraw, nPlayer));

        

        if (nPlayer) {    //AgranditTableau to fit all players
            this.draw.nbColumn = this.nbColumnForPlayers(nPlayer);
            //this.draw.nbEntry = k.countInCol(iColMax(this.draw), this.draw.nbOut);
        }

        //Shift the boxes
        if (oldDraw && this.draw.nbOut !== oldDraw.nbOut) {
            var n = k.columnMax(this.draw.nbColumn, this.draw.nbOut) - k.columnMax(oldDraw.nbColumn, oldDraw.nbOut);
            if (n != 0) {
                var top = k.positionTopCol(n);
                for (var i = this.draw.boxes.length - 1; i >= 0; i--) {
                    var box = this.draw.boxes[i];
                    box.position = this.positionPivotLeft(box.position, top);
                }
            }
        }
    }

    /** @override */
    generateDraw( generate: GenerateType, registeredPlayersOrQ: (Player|number)[]): Draw[] {
        let playersOrQ : Array<Player|number> = [];
        if (generate === GenerateType.Create) {   //from registred players
            var m_nMatchCol = Array(MAX_COL).fill(0);

            // var players: Array<Player|number> = getRegisteredPlayers(this.event, this.draw);

            playersOrQ = registeredPlayersOrQ;

            this.resetDraw(registeredPlayersOrQ.length);
            this.RempliMatchs(m_nMatchCol, registeredPlayersOrQ.length - this.draw.nbOut);
        } else {    //from existing players
            m_nMatchCol = this.CompteMatchs();
            if (generate === GenerateType.PlusEchelonne) {
                if (!this.TirageEchelonne(m_nMatchCol)) {
                    return [];
                }
            } else if (generate === GenerateType.PlusEnLigne) {
                if (!this.TirageEnLigne(m_nMatchCol)) {
                    return [];
                }
            }
            const registeredPlayers = registeredPlayersOrQ.filter((p): p is Player => typeof p !== 'number');

            playersOrQ = this.GetJoueursTableau().map((pq) => (typeof pq === 'number' ? pq : byId(registeredPlayers, pq)!));
        }

        //Tri et Mélange les joueurs de même classement
        sortPlayers(playersOrQ);

        this.draw = this.ConstruitMatch(this.draw, m_nMatchCol, playersOrQ);
        return [this.draw];
    }

    private RempliMatchs( m_nMatchCol: number[], nMatchRestant: number, colGauche?: number): void {

        
        var colMin = k.columnMin(this.draw.nbOut);

        colGauche = colGauche || colMin;

        for (var i = colGauche; i <= MAX_COL; i++) {
            m_nMatchCol[i] = 0;
        }

        //Rempli les autres matches de gauche normalement
        for (var c = Math.max(colGauche, colMin); nMatchRestant && c < MAX_COL; c++) {
            var iMax = Math.min(nMatchRestant, k.countInCol(c, this.draw.nbOut));
            if (colMin < c) {
                iMax = Math.min(iMax, 2 * m_nMatchCol[c - 1]);
            }

            m_nMatchCol[c] = iMax;
            nMatchRestant -= iMax;
        }
    }

    //Init m_nMatchCol à partir du tableau existant
    private CompteMatchs(): number[] {

        
        var b: number, c2: number | undefined, n: number, bColSansMatch: boolean;

        var m_nMatchCol: number[] = new Array(MAX_COL);

        //Compte le nombre de joueurs entrants ou qualifié de la colonne
        var colMin = k.columnMin(this.draw.nbOut);
        var c = colMin;
        m_nMatchCol[c] = this.draw.nbOut;
        var nMatchRestant = -m_nMatchCol[c];
        var colMax = k.columnMax(this.draw.nbColumn, this.draw.nbOut);
        for (c++; c <= colMax; c++) {
            n = 0;
            var bottom = k.positionBottomCol(c),
                top = k.positionTopCol(c);
            for (b = bottom; b <= top; b++) {
                var box = <PlayerIn>this.findBox(b);
                if (box && (this.isJoueurNouveau(box) || box.qualifIn)) {
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
            var bottom = k.positionBottomCol(c),
                top = k.positionTopCol(c);
            for (b = bottom; b <= top; b++) {
                var box = <PlayerIn>this.findBox(b);
                if (box && (this.isJoueurNouveau(box) || box.qualifIn)) {
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
                this.RempliMatchs(m_nMatchCol, n, c2);
                break;
            }
        }

        //Compte tous les joueurs entrant ou qualifiés
        c = colMin;
        nMatchRestant = -m_nMatchCol[c];
        for (; c <= colMax; c++) {
            n = 0;
            var bottom = k.positionBottomCol(c),
                top = k.positionTopCol(c);
            for (b = bottom; b <= top; b++) {
                var box = <PlayerIn>this.findBox(b);
                if (box && (this.isJoueurNouveau(box) || box.qualifIn)) {
                    n++;
                }
            }
            nMatchRestant += n;
        }

        for (c = colMin; c <= colMax; c++) {

            if (m_nMatchCol[c] > nMatchRestant) {
                this.RempliMatchs(m_nMatchCol, nMatchRestant, c);
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
                    this.RempliMatchs(m_nMatchCol, nMatchRestant, c + 1);
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

        
        var colMin = k.columnMin(this.draw.nbOut);
        var colMax = k.columnMax(this.draw.nbColumn, this.draw.nbOut);

        //Enlève le premier match possible en partant de la gauche
        for (var c = MAX_COL - 1; c > colMin; c--) {
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

        
        var colMin = k.columnMin(this.draw.nbOut);

        //Cherche où est-ce qu'on peut ajouter un match en partant de la gauche
        var nMatchRestant = 0;
        for (var c = MAX_COL - 1; c > colMin; c--) {
            if (undefined === m_nMatchCol[c]) {
                continue;
            }
            var iMax = Math.min(nMatchRestant + m_nMatchCol[c], k.countInCol(c, this.draw.nbOut));
            if (c > colMin) {
                iMax = Math.min(iMax, 2 * m_nMatchCol[c - 1]);
            }
            if (m_nMatchCol[c] < iMax) {
                //Ajoute le match en question
                m_nMatchCol[c]++;
                nMatchRestant--;

                //Reset les autres matches de gauche
                this.RempliMatchs(m_nMatchCol, nMatchRestant, c + 1);
                return true;
            }

            nMatchRestant += m_nMatchCol[c];
        }
        return false;
    }

    private GetJoueursTableau(): Array<string|number> {

        //Récupère les joueurs du tableau
        var ppJoueur: Array<string|number> = [];
        for (var i = 0; i < this.draw.boxes.length; i++) {

            var boxIn = this.draw.boxes[i] as PlayerIn;
            if (!boxIn) {
                continue;
            }
            //Récupérer les joueurs et les Qualifiés entrants
            if (boxIn.qualifIn) {
                ppJoueur.push(boxIn.qualifIn);	//no qualifie entrant
            } else if (this.isJoueurNouveau(boxIn) && boxIn.playerId) {
                ppJoueur.push(boxIn.playerId);	//no du joueur
            }
        }

        return ppJoueur;
    }

    //Place les matches dans l'ordre
    private ConstruitMatch(oldDraw: Draw, m_nMatchCol: number[], players: Array<Player|number>): Draw {

        
        var draw = this.draw = newDraw(this.event, oldDraw);
        draw.boxes = [];

        var colMin = k.columnMin(draw.nbOut),
            colMax = k.columnMax(draw.nbColumn, draw.nbOut);

        //Calcule OrdreInv
        var pOrdreInv: number[] = [];
        for (var c = colMin; c <= colMax; c++) {
            var bottom = k.positionBottomCol(c),
                top = k.positionTopCol(c);
            for (var i = bottom; i <= top; i++) {
                if (WITH_TDS_HAUTBAS) {
                    pOrdreInv[this.iOrdreQhb(i, draw.nbOut)] = i;
                } else {
                    pOrdreInv[this.iOrdreQ(i, draw.nbOut)] = i;
                }
            }
        }

        //Nombre de Tête de série
        var nTeteSerie = draw.nbOut;
        if (nTeteSerie == 1) {
            nTeteSerie = k.countInCol((colMax - colMin) >> 1);
        }

        var max = k.positionMax(draw.nbColumn, draw.nbOut);
        var pbMatch: boolean[] = new Array(max + 1);

        var iJoueur = 0,
            m = 0,
            nj = 0;
        c = -1;
        for (var o = 0; o <= max; o++) {
            var b = pOrdreInv[o];
            if (b === -1) {
                continue;
            }
            if (k.column(b) != c) {
                c = k.column(b);

                m = m_nMatchCol[c] || 0;
                nj = c > colMin ? 2 * m_nMatchCol[c - 1] - m : 0;
            }

            //fou les joueurs
            var posMatch = k.positionMatch(b);
            if (nj > 0) {
                if (pbMatch[posMatch]) {
                    iJoueur++;
                    nj--;

                    var box = newBox(draw, this.event.matchFormat, b);
                    draw.boxes.push(box);
                }
            } else {
                //fou les matches
                if (m > 0 && (c === colMin || pbMatch[posMatch])) {
                    pbMatch[b] = true;
                    m--;

                    var match = <Match> newBox(draw, this.event.matchFormat, b);
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
            b = pOrdreInv[o];
            if (b === -1) {
                continue;
            }

            //fou les joueurs
            if (!pbMatch[b] && pbMatch[k.positionMatch(b)]) {

                //Qualifiés entrants se rencontrent
                var qualif: number = 'number' === typeof players[iJoueur] ? <number>players[iJoueur] : 0;
                if (qualif) {
                    var boxIn2 = <PlayerIn>this.findBox(k.positionOpponent(b));
                    if (boxIn2 && boxIn2.qualifIn) {
                        //2 Qualifiés entrants se rencontrent
                        for (var t = iJoueur + 1; t >= nTeteSerie; t--) {
                            if (isObject(players[t])) {
                                //switch
                                var p = players[t];
                                players[t] = qualif;
                                players[iJoueur] = p;
                                qualif = 0;
                                break;
                            }
                        }
                    }
                }

                var boxIn = <PlayerIn>this.findBox(b);
                if (boxIn) {
                    delete (boxIn as any).score; //not a match
                    if (qualif) {	//Qualifié entrant
                        this.setPlayerIn(boxIn, qualif);
                    } else {	//Joueur
                        this.putPlayer(boxIn, (players[iJoueur] as Player).id);

                        if ((!draw.minRank || !rank.isNC(draw.minRank))
                            || (!draw.maxRank || !rank.isNC(draw.maxRank))) {
                            //Mets les têtes de série (sauf tableau NC)
                            if (WITH_TDS_HAUTBAS) {
                                t = this.iTeteSerieQhb(b, draw.nbOut);
                            } else {
                                t = this.iTeteSerieQ(b, draw.nbOut);
                            }
                            if (t <= nTeteSerie && !this.findSeeded(draw, t)) {
                                boxIn.seeded = t;
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

        //	for( b=k.positionBottomCol(k.columnMin(draw.nbOut)); b<=k.positionMax(draw.nbColumn, draw.nbOut); b++)
        //		draw.boxes[ b].setLockMatch( false);

        //Mets les qualifiés sortants
        if (draw.type !== DrawType.Final) {

            //Find the first unused qualif number
            const group = groupDraw(draw);
            if (group) {
                for (i = 1; i <= MAX_QUALIF; i++) {
                    const [,m] = groupFindPlayerOut(this.event, group, i);
                    if (!m) {
                        break;
                    }
                }
            } else {
                i = 1;
            }

            bottom = k.positionBottomCol(colMin);
            top = k.positionTopCol(colMin);
            for (var b = top; b >= bottom && i <= MAX_QUALIF; b-- , i++) {
                var boxOut = <Match> this.findBox(b);
                if (boxOut) {
                    this.setPlayerOut(boxOut, i);
                }
            }
        }

        return draw;
    }

    /** @override */
    boxesOpponents(match: Match): { box1: Box; box2: Box } {
        
        var pos1 = k.positionOpponent1(match.position),
            pos2 = k.positionOpponent2(match.position);
        return {
            box1: < Box > by(this.draw.boxes, 'position', pos1),
            box2: <Box> by(this.draw.boxes, 'position', pos2)
        };
    }

    /** @override */
    computeScore(): boolean {
        return true;
    }

    isJoueurNouveau(box: Box): boolean {	//Première apparition du joueur dans le tableau
        if (!box) {
            return false;
        }
        var boxIn = box as PlayerIn;
        var opponents = this.boxesOpponents(box as Match);
        return !!box.playerId
            &&
            (
                !!boxIn.qualifIn
                ||
                !(
                    (opponents.box1 && opponents.box1.playerId)
                    ||
                    (opponents.box2 && opponents.box2.playerId)
                    )
                );
    }

    /** @override */
    setPlayerIn(box: PlayerIn, inNumber?: number, playerId?: string): boolean { //setPlayerIn
        // inNumber=0 => enlève qualifié

        //ASSERT(setPlayerInOk(iBoite, inNumber, iJoueur));

        if (inNumber) {	//Ajoute un qualifié entrant
            var prev = previousGroup(this.draw);
            if (!playerId && prev && prev.length && inNumber !== QEMPTY) {
                //Va chercher le joueur dans le tableau précédent
                const [d,boxOut] = groupFindPlayerOut(this.event, prev, inNumber);
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
            if (inNumber === QEMPTY ||
                !this.findPlayerIn(inNumber)) {

                box.qualifIn = inNumber;

                //Cache les boites de gauche
                this.iBoiteDeGauche(box.position, true, (box) => {
                    box.hidden = true;  //TODOjs delete the box from draw.boxes
                });
            }
        } else {	// Enlève un qualifié entrant

            box.qualifIn = 0;

            if (previousGroup(this.draw) && !this.removePlayer(box)) {
                ASSERT(false);
            }

            //Réaffiche les boites de gauche
            this.iBoiteDeGauche(box.position, true, (box) => {
                delete box.hidden;
            });
        }

        return true;
    }

    /** @override */
    setPlayerOut(box: Match, outNumber?: number): boolean { //setPlayerOut
        // outNumber=0 => enlève qualifié

        var next = nextGroup(this.draw);

        //ASSERT(setPlayerOutOk(iBoite, outNumber));

        if (outNumber) {	//Ajoute un qualifié sortant

            //Met à jour le tableau suivant
            if (next && box.playerId && box.qualifOut) {
                var [d,boxIn] = groupFindPlayerIn(this.event, next, outNumber);
                if (boxIn && d) {
                    ASSERT(boxIn.playerId === box.playerId);
                    const lib = drawLib(this.event, d);
                    if (!lib.removePlayer(boxIn)) {
                        throw "Can not remove player";
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
            if (next && box.playerId && boxIn) {
                if (!this.putPlayer(boxIn, box.playerId, true)) {
                }
            }

        } else {	//Enlève un qualifié sortant
            if (next && box.playerId && box.qualifOut) {
                //Met à jour le tableau suivant
                const [d,boxIn] = groupFindPlayerIn(this.event, next, box.qualifOut);
                if (boxIn && d) {
                    ASSERT(!!boxIn.playerId && boxIn.playerId === box.playerId);
                    const lib = drawLib(this.event, d);
                    if (!lib.removePlayer(boxIn, true)) {
                        throw "Can not remove player";
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
    findPlayerOut( iQualifie: number): Match | undefined {

        ASSERT(0 < iQualifie);

        if (iQualifie === QEMPTY || !this.draw.boxes) {
            return;
        }

        return by<Match>(this.draw.boxes as Match[], "qualifOut", iQualifie);
    }

    //private box1(match: Match): Box {
    //    var pos = k.positionOpponent1(match.position);
    //    return <Box> by(match._draw.boxes, 'position', pos);
    //}
    //private box2(match: Match): Box {
    //    var pos = k.positionOpponent2(match.position);
    //    return <Box> by(match._draw.boxes, 'position', pos);
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
    // iNew = i + pivot * 2 ^ Log2(i + 1)
    //
    //   pivot: iBoite qui est remplacée par 0
    //   i    : une case à gauche du pivot
    //   iNew : la même case après décalage

    private iBoiteDeGauche(iBoite: number,  bToutesBoites: boolean, callback: (box: Box) => void): void {

        var b: number;
        var bOk: boolean = false;

        //ASSERT_VALID(pTableau);

        for (var iBoiteCourante = iBoite; ;) {
            var j = iBoiteCourante - iBoite * exp2(log2(iBoiteCourante + 1) - log2(iBoite + 1));
            do {
                j++;
                b = j + iBoite * exp2(log2(j + 1));

                var box = this.findBox(b);
                if (!box) {
                    return;
                }
                bOk = (!!box.playerId || bToutesBoites);
            } while (!bOk);

            if (bOk) {
                callback(box);
            }
            iBoiteCourante = b;
        }
    }

    private positionPivotLeft(pos: number, pivot: number): number {    //iBoitePivotGauche
        return pos + pivot * exp2(log2(pos + 1));
    }

    //Têtes de série de bas en haut (FFT)

    //Numéro du tête de série d'une boite (identique dans plusieurs boites)
    private iTeteSerieQ(i: number, nQualifie: number): number {
        
        //ASSERT(0 <= i && i < MAX_BOITE);
        ASSERT(1 <= nQualifie && nQualifie <= k.countInCol(k.column(i)));

        if (k.column(i) === k.columnMin(nQualifie)) {
            //Colonne de droite, numéroter 1 à n en partant du bas (OK!)
            if (nQualifie === 1 << k.column(nQualifie - 1)) { 	//Puissance de deux ?
                return i === 0 ? 1 : this.iTeteSerieQ(i, 1);	// TODO à corriger
            } else {
                return 1 + this.iPartieQ(i, nQualifie);
            }
        } else {
            //Tête de série précédente (de droite)
            var t = this.iTeteSerieQ(k.positionMatch(i), nQualifie),
                v: boolean,
                d: number,
                c: number;

            if (nQualifie == 1 << k.column(nQualifie - 1)) {	//Puissance de deux ?
                d = i;
            } else {
                d = this.iDecaleGaucheQ(i, nQualifie);
            }

            v = !!(d & 1);	//Ok pour demi-partie basse

            if ((c = k.column(d)) > 1
                && d > k.positionTopCol(c) - (k.countInCol(c, nQualifie) >> 1)) {
                v = !v;		//Inverse pour le demi-partie haute
            }

            return v ?
                t :			//La même tête de série se propage
                1 + k.countInCol(k.column(i), nQualifie) - t;	//Nouvelle tête de série complémentaire
        }
    }

    //Ordre de remplissage des boites en partant de la droite
    //et en suivant les têtes de série
    private iOrdreQ(i: number, nQualifie: number): number {
        
        //ASSERT(0 <= i && i < MAX_BOITE);
        ASSERT(1 <= nQualifie && nQualifie <= k.countInCol(k.column(i)));
        return this.iTeteSerieQ(i, nQualifie) - 1
            + k.countInCol(k.column(i), nQualifie)
            - nQualifie;
    }

    //Partie du tableau de i par rapport au qualifié sortant
    //retour: 0 à nQualifie-1, en partant du bas
    iPartieQ(i: number, nQualifie: number): number {   //not private for Sped?
        
        //ASSERT(0 <= i && i < MAX_BOITE);
        ASSERT(1 <= nQualifie && nQualifie <= k.countInCol(k.column(i)));
        var c = k.column(i);
        return Math.floor((i - k.positionBottomCol(c, nQualifie)) / k.countInCol(c - k.columnMin(nQualifie)));
        // 	return MulDiv( i - k.positionBottomCol(c, nQualifie), 1, k.countInCol(c - k.columnMin( nQualifie)) );
        //TODOjs? pb division entière
    }

    //Numére de boite de la partie de tableau, ramenée à un seul qualifié
    private iDecaleGaucheQ(i: number, nQualifie: number): number {
        
        //ASSERT(0 <= i && i < MAX_BOITE);
        ASSERT(1 <= nQualifie && nQualifie <= k.countInCol(k.column(i)));
        var c: number = k.column(i);
        return i
            - this.iPartieQ(i, nQualifie) * k.countInCol(c - k.columnMin(nQualifie))
            - k.positionBottomCol(c, nQualifie)
            + k.positionBottomCol(c - k.columnMin(nQualifie));
    }


    //Têtes de série de haut en bas (non FFT)

    //Numéro du tête de série d'une boite (identique dans plusieurs boites)
    private iTeteSerieQhb(i: number, nQualifie: number): number {
        
        //ASSERT(0 <= i && i < MAX_BOITE);
        ASSERT(1 <= nQualifie && nQualifie <= k.countInCol(k.column(i)));

        if (k.column(i) === k.columnMin(nQualifie)) {
            //Colonne de droite, numéroter 1 à n en partant du bas (OK!)
            if (nQualifie === 1 << k.column(nQualifie - 1)) 	//Puissance de deux ?
                return i == 0 ? 1 : this.iTeteSerieQhb(i, 1);	// TODO à corriger
            else
                return 1 + this.iPartieQhb(i, nQualifie);
        } else {
            //Tête de série précédente (de droite)
            var t: number = this.iTeteSerieQhb(k.positionMatch(i), nQualifie),
                v: boolean,
                d: number,
                c: number;

            if (nQualifie === 1 << k.column(nQualifie - 1)) {	//Puissance de deux ?
                d = i;
            } else {
                d = this.iDecaleGaucheQhb(i, nQualifie);
            }
            v = !!(d & 1);	//Ok pour demi-partie basse

            if ((c = k.column(d)) > 1
                && d <= k.positionTopCol(c) - (k.countInCol(c) >> 1)) {
                v = !v;		//Inverse pour le demi-partie basse		//v1.11.0.1 (décommenté)
            }
            return !v ?		//seul différence haut-bas !
                t :			//La même tête de série se propage
                1 + k.countInCol(k.column(i), nQualifie) - t;	//Nouvelle tête de série complémentaire
        }
    }

    //Ordre de remplissage des boites en partant de la droite
    //et en suivant les têtes de série
    private iOrdreQhb(i: number, nQualifie: number): number {
        
        //ASSERT(0 <= i && i < MAX_BOITE);
        ASSERT(1 <= nQualifie && nQualifie <= k.countInCol(k.column(i)));
        return this.iTeteSerieQhb(i, nQualifie) - 1
            + k.countInCol(k.column(i), nQualifie)
            - nQualifie;
    }

    //Partie du tableau de i par rapport au qualifié sortant
    //retour: 0 à nQualifie-1, en partant du bas
    private iPartieQhb(i: number, nQualifie: number): number {
        
        //ASSERT(0 <= i && i < MAX_BOITE);
        ASSERT(1 <= nQualifie && nQualifie <= k.countInCol(k.column(i)));
        var c: number = k.column(i);
        //	return (i - k.positionBottomCol(c, nQualifie) ) / k.countInCol(c - k.columnMin( nQualifie) );  
        return (nQualifie - 1) - Math.floor((i - k.positionBottomCol(c, nQualifie)) / k.countInCol(c - k.columnMin(nQualifie)));
        // 	return MulDiv( i - k.positionBottomCol(c, nQualifie), 1, k.countInCol(c - k.columnMin( nQualifie)) );
        //TODOjs? pb division entière
    }

    private iDecaleGaucheQhb(i: number, nQualifie: number): number {
        
        //ASSERT(0 <= i && i < MAX_BOITE);
        ASSERT(1 <= nQualifie && nQualifie <= k.countInCol(k.column(i)));
        var c: number = k.column(i);
        return i
            - (nQualifie - 1 - this.iPartieQhb(i, nQualifie)) * k.countInCol(c - k.columnMin(nQualifie))
            - k.positionBottomCol(c, nQualifie)
            + k.positionBottomCol(c - k.columnMin(nQualifie));
    }
}

function ASSERT(b: boolean, message?: string): void {
    if (!b) {
        debugger;
        throw message || 'Assertion is false';
    }
}

function log2(x: number): number {
    ASSERT(x > 0);
    var sh = x;
    for (var i = -1; sh; sh >>= 1, i++);
    return i;
}

function exp2(col: number): number {
    return 1 << col;
}