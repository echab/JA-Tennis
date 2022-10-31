import { Draw, Box, DrawType, Match, PlayerIn } from '../../domain/draw';
import type { Player } from '../../domain/player';
import type { TEvent } from '../../domain/tournament';
import { nextGroup, groupFindPlayerOut, newBox, previousGroup, isMatch, isSlot, isPlayerIn } from '../drawService';
import { drawLib, GenerateType, IDrawLib } from './drawLib';
import { by } from '../util/find';

const MAX_TETESERIE = 32,
    MAX_QUALIF = 32,
    QEMPTY = - 1;

export abstract class DrawLibBase implements IDrawLib {

    constructor(public event: TEvent, public draw: Draw) {}

    abstract nbColumnForPlayers( nJoueur: number): number;
    abstract resize( oldDraw?: Draw, nJoueur?: number): void;
    abstract generateDraw( generate: GenerateType, registeredPlayersOrQ: (Player|number)[]): Draw[];

    abstract setPlayerOut(box: Match, outNumber?: number): boolean; //SetQualifieSortant
    abstract findPlayerIn(inNumber: number): PlayerIn | undefined; //FindQualifieEntrant
    abstract findPlayerOut(outNumber: number): Match | undefined; //FindQualifieSortant
    abstract computeScore(): boolean; //CalculeScore
    abstract boxesOpponents(match: Match): { box1: Box; box2: Box };
    abstract isJoueurNouveau(box: Box): boolean;
  
    protected findBox<T extends Box = Box>(position: number, create?: boolean): T | undefined {
        let box = by(this.draw.boxes, 'position', position);
        if (!box && create) {
            box = newBox<T>(this.draw, undefined, position);
        }
        return box as T;
    }

    resetDraw( nPlayer: number): void {
        //remove qualif out
        const next = nextGroup(this.event, this.draw);
        if (next && this.draw.boxes) {
            const [groupStart, groupEnd] = next;
            for (let i = groupStart; i < groupEnd; i++) {
                const d = this.event.draws[i];
                const boxes = d.boxes;
                if (boxes) {
                    const drawLibNext = drawLib(this.event, d);
                    for (let b = 0; b < boxes.length; b++) {
                        const box = boxes[b] as Match | undefined;
                        if (box?.qualifOut) {
                            drawLibNext.setPlayerOut(box);
                        }
                    }
                }
            }
        }

        //reset boxes
        // const lib = drawLib(this.event, this.draw); // TODO lib === this
        this.draw.boxes = [];
        this.draw.nbColumn = this.nbColumnForPlayers(nPlayer);
    }

    // getPlayer(box: Box): Player {
    //     return byId(box._draw._event._tournament.players, box.playerId);
    // }

    //setType(BYTE iType) {
    //    //ASSERT(TABLEAU_NORMAL <= iType && iType <= TABLEAU_POULE_AR);
    //    if ((m_iType & TABLEAU_POULE ? 1 : 0) != (iType & TABLEAU_POULE ? 1 : 0)) {

    //        //Efface les boites si poule et plus poule ou l'inverse
    //        for (; m_nBoite > 0; m_nBoite--) {
    //            delete this.draw.boxes[m_nBoite - 1];
    //            this.draw.boxes[m_nBoite - 1] = NULL;
    //        }
    //        m_nColonne = 0;
    //        m_nQualifie = 0;
    //    }

    //    m_iType = iType;
    //}

    // /**
    //  * Fill or erase a box with qualified in and/or player
    //  * setPlayerIn
    //  * 
    //  * @param box 
    //  * @param inNumber (optional)
    //  * @param player   (optional)
    //  */
    // setPlayerIn(box: PlayerIn, inNumber?: number, player?: Player): boolean {
    //     // inNumber=0 => enlève qualifié
    //     return this._drawLibs[box._draw.type].setPlayerIn(box, inNumber, player);
    // }

    // setPlayerOut(box: Match, outNumber?: number): boolean { //setPlayerOut
    //     // iQualifie=0 => enlève qualifié
    //     return this._drawLibs[box._draw.type].setPlayerOut(box, outNumber);
    // }

    // computeScore(): boolean {
    //     return this._drawLibs[this.draw.type].computeScore(this.draw);
    // }

