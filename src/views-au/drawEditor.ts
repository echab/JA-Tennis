import {autoinject,bindable} from 'aurelia-framework';
import {DialogService,DialogResult} from 'aurelia-dialog';

import {DialogDraw} from './draw/dialog-draw';
import {DialogMatch} from './draw/dialog-match';

import { Selection,ModelType } from './selection';
import { indexOf, by, byId } from './util/find';
import { Guid } from './util/guid';
import { Undo } from './util/undo';

import { LibLocator } from './libLocator';
import { Validation } from './validation';
import { groupDraw, groupFindPlayerIn, initBox, initDraw, newBox, newDraw, nextGroup, _updateQualif } from '../services/drawService';
import { Mode, Draw, Match } from '../domain/draw';
import { GenerateType } from '../domain/drawLib';

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

    add(after?: Draw): void {

        var draw = newDraw(this.selection.event, undefined, after);

        this.dialogService.open({
            viewModel: DialogDraw, 
            model: {
                title: "New draw",
                draw: draw
            }
        }).then((result: DialogResult) => {
            //TODO add event after selected draw
            if ('Ok' === result.output) {
                this._addDraw(draw, GenerateType.None, after);
            } else if ('Generate' === result.output) {
                this._addDraw(draw, GenerateType.Create, after);
            }
        });
    }

    edit(draw: Draw): void {
        if(!draw) {
            return;
        }
        var editedDraw = newDraw(draw._event, draw);

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

    editMatch(match: Match): void {

        var editedMatch = <Match> newBox(match._draw, match);

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
        var afterIndex = afterDraw ? indexOf(c, 'id', afterDraw.id) : c.length - 1;

        if (generate) {
            var lib = LibLocator.drawLibFor(draw);
            var draws = lib.generateDraw(draw, generate, afterIndex);
            if (!draws || !draws.length) {
                return;
            }
            this.undo.splice(c, afterIndex + 1, 0, draws, "Add " + draw.name, ModelType.Draw); //c.splice( i, 1, draws);

            for (var i = 0; i < draws.length; i++) {
                var lib = LibLocator.drawLibFor(draws[i]);
                initDraw(draws[i], draw._event);
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
        var group = groupDraw(oldDraw || draw);
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
            var i = indexOf(c, "id", group[0].id, "Draw to edit not found");
            this.undo.splice(c, i, group.length, draws, "Generate " + /*GenerateType[generate]*/ generate + ' ' + draw.name, ModelType.Draw);

            for (var i = 0; i < draws.length; i++) {
                initDraw(draws[i], draw._event);
            }
            draw = draws[0];
        } else {    //edit draw
            var cDraw = byId( c, draw.id);
            this.undo.updateProperties(cDraw, draw, "Edit " + draw.name, ModelType.Draw); //cDraw.* = draw.*;
        }
        if (isSelected || generate) {
            this.selection.select(draw, ModelType.Draw);
        }
    }

    updateQualif(draw: Draw): void {
        this.undo.newGroup('Update qualified', () => {
            _updateQualif(draw);
            return true;
        }, draw);
    }

    remove(draw: Draw): void {
        var c = draw._event.draws;
        var i = indexOf(c, "id", draw.id, "Draw to remove not found");
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
        initBox(editedMatch, editedMatch._draw);
        this.undo.newGroup("Edit match", () => {
            this.undo.updateProperties(match, editedMatch, "Edit " + editedMatch.position, ModelType.Match); //match.* = editedMatch.*;
            if (editedMatch.qualifOut) {
                //report qualified player to next draw
                var nextGrp = nextGroup(editedMatch._draw);
                if (nextGrp) {
                    var [d,boxIn] = groupFindPlayerIn(nextGrp, editedMatch.qualifOut);
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
    //        initBox(box, box._draw)
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
}
