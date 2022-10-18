import {autoinject,bindable} from 'aurelia-framework';
import {DialogService,DialogResult} from 'aurelia-dialog';

import {DialogDraw} from '../views/draw/dialog-draw';
import {DialogMatch} from '../views/draw/dialog-match';

import { Selection,ModelType } from './selection';
import { Find } from './util/find';
import { Guid } from './util/guid';
import { Undo } from './util/undo';
import { isObject,isArray,extend } from './util/object'
import { shuffle } from '../utils/tool';
import { rank } from './types';

import { LibLocator } from './libLocator';
import { Validation } from './validation';

const MAX_TETESERIE = 32,
    MAX_QUALIF = 32,
    QEMPTY = - 1;

@autoinject
export class DrawEditor {

    modeBuild = Mode.Build;
    modePlan = Mode.Plan;
    modePlay = Mode.Play;
    modeLock = Mode.Lock;

    constructor(
        private dialogService: DialogService,
        private validation: Validation,
        public selection:Selection, 
        private undo:Undo
        ) {
		  }

    static newDraw(parent: TEvent, source?: Draw, after?: Draw): Draw {
        var draw: Draw = <any>{};
        if (isObject(source)) {
            extend(draw, source);
        }
        draw.id = draw.id || Guid.create('d');

        //default values
        draw.type = draw.type || DrawType.Normal;
        draw.nbColumn = draw.nbColumn || 3;
        draw.nbOut = draw.nbOut || 1;
        if (after) {
            draw._previous = after;
            //TODO? after._next = draw;
        }
        if (!draw.minRank && after && after.maxRank) {
            draw.minRank = rank.next(after.maxRank);
        }
        if (draw.maxRank && draw.minRank && rank.compare(draw.minRank, draw.maxRank) > 0) {
            draw.maxRank = draw.minRank;
        }

        draw._event = parent;
        return draw;
    }

