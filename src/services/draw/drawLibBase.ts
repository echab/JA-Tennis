import { DrawEditor } from '../drawEditor';
import { Find } from '../util/find';
import { Guid } from '../util/guid';
import { isArray } from '../util/object';
import { LibLocator } from '../libLocator';

var MAX_TETESERIE = 32,
    MAX_QUALIF = 32,
    QEMPTY = - 1;

export abstract class DrawLibBase {

    abstract nbColumnForPlayers(draw: Draw, nJoueur: number): number;
    abstract getSize(draw: Draw): ISize;
    abstract computePositions(draw: Draw): IPoint[];
    abstract resize(draw: Draw, oldDraw?: Draw, nJoueur?: number): void;
    abstract generateDraw(draw: Draw, generate: GenerateType, afterIndex: number): Draw[];

    resetDraw(draw: Draw, nPlayer: number): void {
        //remove qualif out
        var next = DrawEditor.nextGroup(draw);
        if (next && draw.boxes) {
            for (var i = 0; i < next.length; i++) {
                var boxes = next[i].boxes;
                if (boxes) {
                    var drawLibNext = LibLocator.drawLibFor( next[i]);
                    for (var b = 0; b < boxes.length; b++) {
                        var box = <Match> boxes[b];
                        if (box && box.qualifOut) {
                            drawLibNext.setPlayerOut(box);
                        }
                    }
                }
            }
        }

        //reset boxes
        var lib = LibLocator.drawLibFor( draw);
        draw.boxes = [];
        draw.nbColumn = lib.nbColumnForPlayers(draw, nPlayer);
    }

    getPlayer(box: Box): Player {
        return Find.byId(box._draw._event._tournament.players, box.playerId);
    }

    //setType(BYTE iType) {
    //    //ASSERT(TABLEAU_NORMAL <= iType && iType <= TABLEAU_POULE_AR);
    //    if ((m_iType & TABLEAU_POULE ? 1 : 0) != (iType & TABLEAU_POULE ? 1 : 0)) {

    //        //Efface les boites si poule et plus poule ou l'inverse
    //        for (; m_nBoite > 0; m_nBoite--) {
    //            delete draw.boxes[m_nBoite - 1];
    //            draw.boxes[m_nBoite - 1] = NULL;
    //        }
    //        m_nColonne = 0;
    //        m_nQualifie = 0;
    //    }

    //    m_iType = iType;
    //}

    isSlot(box: Match): boolean {  //isCreneau
        return isMatch(box) && (!!box.place || !!box.date);
    }

    findSeeded(origin: Draw | Draw[], iTeteSerie: number): PlayerIn {    //FindTeteSerie
        ASSERT(1 <= iTeteSerie && iTeteSerie <= MAX_TETESERIE);
        var group = isArray(origin) ? <Draw[]>origin : DrawEditor.group(<Draw>origin);
        for (var i = 0; i < group.length; i++) {
            var boxes = group[i].boxes;
            for (var j = 0; j < boxes.length; j++) {
                var boxIn: PlayerIn = boxes[j];
                if (boxIn.seeded === iTeteSerie) {
                    return boxIn;
                }
            }
        }
        return null;
    }

    /**
         * Fill or erase a box with qualified in and/or player
        * setPlayerIn
        * 
        * @param box 
        * @param inNumber (optional)
        * @param player   (optional)
        */
//         setPlayerIn(box: PlayerIn, inNumber?: number, player?: Player): boolean {
//             // inNumber=0 => enlève qualifié
//             return this._drawLibs[box._draw.type].setPlayerIn(box, inNumber, player);
//         }
// 
//         setPlayerOut(box: Match, outNumber?: number): boolean { //setPlayerOut
//             // iQualifie=0 => enlève qualifié
//             return this._drawLibs[box._draw.type].setPlayerOut(box, outNumber);
//         }
// 
//         computeScore(draw: Draw): boolean {
//             return this._drawLibs[draw.type].computeScore(draw);
//         }

