import {Find} from '../util/Find';
import {Guid} from '../util/Guid';
import { isObject,isArray,extend } from '../util/object'
import { shuffle } from '../../utils/tool';
import { LibLocator } from '../libLocator';

import { rank } from '../types';

var MAX_TETESERIE = 32,
    MAX_QUALIF = 32,
    QEMPTY = - 1;

export class DrawLib {

    public static newDraw(parent: TEvent, source?: Draw, after?: Draw): Draw {
        var draw: Draw = <any>{};
        if (isObject(source)) {
            extend(draw, source);
        }
        draw.id = draw.id || Guid.create('d');
        delete (<any>draw).$$hashKey;   //TODO remove angular id

        //default values
        draw.type = draw.type || DrawType.Normal;
        draw.nbColumn = draw.nbColumn || 3;
        draw.nbOut = draw.nbOut || 1;
        if (after) {
            draw._previous = after;
            //TODO? after._next = draw;
        }
        if (!draw.minRank) {
            draw.minRank = after && after.maxRank ? rank.next(after.maxRank) : 'NC';
        }
        if (draw.maxRank && rank.compare(draw.minRank, draw.maxRank) > 0) {
            draw.maxRank = draw.minRank;
        }

        draw._event = parent;
        return draw;
    }

    public static initDraw(draw: Draw, parent: TEvent): void {
        draw._event = parent;

        draw.type = draw.type || DrawType.Normal;
        draw.nbColumn = draw.nbColumn || 0;
        draw.nbOut = draw.nbOut || 0;
        draw.mode = draw.mode || Mode.Build;

        //init boxes
        if (!draw.boxes) {
            return;
        }
        for (var i = draw.boxes.length - 1; i >= 0; i--) {
            var box = draw.boxes[i];
            this.initBox(box, draw);
        }
    }

    //public newBox(parent: Draw, matchFormat?: string, position?: number): Box
    //public newBox(parent: Draw, source?: Box, position?: number): Box
    public static newBox(parent: Draw, source?: string|Box, position?: number): Box {
        var box: Box = <any>{};
        if (isObject(source)) {
            extend(box, source);
            //box.id = undefined;
            //box.position= undefined;
        } else if ('string' === typeof source) {    //matchFormat
            var match: Match = <Match>box;
            match.score = undefined;
            match.matchFormat = source;
        }
        if ('number' === typeof position) {
            box.position = position;
        }
        this.initBox(box, parent);
        return box;
    }

    public static initBox(box: Box, parent: Draw): void {
        box._draw = parent;
        box._player = this.getPlayer(box);
    }

    //         public abstract nbColumnForPlayers(draw: Draw, nJoueur: number): number {
    //             return this._drawLibs[draw.type].nbColumnForPlayers(draw, nJoueur);
    //         }
    //         public getSize(draw: Draw): ISize {
    //             return this._drawLibs[draw.type].getSize(draw);
    //         }
    //         public computePositions(draw: Draw): IPoint[] {
    //             return this._drawLibs[draw.type].computePositions(draw);
    //         }
    //         public resize(draw: Draw, oldDraw?: Draw, nJoueur?: number): void {
    //             this._drawLibs[draw.type].resize(draw, oldDraw, nJoueur);
    //         }
    // 
    //         public generateDraw(draw: Draw, generate: GenerateType, afterIndex: number): Draw[] {
    //             return this._drawLibs[draw.type].generateDraw(draw, generate, afterIndex);
    //         }

    public static refresh(draw: Draw): void {
        draw._refresh = new Date(); //force refresh
    }

    public static updateQualif(draw: Draw): void {

        var drawLib = LibLocator.drawLibFor(draw);

        //retreive qualifIn box
        var qualifs: PlayerIn[] = [];
        for (var i = draw.boxes.length - 1; i >= 0; i--) {
            var boxIn = <PlayerIn>draw.boxes[i];
            if (boxIn.qualifIn) {
                qualifs.push(boxIn);
            }
        }

        shuffle(qualifs);

        //remove old qualif numbers
        for (i = qualifs.length - 1; i >= 0; i--) {
            drawLib.setPlayerIn(qualifs[i], 0);
        }

        //assign new qualif number
        for (i = qualifs.length - 1; i >= 0; i--) {
            drawLib.setPlayerIn(qualifs[i], i + 1);
        }
    }

    public static getPlayer(box: Box): Player {
        return Find.byId(box._draw._event._tournament.players, box.playerId);
    }

    private static groupBegin(draw: Draw): Draw {   //getDebut
        //return the first Draw of the suite
        var p = draw;
        while (p && p.suite) {
            if (!p._previous)
                break;
            p = p._previous;
        }
        return p;
    }

    private static groupEnd(draw: Draw): Draw { //getFin
        //return the last Draw of the suite
        var p = this.groupBegin(draw);
        while (p && p._next && p._next.suite)
            p = p._next;
        return p;
    }

