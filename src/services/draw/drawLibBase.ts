import { nextGroup, groupDraw, groupFindPlayerIn, groupFindPlayerOut, newBox, previousGroup } from '../drawService';
import { isArray } from '../util/object';
import { Draw, Box, DrawType, Match } from '../../domain/draw';
import { Player, PlayerIn } from '../../domain/player';
import { drawLib, GenerateType } from './drawLib';
import { TEvent } from '../../domain/tournament';

const MAX_TETESERIE = 32,
    MAX_QUALIF = 32,
    QEMPTY = - 1;

export abstract class DrawLibBase {

    constructor(public event: TEvent, public draw: Draw) {}

    abstract nbColumnForPlayers( nJoueur: number): number;
    abstract resize( oldDraw?: Draw, nJoueur?: number): void;
    abstract generateDraw( generate: GenerateType, registeredPlayersOrQ: (Player|number)[]): Draw[];

    resetDraw( nPlayer: number): void {
        //remove qualif out
        const next = nextGroup(this.event, this.draw);
        if (next && this.draw.boxes) {
            for (let i = 0; i < next.length; i++) {
                const boxes = next[i].boxes;
                if (boxes) {
                    const drawLibNext = drawLib(this.event, next[i]);
                    for (let b = 0; b < boxes.length; b++) {
                        const box = <Match> boxes[b];
                        if (box && box.qualifOut) {
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

    isSlot(box: Match): boolean {  //isCreneau
        return isMatch(box) && (!!box.place || !!box.date);
    }

    /** @deprecated duplicated into drawService */
    findSeeded(origin: Draw | Draw[], iTeteSerie: number): PlayerIn | undefined {    //FindTeteSerie
        ASSERT(1 <= iTeteSerie && iTeteSerie <= MAX_TETESERIE);
        const group = isArray(origin) ? origin : groupDraw(this.event, origin);
        for (let i = 0; i < group.length; i++) {
            const boxes = group[i].boxes;
            for (let j = 0; j < boxes.length; j++) {
                const boxIn: PlayerIn = boxes[j];
                if (boxIn.seeded === iTeteSerie) {
                    return boxIn;
                }
            }
        }
        return undefined;
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
//         computeScore(): boolean {
//             return this._drawLibs[this.draw.type].computeScore(this.draw);
//         }

    //Programme un joueur, gagnant d'un match ou (avec bForce) report d'un qualifié entrant
    putPlayer(box: Box, playerId: string, bForce?: boolean): boolean {   //MetJoueur

        //ASSERT(MetJoueurOk(box, iJoueur, bForce));

        if (box.playerId !== playerId && box.playerId) {
            if (!this.removePlayer(box)) {		//Enlève le joueur précédent
                throw new Error('error');
            }
        }

        const boxIn = box as PlayerIn;
        const match = isMatch(box) ? box as Match : undefined;
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

        const boxOut = box as Match;
        if (boxOut.qualifOut) {
            const next = nextGroup(this.event, this.draw);
            if (next) {
                const [d,boxIn] = groupFindPlayerIn(this.event, next, boxOut.qualifOut);
                if (boxIn && d) {
                    const lib = drawLib(this.event, d);
                    if (!boxIn.playerId
                        && !lib.putPlayer(boxIn, playerId, true)) {
                        throw new Error('error');
                    }
                }
            }
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

    //Résultat d'un match : met le gagnant (ou le requalifié) et le score dans la boite
    putResult(box: Match, boite: Match): boolean {   //SetResultat
        //ASSERT(SetResultatOk(box, boite));

        //v0998
        //	//Check changement de vainqueur par vainqueur défaillant
        //	if( !this.isTypePoule())
        //	if( boite.score.isVainqDef()) {
        //		if( boite.m_iJoueur == boxes[ this.ADVERSAIRE1(box)]->m_iJoueur)
        //			boite.m_iJoueur = boxes[ this.ADVERSAIRE2(box)]->m_iJoueur;
        //		else
        //			boite.m_iJoueur = boxes[ this.ADVERSAIRE1(box)]->m_iJoueur;
        //	}

        if (boite.playerId) {
            if (!this.putPlayer(box, boite.playerId)) {
                throw new Error('error');
            }
        } else if (!this.removePlayer(box)) {
            throw new Error('error');
        }

        box.score = boite.score;

        drawLib(this.event, this.draw).computeScore();

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

        const match = box as Match;
        if (!match.playerId && !match.score) {
            return true;
        }

        //ASSERT(EnleveJoueurOk(box, bForce));

        const next = nextGroup(this.event, this.draw);
        const boxOut = box as Match;
        if (boxOut.qualifOut && next) {
            const [d,boxIn] = groupFindPlayerIn(this.event, next, boxOut.qualifOut);
            if (boxIn && d) {
                const lib = drawLib(this.event, d);
                if (!lib.removePlayer(boxIn, true)) {
                    throw new Error('error');
                }
            }
        }

        box.playerId = undefined;
        if (isMatch(box)) {
            match.score = '';
        }

        const boxIn = box as PlayerIn;
        //delete boxIn.order;
        /*
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
        //ASSERT(RempliBoiteOk(box, boite));

        const lib = drawLib(this.event, this.draw);

        const boxIn = box as PlayerIn;
        const sourceIn = source as PlayerIn;
        const match = isMatch(box) ? box as Match : undefined;
        const sourceMatch = isMatch(source) ? source as Match : undefined;

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

                if (this.isSlot(match)) {
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

/** A match, with a score field */
function isMatch(box: Box): boolean {
    return box && ('undefined' !== typeof (box as Match).score);
}

function ASSERT(b: boolean, message?: string): void {
    if (!b) {
        debugger;
        throw message || 'Assertion is false';
    }
}