    //Programme un joueur, gagnant d'un match ou (avec bForce) report d'un qualifié entrant
    putPlayer(box: Box, player: Player, bForce?: boolean): boolean {   //MetJoueur

        //ASSERT(MetJoueurOk(box, iJoueur, bForce));

        if (box.playerId !== player.id && box.playerId) {
            if (!this.removePlayer(box)) {		//Enlève le joueur précédent
                throw 'Error';
            }
        }

        var boxIn = <PlayerIn>box;
        var match = isMatch(box) ? <Match>box : undefined;
        box.playerId = player.id;
        box._player = player;
        //boxIn.order = 0;
        //match.score = '';

        if (isGauchePoule(box)) {
            //TODO boxIn.rank = 0;   //classement de la poule
        } else if (match) {
            match.date = undefined;
            match.place = undefined;
        }

        var boxOut = <Match>box;
        if (boxOut.qualifOut) {
            var next = DrawEditor.nextGroup(box._draw);
            if (next) {
                var boxIn = DrawEditor.groupFindPlayerIn(next, boxOut.qualifOut);
                if (boxIn) {
                    if (!boxIn.playerId
                        && !this.putPlayer(boxIn, player, true)) {
                        throw 'Error';
                    }
                }
            }
        }

        ////Lock les adversaires (+ tableau précédent si qualifié entrant)
        //if( isMatchJoue( box))	//if( isMatchJouable( box))
        //{
        //    lockBox( ADVERSAIRE1(box));
        //    lockBox( ADVERSAIRE2(box));
        //}

        ////Lock les boites du match, si on a ajouter un des deux adversaires aprés le résultat...
        //if( isTypePoule()) {
        //    if( isGauchePoule( box)) {
        //        //matches de la ligne
        //        for( i=ADVERSAIRE1( box) - GetnColonne(); i>= iBoiteMin(); i -= GetnColonne()) {
        //            if( i != box && isMatchJoue( i)) {
        //                lockBox( box);
        //                lockBox( ADVERSAIRE1( i));
        //                lockBox( ADVERSAIRE2( i));
        //            }
        //        }
        //        //matches de la colonne
        //        for( i=iHautCol( iRowPoule( box, GetnColonne())); i>= iBasColQ( iRowPoule( box, GetnColonne())); i --) {
        //            if( i != box && isMatchJoue( i)) {
        //                lockBox( box);
        //                lockBox( ADVERSAIRE1( i));
        //                lockBox( ADVERSAIRE2( i));
        //            }
        //        }
        //    }
        //    computeScore( (CDocJatennis*)((CFrameTennis*)AfxGetMainWnd())->GetActiveDocument());
        //    //TODO Poule, Lock
        //} else
        //if( iBoiteMin() <= IAUTRE( box) 
        // && iBoiteMin() <= IMATCH( box) 
        // && boxes[ IAUTRE( box)]->isJoueur()
        // && boxes[ IMATCH( box)]->isJoueur()) {
        //    lockBox( box);
        //    lockBox( IAUTRE( box));
        //}

        return true;
    }

    //Résultat d'un match : met le gagnant (ou le requalifié) et le score dans la boite
    putResult(box: Match, boite: Match): boolean {   //SetResultat
        //ASSERT(SetResultatOk(box, boite));

        //v0998
        //	//Check changement de vainqueur par vainqueur défaillant
        //	if( !isTypePoule())
        //	if( boite.score.isVainqDef()) {
        //		if( boite.m_iJoueur == boxes[ ADVERSAIRE1(box)]->m_iJoueur)
        //			boite.m_iJoueur = boxes[ ADVERSAIRE2(box)]->m_iJoueur;
        //		else
        //			boite.m_iJoueur = boxes[ ADVERSAIRE1(box)]->m_iJoueur;
        //	}

        if (boite.playerId) {
            if (!this.putPlayer(box, boite._player)) {
                throw 'Error';
            }
        } else if (!this.removePlayer(box)) {
            throw 'Error';
        }

        box.score = boite.score;

        var lib = LibLocator.drawLibFor(box._draw);  
        lib.computeScore(box._draw);

        return true;
    }

    //Planification d'un match : met le court, la date et l'heure
    putSlot(box: Match, boite: Match): boolean {    //MetCreneau
        ASSERT(isMatch(box));
        //ASSERT(MetCreneauOk(box, boite));

        box.place = boite.place;
        box.date = boite.date;

        return true;
    }

    removeSlot(box: Match): boolean {  //EnleveCreneau
        ASSERT(isMatch(box));
        //ASSERT(EnleveCreneauOk(box));

        box.place = undefined;
        box.date = undefined;

        return true;
    }

    putTick(box: Box, boite: Box): boolean {   //MetPointage
        //ASSERT(MetPointageOk(box, boite));

        //TODO
        //box.setPrevenu(box, boite.isPrevenu(box));
        //box.setPrevenu(box + 1, boite.isPrevenu(box + 1));
        //box.setRecoit(box, boite.isRecoit(box));

        return true;
    }