    //** return the group of draw of the given draw (mainly for group of round robin). */
    public static group(draw: Draw): Draw[] {
        var draws: Draw[] = [];
        var d = this.groupBegin(draw);
        while (d) {
            draws.push(d);
            d = d._next;
            if (d && !d.suite) {
                break;
            }
        }
        return draws;
    }

    //** return the draws of the previous group. */
    public static previousGroup(draw: Draw): Draw[] {	//getPrecedent
        var p = this.groupBegin(draw);
        return p && p._previous ? this.group(p._previous) : null;
    }

    //** return the draws of the next group. */
    public static nextGroup(draw: Draw): Draw[] {	    //getSuivant
        var p = this.groupEnd(draw);
        return p && p._next ? this.group(p._next) : null;
    }

    //public setType(BYTE iType) {
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

    public static isSlot(box: Match): boolean {  //isCreneau
        return box && ('score' in box) && (!!box.place || !!box.date);
    }

    public static findSeeded(origin: Draw | Draw[], iTeteSerie: number): PlayerIn {    //FindTeteSerie
        ASSERT(1 <= iTeteSerie && iTeteSerie <= MAX_TETESERIE);
        var group = isArray(origin) ? <Draw[]>origin : this.group(<Draw>origin);
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

    public static groupFindPlayerIn(group: Draw[], iQualifie: number): PlayerIn {
        ASSERT(1 <= iQualifie && iQualifie <= MAX_QUALIF);
        //var group = isArray(group) ? <Draw[]>group : this.group(<Draw>group);
        for (var i = 0; i < group.length; i++) {
            var d = group[i];
            var drawLib = LibLocator.drawLibFor(d);
            var playerIn = drawLib.findPlayerIn(d, iQualifie);
            if (playerIn) {
                return playerIn;
            }
        }
    }

    public static groupFindPlayerOut(group: Draw[], iQualifie: number): Match {
        ASSERT(1 <= iQualifie && iQualifie <= MAX_QUALIF);
        //var group = isArray(origin) ? <Draw[]>origin : this.group(<Draw>origin);
        for (var i = 0; i < group.length; i++) {
            var d = group[i];
            var drawLib = LibLocator.drawLibFor(d);
            var boxOut = drawLib.findPlayerOut(d, iQualifie);
            if (boxOut) {
                return boxOut;
            }
        }

        //Si iQualifie pas trouvé, ok si < somme des nSortant du groupe
        var outCount = 0;
        for (var i = 0; i < group.length; i++) {
            var d = group[i];
            if (d.type >= 2) {
                outCount += d.nbOut;
            }
        }
        if (iQualifie <= outCount) {
            return <any> -2;    //TODO
        }
        return null;
    }

    public static groupFindAllPlayerOut(origin: Draw | Draw[], hideNumbers?: boolean): number[] {   //FindAllQualifieSortant
        //Récupère les qualifiés sortants du tableau
        var group = isArray(origin) ? <Draw[]>origin : this.group(<Draw>origin);
        if (group) {
            var a: number[] = [];
            for (var i = 1; i <= MAX_QUALIF; i++) {
                if (this.groupFindPlayerOut(group, i)) {
                    a.push(hideNumbers ? QEMPTY : i);
                }
            }
            return a;
        }
    }

    public static findAllPlayerOutBox(origin: Draw | Draw[]): Match[] { //FindAllQualifieSortantBox
        //Récupère les qualifiés sortants du tableau
        var group = isArray(origin) ? <Draw[]>origin : this.group(<Draw>origin);
        if (group) {
            var a: Match[] = [], m: Match;
            for (var i = 1; i <= MAX_QUALIF; i++) {
                if (m = this.groupFindPlayerOut(group, i)) {
                    a.push(m);
                }
            }
            return a;
        }
    }

    /**
         * Fill or erase a box with qualified in and/or player
        * setPlayerIn
        * 
        * @param box 
        * @param inNumber (optional)
        * @param player   (optional)
        */
    //         public static setPlayerIn(box: PlayerIn, inNumber?: number, player?: Player): boolean {
    //             // inNumber=0 => enlève qualifié
    //             return this._drawLibs[box._draw.type].setPlayerIn(box, inNumber, player);
    //         }
    // 
    //         public static setPlayerOut(box: Match, outNumber?: number): boolean { //setPlayerOut
    //             // iQualifie=0 => enlève qualifié
    //             return this._drawLibs[box._draw.type].setPlayerOut(box, outNumber);
    //         }
    // 
    //         public static computeScore(draw: Draw): boolean {
    //             return this._drawLibs[draw.type].computeScore(draw);
    //         }

    // public static boxesOpponents(match: Match): { box1: Box; box2: Box } {
    //     return this._drawLibs[match._draw.type].boxesOpponents(match);
    // }
}

function ASSERT(b: boolean, message?: string): void {
    if (!b) {
        debugger;
        throw message || 'Assertion is false';
    }
}