    static init(draw: Draw, parent: TEvent): void {
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

    //newBox(parent: Draw, matchFormat?: string, position?: number): Box
    //newBox(parent: Draw, source?: Box, position?: number): Box
    static newBox(parent: Draw, source?: string|Box, position?: number): Box {
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

    static initBox(box: Box, parent: Draw): void {
        box._draw = parent;
        box._player = this.getPlayer(box);
    }

    add(after?: Draw): void {

        var newDraw = DrawEditor.newDraw(this.selection.event, undefined, after);

        this.dialogService.open({
            viewModel: DialogDraw, 
            model: {
                title: "New draw",
                draw: newDraw
            }
        }).then((result: DialogResult) => {
            //TODO add event after selected draw
            if ('Ok' === result.output) {
                this._addDraw(newDraw, GenerateType.None, after);
            } else if ('Generate' === result.output) {
                this._addDraw(newDraw, GenerateType.Create, after);
            }
        });
    }

    edit(draw: Draw): void {
        if(!draw) {
            return;
        }
        var editedDraw = DrawEditor.newDraw(draw._event, draw);

        this.dialogService.open({
            viewModel: DialogDraw, 
            model: {
                title: "Edit draw",
                draw: editedDraw
            }
        }).then((result: DialogResult) => {
            if ('Ok' === result.output) {
                this._updateDraw(editedDraw, draw);
            } else if ('Generate' === result.output) {
                this._updateDraw(editedDraw, draw, GenerateType.Create);
            } else if ('Del' === result.output) {
                this.remove(draw);
            }
        });
    }

    validate(draw: Draw): void {
        this._validateDraw(draw);
    }

    generate(draw: Draw, generate?: GenerateType): void {
        this._updateDraw(draw, undefined, generate || GenerateType.Create);
    }
 
    //#region match
    static isMatch(box: Box): boolean {
        return box && 'undefined' !== typeof (<Match>box).score;
    }

    editMatch(match: Match): void {

        var editedMatch = <Match> DrawEditor.newBox(match._draw, match);

        this.dialogService.open({
            viewModel: DialogMatch, 
            model: {
                title: "Edit match",
                match: editedMatch
            }
        }).then((result: DialogResult) => {
            if ('Ok' === result.output) {
                this._editMatch(editedMatch, match);
            }
        });
    }
    //#endregion match

    /*private*/ _addDraw(draw: Draw, generate?: GenerateType, afterDraw?: Draw): void {

        var c = draw._event.draws;
        var afterIndex = afterDraw ? Find.indexOf(c, 'id', afterDraw.id) : c.length - 1;

        if (generate) {
            var lib = LibLocator.drawLibFor(draw);
            var draws = lib.generateDraw(draw, generate, afterIndex);
            if (!draws || !draws.length) {
                return;
            }
            this.undo.splice(c, afterIndex + 1, 0, draws, "Add " + draw.name, ModelType.Draw); //c.splice( i, 1, draws);

            for (var i = 0; i < draws.length; i++) {
                var lib = LibLocator.drawLibFor(draws[i]);
                DrawEditor.init(draws[i], draw._event);
            }
            this.selection.select(draws[0], ModelType.Draw);

        } else {
            draw.id = Guid.create('d');
            this.undo.insert(c, afterIndex + 1, draw, "Add " + draw.name, ModelType.Draw); //c.push( draw);
            this.selection.select(draw, ModelType.Draw);
        }
    }

    /*private*/ _updateDraw(draw: Draw, oldDraw?: Draw, generate?: GenerateType): void {
        var isSelected = this.selection.draw === oldDraw;
        var lib = LibLocator.drawLibFor(draw);
        var group = DrawEditor.group(oldDraw || draw);
        if (generate) {
            var draws = lib.generateDraw(draw, generate, -1);
            if (!draws || !draws.length) {
                return;
            }
        } else {
            lib.resize(draw, oldDraw);
        }
        var c = draw._event.draws;
        if (generate && draws && group && draws.length) {
            var i = Find.indexOf(c, "id", group[0].id, "Draw to edit not found");
            this.undo.splice(c, i, group.length, draws, "Generate " + /*GenerateType[generate]*/ generate + ' ' + draw.name, ModelType.Draw);

            for (var i = 0; i < draws.length; i++) {
                DrawEditor.init(draws[i], draw._event);
            }
            draw = draws[0];
        } else {    //edit draw
            var cDraw = Find.byId( c, draw.id);
            this.undo.updateProperties(cDraw, draw, "Edit " + draw.name, ModelType.Draw); //cDraw.* = draw.*;
        }
        if (isSelected || generate) {
            this.selection.select(draw, ModelType.Draw);
        }
    }

    updateQualif(draw: Draw): void {
        this.undo.newGroup('Update qualified', () => {
            DrawEditor._updateQualif(draw);
            return true;
        }, draw);
    }

    remove(draw: Draw): void {
        var c = draw._event.draws;
        var i = Find.indexOf(c, "id", draw.id, "Draw to remove not found");
        this.undo.remove(c, i, "Delete " + draw.name + " " + i, ModelType.Draw); //c.splice( i, 1);
        if (this.selection.draw === draw) {
            this.selection.select(c[i] || c[i - 1], ModelType.Draw);   //select next or previous
        }
    }

    private _validateDraw(draw: Draw): void {
        this.validation.resetDraw(draw);
        this.validation.validateDraw(draw);
        if (this.selection.draw === draw) {

        }
    }
    //#endregion draw

    //#region match
    private _editMatch(editedMatch: Match, match: Match): void {
        DrawEditor.initBox(editedMatch, editedMatch._draw);
        this.undo.newGroup("Edit match", () => {
            this.undo.updateProperties(match, editedMatch, "Edit " + editedMatch.position, ModelType.Match); //match.* = editedMatch.*;
            if (editedMatch.qualifOut) {
                //report qualified player to next draw
                var nextGroup = DrawEditor.nextGroup(editedMatch._draw);
                if (nextGroup) {
                    var boxIn = DrawEditor.groupFindPlayerIn(nextGroup, editedMatch.qualifOut);
                    if (boxIn) {
                        this.undo.updateProperties(boxIn, {playerId: editedMatch.playerId, _player:editedMatch._player}, 'Set player');  //boxIn.playerId = editedMatch.playerId;
                    }
                }
            }
            return true;
        });
    }
    //private _erasePlayer(box: Box): void {
    //    // this.undo.updateProperties(box, {playerId:undefined, _player:undefined}, "Erase player");  //box.playerId = undefined; box._player = undefined;
    //    var prev = box.playerId;
    //    this.undo.action((bUndo: boolean) => {
    //        box.playerId = bUndo ? prev : undefined;
    //        DrawEditor.initBox(box, box._draw)
    //        this.selection.select(box, ModelType.Box);
    //    }, "Erase player");
    //}

    eraseResult(match: Match): void {
        this.undo.updateProperties(match, {score: '', wo:undefined, canceled:undefined, vainqDef:undefined}, "Erase result");  //match.score = '';
    }

    erasePlanning(match: Match): void {
        this.undo.updateProperties(match, {place:undefined, date:undefined}, "Erase planning");  //match.place = undefined; match.date = undefined;
    }
    //#endregion match
    
    static _updateQualif(draw: Draw): void {

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

    static getPlayer(box: Box): Player {
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
    static group(draw: Draw): Draw[] {
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
    static previousGroup(draw: Draw): Draw[] {	//getPrecedent
        var p = this.groupBegin(draw);
        return p && p._previous ? this.group(p._previous) : null;
    }

    //** return the draws of the next group. */
    static nextGroup(draw: Draw): Draw[] {	    //getSuivant
        var p = this.groupEnd(draw);
        return p && p._next ? this.group(p._next) : null;
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

    static isSlot(box: Match): boolean {  //isCreneau
        return this.isMatch(box) && (!!box.place || !!box.date);
    }

    static findSeeded(origin: Draw | Draw[], iTeteSerie: number): PlayerIn {    //FindTeteSerie
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

    static groupFindPlayerIn(group: Draw[], iQualifie: number): PlayerIn {
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

    static groupFindPlayerOut(group: Draw[], iQualifie: number): Match {
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

    static groupFindAllPlayerOut(origin: Draw | Draw[], hideNumbers?: boolean): number[] {   //FindAllQualifieSortant
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

    static findAllPlayerOutBox(origin: Draw | Draw[]): Match[] { //FindAllQualifieSortantBox
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
    // static setPlayerIn(box: PlayerIn, inNumber?: number, player?: Player): boolean {
    //     // inNumber=0 => enlève qualifié
    //     return this._drawLibs[box._draw.type].setPlayerIn(box, inNumber, player);
    // }

    // static setPlayerOut(box: Match, outNumber?: number): boolean { //setPlayerOut
    //     // iQualifie=0 => enlève qualifié
    //     return this._drawLibs[box._draw.type].setPlayerOut(box, outNumber);
    // }

    // static computeScore(draw: Draw): boolean {
    //     return this._drawLibs[draw.type].computeScore(draw);
    // }

    // static boxesOpponents(match: Match): { box1: Box; box2: Box } {
    //     return this._drawLibs[match._draw.type].boxesOpponents(match);
    // }
}

function ASSERT(b: boolean, message?: string): void {
    if (!b) {
        debugger;
        throw message || 'Assertion is false';
    }
}