    //Déprogramme un joueur, enlève le gagnant d'un match ou (avec bForce) enlève un qualifié entrant
    removePlayer(box: Box, bForce?: boolean): boolean {   //EnleveJoueur

        var match = <Match>box;
        if (!match.playerId && !match.score) {
            return true;
        }

        //ASSERT(EnleveJoueurOk(box, bForce));

        var next = DrawEditor.nextGroup(box._draw);
        var boxOut = <Match> box;
        var i: number;
        if ((i = boxOut.qualifOut) && next) {
            var boxIn = DrawEditor.groupFindPlayerIn(next, i);
            if (boxIn) {
                if (!this.removePlayer(boxIn, true)) {
                    throw 'Error';
                }
            }
        }

        box.playerId = box._player = undefined;
        if (isMatch(box)) {
            match.score = '';
        }

        var boxIn = <PlayerIn>box;
        //delete boxIn.order;
        /*
            //Delock les adversaires
            if( isTypePoule()) {
                if( isMatch( box)) {
                    //Si pas d'autre matches dans la ligne, ni dans la colonne
                    BOOL bMatch = false;

                    //matches de la ligne
                    for( i=ADVERSAIRE1( box) - GetnColonne(); 
                        i>= iBoiteMin() && !bMatch; 
                        i -= GetnColonne()) 
                    {
                        if( i != box && boxes[ i]->isLock()) {
                            bMatch = true;
                            break;
                        }
                    }
                    //matches de la colonne
                    for( i=iHautCol( iRowPoule( ADVERSAIRE1( box), GetnColonne())); 
                        i>= iBasColQ( iRowPoule( ADVERSAIRE1( box), GetnColonne())) && !bMatch; 
                        i --) 
                    {
                        if( i != box && boxes[ i]->isLock()) {
                            bMatch = true;
                            break;
                        }
                    }
                    if( !bMatch)
                        unlockBox( ADVERSAIRE1(box));

                    bMatch = false;
                    //matches de la ligne
                    for( i=ADVERSAIRE2( box) - GetnColonne(); 
                        i>= iBoiteMin() && !bMatch; 
                        i -= GetnColonne())
                    {
                        if( i != box && boxes[ i]->isLock()) {
                            bMatch = true;
                            break;
                        }
                    }
                    //matches de la colonne
                    for( i=iHautCol( iRowPoule( ADVERSAIRE2( box), GetnColonne())); 
                        i>= iBasColQ( iRowPoule( ADVERSAIRE2( box), GetnColonne())) && !bMatch; 
                        i --) 
                    {
                        if( i != box && boxes[ i]->isLock()) {
                            bMatch = true;
                            break;
                        }
                    }
                    if( !bMatch)
                        unlockBox( ADVERSAIRE2(box));
        
                }

                this.computeScore(box._draw);
                //TODO Poule, Unlock
            } else
            if(  ADVERSAIRE1(box) <= iBoiteMax()) {
                unlockBox( ADVERSAIRE1(box));
                unlockBox( ADVERSAIRE2(box));
            }
        */
        return true;
    }

    //Avec report sur le tableau suivant
    lockBox(box: Box): boolean {    //LockBoite
        ASSERT(!!box);

        if (iDiagonale(box) === box.position) {
            ///TODO box = ADVERSAIRE1(box);
        }

        ASSERT(!!box);
        //ASSERT(box.isJoueur());

        if (box.hidden) {
            return true;
        }

        box.locked = true;

        var prev = DrawEditor.previousGroup(box._draw);
        if (prev) {
            var boxIn = <PlayerIn>box;
            if (boxIn.qualifIn) {
                var boxOut = DrawEditor.groupFindPlayerOut(prev, boxIn.qualifIn);
                if (boxOut) {
                    boxOut.locked = true;
                }
            }
        }

        return true;
    }

    //Avec report sur le tableau précédent
    unlockBox(box: Box): boolean {  //DelockBoite

        if (box.hidden) {
            return true;
        }

        delete box.locked;

        var prev = DrawEditor.previousGroup(box._draw);
        if (prev) {
            var boxIn = <PlayerIn>box;
            if (boxIn.qualifIn) {
                var boxOut = DrawEditor.groupFindPlayerOut(prev, boxIn.qualifIn);
                if (boxOut) {
                    delete boxOut.locked;
                }
            }
        }

        return true;
    }