    //Programme un joueur, gagnant d'un match ou (avec bForce) report d'un qualifié entrant
    putPlayer(box: Box, playerId: string, boxQ?: Box, bForce?: boolean): boolean {   //MetJoueur

        //ASSERT(MetJoueurOk(box, iJoueur, bForce));

        if (box.playerId !== playerId && box.playerId) {
            if (!this.removePlayer(box)) {		//Enlève le joueur précédent
                throw new Error('error');
            }
        }

        const boxIn = isPlayerIn(box) ? box : undefined;
        const match = isMatch(box) ? box : undefined;
        box.playerId = playerId;
        // box._player = player;
        //boxIn.order = 0;
        //match.score = '';

        if (this.isGauchePoule(box)) {
            //TODO boxIn.rank = 0;   //classement de la poule
        } else if (match) {
            match.date = undefined;
            match.place = undefined;
        }

        // const boxOut = box as Match;
        // if (boxOut.qualifOut) {
        //     const next = nextGroup(this.event, this.draw);
        //     if (next) {
        //         const [,boxIn] = groupFindPlayerIn(this.event, next, boxOut.qualifOut);
        //         if (boxIn) {
        //             if (!boxIn.playerId
        //                 && !this.putPlayer(boxIn, playerId, true)) {
        //                 throw new Error('error');
        //             }
        //         }
        //     }
        // }
        if (boxQ) {
            boxQ.playerId = playerId;
        }

        ////Lock les adversaires (+ tableau précédent si qualifié entrant)
        //if( isMatchJoue( box))	//if( isMatchJouable( box))
        //{
        //    lockBox( this.ADVERSAIRE1(box));
        //    lockBox( this.ADVERSAIRE2(box));
        //}

        ////Lock les boites du match, si on a ajouter un des deux adversaires aprés le résultat...
        //if( this.isTypePoule()) {
        //    if (this.isGauchePoule( box)) {
        //        //matches de la ligne
        //        for( i=this.ADVERSAIRE1( box) - GetnColonne(); i>= iBoiteMin(); i -= GetnColonne()) {
        //            if( i != box && isMatchJoue( i)) {
        //                lockBox( box);
        //                lockBox( this.ADVERSAIRE1( i));
        //                lockBox( this.ADVERSAIRE2( i));
        //            }
        //        }
        //        //matches de la colonne
        //        for( i=iHautCol( iRowPoule( box, GetnColonne())); i>= iBasColQ( iRowPoule( box, GetnColonne())); i --) {
        //            if( i != box && isMatchJoue( i)) {
        //                lockBox( box);
        //                lockBox( this.ADVERSAIRE1( i));
        //                lockBox( this.ADVERSAIRE2( i));
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

    setPlayerIn(box: PlayerIn, inNumber?: number, playerId?: string): boolean { //setPlayerIn
        // inNumber=0 => enlève qualifié

        //ASSERT(setPlayerInOk(iBoite, inNumber, iJoueur));

        if (inNumber) {	//Ajoute un qualifié entrant
            const prev = previousGroup(this.event, this.draw);
            if (!playerId && prev && inNumber != QEMPTY) {
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
            if (inNumber == QEMPTY ||
                !this.findPlayerIn(inNumber)) {

                box.qualifIn = inNumber;
            }
        } else {	// Enlève un qualifié entrant

            box.qualifIn = 0;

            if (previousGroup(this.event, this.draw) && !this.removePlayer(box)) {
                ASSERT(false);
            }
        }

        return true;
    }

    // TODO? move base setPlayerOut here

    //Résultat d'un match : met le gagnant (ou le requalifié) et le score dans la boite
    putResult(box: Match, result: Match, boxQ?: Box): boolean {   //SetResultat
        //ASSERT(SetResultatOk(box, result));

        //v0998
        //	//Check changement de vainqueur par vainqueur défaillant
        //	if( !this.isTypePoule())
        //	if( result.score.isVainqDef()) {
        //		if( result.m_iJoueur == boxes[ this.ADVERSAIRE1(box)]->m_iJoueur)
        //			result.m_iJoueur = boxes[ this.ADVERSAIRE2(box)]->m_iJoueur;
        //		else
        //			result.m_iJoueur = boxes[ this.ADVERSAIRE1(box)]->m_iJoueur;
        //	}

        // TODO simplify: if qualifOut, find the qualifIn matching box in next draw group
        // const boxOut = box as Match;
        // const [nextDraw,boxIn] = groupFindPlayerIn(this.event, next, boxOut.qualifOut);

        if (result.playerId) {
            if (!this.putPlayer(box, result.playerId, boxQ)) {
                throw new Error('error');
            }
        } else if (!this.removePlayer(box, boxQ)) {
            throw new Error('error');
        }

        box.score = result.score;

        drawLib(this.event, this.draw).computeScore();

        return true;
    }

    //Planification d'un match : met le court, la date et l'heure
    putSlot(box: Match, slot: Match): boolean {    //MetCreneau
        ASSERT(isMatch(box));
        //ASSERT(MetCreneauOk(box, slot));

        box.place = slot.place;
        box.date = slot.date;

        return true;
    }

    removeSlot(box: Match): boolean {  //EnleveCreneau
        ASSERT(isMatch(box));
        //ASSERT(EnleveCreneauOk(box));

        box.place = undefined;
        box.date = undefined;

        return true;
    }

    putTick(box: Box, tick: Box): boolean {   //MetPointage
        //ASSERT(MetPointageOk(box, tick));

        //TODO
        //box.setPrevenu(box, tick.isPrevenu(box));
        //box.setPrevenu(box + 1, tick.isPrevenu(box + 1));
        //box.setRecoit(box, tick.isRecoit(box));

        return true;
    }

    //Déprogramme un joueur, enlève le gagnant d'un match ou (avec bForce) enlève un qualifié entrant
    removePlayer(box: Box, boxQ?: Box, bForce?: boolean): boolean {   //EnleveJoueur

        if (isMatch(box)) {
            if (!box.playerId && !box.score) {
                return true;
            }
            box.score = '';
        }

        //ASSERT(EnleveJoueurOk(box, bForce));

        // const next = nextGroup(this.event, this.draw);
        // const boxOut = box as Match;
        // if (boxOut.qualifOut && next) {
        //     const [,boxIn] = groupFindPlayerIn(this.event, next, boxOut.qualifOut);
        //     if (boxIn) {
        //         if (!this.removePlayer(boxIn, true)) {
        //             throw new Error('error');
        //         }
        //     }
        // }
        if (boxQ) {
            // this.removePlayer(boxQ);
            boxQ.playerId = undefined;
        }

        box.playerId = undefined;

        /*
        const boxIn = box as PlayerIn;
        //delete boxIn.order;
    
        //Delock les adversaires
        if( this.isTypePoule()) {
            if( isMatch( box)) {
                //Si pas d'autre matches dans la ligne, ni dans la colonne
                BOOL bMatch = false;

                //matches de la ligne
                for( i=this.ADVERSAIRE1( box) - GetnColonne(); 
                    i>= iBoiteMin() && !bMatch; 
                    i -= GetnColonne()) 
                {
                    if( i != box && boxes[ i]->isLock()) {
                        bMatch = true;
                        break;
                    }
                }
                //matches de la colonne
                for( i=iHautCol( iRowPoule( this.ADVERSAIRE1( box), GetnColonne())); 
                    i>= iBasColQ( iRowPoule( this.ADVERSAIRE1( box), GetnColonne())) && !bMatch; 
                    i --) 
                {
                    if( i != box && boxes[ i]->isLock()) {
                        bMatch = true;
                        break;
                    }
                }
                if( !bMatch)
                    unlockBox( this.ADVERSAIRE1(box));

                bMatch = false;
                //matches de la ligne
                for( i=this.ADVERSAIRE2( box) - GetnColonne(); 
                    i>= iBoiteMin() && !bMatch; 
                    i -= GetnColonne())
                {
                    if( i != box && boxes[ i]->isLock()) {
                        bMatch = true;
                        break;
                    }
                }
                //matches de la colonne
                for( i=iHautCol( iRowPoule( this.ADVERSAIRE2( box), GetnColonne())); 
                    i>= iBasColQ( iRowPoule( this.ADVERSAIRE2( box), GetnColonne())) && !bMatch; 
                    i --) 
                {
                    if( i != box && boxes[ i]->isLock()) {
                        bMatch = true;
                        break;
                    }
                }
                if( !bMatch)
                    unlockBox( this.ADVERSAIRE2(box));
    
            }

            this.computeScore(box._draw);
            //TODO Poule, Unlock
        } else
        if(  this.ADVERSAIRE1(box) <= iBoiteMax()) {
            unlockBox( this.ADVERSAIRE1(box));
            unlockBox( this.ADVERSAIRE2(box));
        }
        */
        return true;
    }

    //Avec report sur le tableau suivant
    lockBox(box: Box): boolean {    //LockBoite
        ASSERT(!!box);

        if (this.iDiagonale(box) === box.position) {
            ///TODO box = this.ADVERSAIRE1(box);
        }

        ASSERT(!!box);
        //ASSERT(box.isJoueur());

        if (box.hidden) {
            return true;
        }

        box.locked = true;

        const prev = previousGroup(this.event, this.draw);
        if (prev) {
            const boxIn = box as PlayerIn;
            if (boxIn.qualifIn) {
                const [d,boxOut] = groupFindPlayerOut(this.event, prev, boxIn.qualifIn);
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

        const prev = previousGroup(this.event, this.draw);
        if (prev) {
            const boxIn = box as PlayerIn;
            if (boxIn.qualifIn) {
                const [d,boxOut] = groupFindPlayerOut(this.event, prev, boxIn.qualifIn);
                if (boxOut) {
                    delete boxOut.locked;
                }
            }
        }

        return true;
    }

    //Rempli une boite proprement
    fillBox(box: Box, source: Box): boolean {   //RempliBoite
        //ASSERT(RempliBoiteOk(box, source));

        const lib = drawLib(this.event, this.draw);

        const boxIn = box as PlayerIn;
        const sourceIn = source as PlayerIn;
        const match = isMatch(box) ? box : undefined;
        const sourceMatch = isMatch(source) ? source : undefined;

        if (boxIn.qualifIn
            && boxIn.qualifIn !== sourceIn.qualifIn) {

            if (!lib.setPlayerIn(box)) {	//Enlève
                throw new Error('error');
            }
        } else {
            //Vide la boite écrasée
            if (!this.removePlayer(box)) {	//enlève le joueur, le score
                throw new Error('error');
            }

            delete boxIn.qualifIn;
            delete boxIn.seeded;
            if (match) {
                delete match.qualifOut;

                if (isSlot(match)) {
                    if (!this.removeSlot(match)) {
                        throw new Error('error');
                    }
                }
            }
        }

        //Rempli avec les nouvelles valeurs
        if (sourceIn.qualifIn) {
            if (!lib.setPlayerIn(box, sourceIn.qualifIn, source.playerId)) {
                throw new Error('error');
            }
        } else {
            if (source.playerId) {
                if (!this.putPlayer(box, source.playerId)) {
                    throw new Error('error');
                }
                if (match && sourceMatch) {
                    match.score = sourceMatch.score;
                }
            }

            if (!this.isTypePoule() && sourceIn.seeded) {
                boxIn.seeded = sourceIn.seeded;
            }

            if (match && sourceMatch) {
                if (sourceMatch.qualifOut) {
                    if (!lib.setPlayerOut(match, sourceMatch.qualifOut)) {
                        throw new Error('error');
                    }
                }

                //if( isCreneau( box))
                //v0998
                const opponents = lib.boxesOpponents(match);
                if (opponents.box1 && opponents.box2
                    && (sourceMatch.place || sourceMatch.date)
                    ) {
                    if (!this.putSlot(match, sourceMatch)) {
                        throw new Error('error');
                    }
                }

                if (!this.putTick(box, source)) {
                    throw new Error('error');
                }
                match.matchFormat = sourceMatch.matchFormat;

                match.note = match.note;
            }
        }

        lib.computeScore();

        return true;
    }

    movePlayer(box: Box, boiteSrc: Box, pBoite: Box): boolean {  //DeplaceJoueur
        //ASSERT(DeplaceJoueurOk(box, iBoiteSrc, pBoite));

        boiteSrc = newBox(this.draw, boiteSrc);

        if (!this.fillBox(boiteSrc, pBoite)) {	//Vide la source
            throw new Error('error');
        }

        if (!this.fillBox(box, boiteSrc)) {	//Rempli la destination
            throw new Error('error');
        }

        return true;
    }

    // boxesOpponents(match: Match): { box1: Box; box2: Box } {
    //     return this._drawLibs[match._draw.type].boxesOpponents(match);
    // }

    isTypePoule(): boolean {
        return this.draw.type === DrawType.PouleSimple || this.draw.type === DrawType.PouleAR;
    }
    
    iDiagonale(box: Box): number {
        const draw = this.draw;
        return this.isTypePoule() ? (box.position % this.draw.nbColumn) * (this.draw.nbColumn + 1) : box.position;
    }
    isGauchePoule(box: Box): boolean {
        return this.isTypePoule() ? (box.position >= (this.draw.nbColumn * this.draw.nbColumn)) : false;
    }
    
    ADVERSAIRE1(box: Box): number {
        if (this.isTypePoule()) {
            const n = this.draw.nbColumn;
            return box.position % n + n * n;
        } else {
            return (box.position << 1) + 2;
        }
    }
    ADVERSAIRE2(box: Box): number {
        if (this.isTypePoule()) {
            const n = this.draw.nbColumn;
            return Math.floor(box.position / n) + n * n;
        } else {
            return (box.position << 1) + 1;
        }
    }
}

function ASSERT(b: boolean, message?: string): void {
    if (!b) {
        debugger;
        throw new Error(message || 'Assertion is false');
    }
}