    //Rempli une boite proprement
    fillBox(box: Box, source: Box): boolean {   //RempliBoite
        //ASSERT(RempliBoiteOk(box, boite));

        var lib = LibLocator.drawLibFor(box._draw);

        var boxIn = <PlayerIn>box;
        var sourceIn = <PlayerIn>source;
        var match = isMatch(box) ? <Match>box : undefined;
        var sourceMatch = isMatch(source) ? <Match>source : undefined;

        if (boxIn.qualifIn
            && boxIn.qualifIn !== sourceIn.qualifIn) {

            if (!lib.setPlayerIn(box)) {	//Enlève
                throw 'Error';
            }
        } else {
            //Vide la boite écrasée
            if (!this.removePlayer(box)) {	//enlève le joueur, le score
                throw 'Error';
            }

            delete boxIn.qualifIn;
            delete boxIn.seeded;
            delete match.qualifOut;

            if (this.isSlot(match)) {
                if (!this.removeSlot(match)) {
                    throw 'Error';
                }
            }
        }

        //Rempli avec les nouvelles valeurs
        if (sourceIn.qualifIn) {
            if (!lib.setPlayerIn(box, sourceIn.qualifIn, source._player)) {
                throw 'Error';
            }
        } else {
            if (source.playerId) {
                if (!this.putPlayer(box, source._player)) {
                    throw 'Error';
                }
                if (match) {
                    match.score = sourceMatch.score;
                }
            }

            if (!isTypePoule(box._draw) && sourceIn.seeded) {
                boxIn.seeded = sourceIn.seeded;
            }

            if (match) {
                if (sourceMatch.qualifOut) {
                    if (!lib.setPlayerOut(match, sourceMatch.qualifOut)) {
                        throw 'Error';
                    }
                }

                //if( isCreneau( box))
                //v0998
                var opponents = lib.boxesOpponents(match);
                if (opponents.box1 && opponents.box2
                    && (sourceMatch.place || sourceMatch.date)
                    ) {
                    if (!this.putSlot(match, sourceMatch)) {
                        throw 'Error';
                    }
                }

                if (!this.putTick(box, source)) {
                    throw 'Error';
                }
                match.matchFormat = sourceMatch.matchFormat;

                match.note = match.note;
            }
        }

        lib.computeScore(box._draw);

        return true;
    }

    movePlayer(box: Box, boiteSrc: Box, pBoite: Box): boolean {  //DeplaceJoueur
        //ASSERT(DeplaceJoueurOk(box, iBoiteSrc, pBoite));

        boiteSrc = DrawEditor.newBox(box._draw, boiteSrc);

        if (!this.fillBox(boiteSrc, pBoite)) {	//Vide la source
            throw 'Error';
        }

        if (!this.fillBox(box, boiteSrc)) {	//Rempli la destination
            throw 'Error';
        }

        return true;
    }

    // boxesOpponents(match: Match): { box1: Box; box2: Box } {
    //     return this._drawLibs[match._draw.type].boxesOpponents(match);
    // }
}

function isMatch(box: Box): boolean {
    return box && ('undefined' !== typeof (<Match>box).score);
}

//TODO move roundrobin specific code to roundrobin.ts
function isTypePoule(draw: Draw): boolean {
    return draw.type === DrawType.PouleSimple || draw.type === DrawType.PouleAR;
}

function iDiagonale(box: Box): number {
    var draw = box._draw;
    return isTypePoule(box._draw) ? (box.position % draw.nbColumn) * (draw.nbColumn + 1) : box.position;
}
function isGauchePoule(box: Box): boolean {
    return isTypePoule(box._draw) ? (box.position >= (box._draw.nbColumn * box._draw.nbColumn)) : false;
}

function ADVERSAIRE1(box: Box): number {
    if (isTypePoule(box._draw)) {
        var n = box._draw.nbColumn;
        return box.position % n + n * n;
    } else {
        return (box.position << 1) + 2;
    }
};
function ADVERSAIRE2(box: Box): number {
    if (isTypePoule(box._draw)) {
        var n = box._draw.nbColumn;
        return Math.floor(box.position / n) + n * n;
    } else {
        return (box.position << 1) + 1;
    }
};

function ASSERT(b: boolean, message?: string): void {
    if (!b) {
        debugger;
        throw message || 'Assertion is false';
    }
}
