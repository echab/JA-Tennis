import {autoinject,bindable} from 'aurelia-framework';
import {DialogService,DialogResult} from 'aurelia-dialog';

import {DialogInfo} from '../views/tournament/dialog-info';
import {DialogPlayer} from '../views/player/dialog-player';
import {DialogEvent} from '../views/event/dialog-event';
import {DialogDraw} from '../views/draw/dialog-draw';
import {DialogMatch} from '../views/draw/dialog-match';

import { Selection,ModelType } from './selection';
import { Undo } from './util/undo';

import { MainLib } from './mainLib';
import { DrawLib } from './draw/drawLib';
import { Validation } from './validation';

@autoinject
export class DrawEditor {

    constructor(
        private mainLib: MainLib, 
        private dialogService: DialogService,
        public selection:Selection, 
        private undo:Undo
        ) {
		  }

    add(after?: Draw): void {

        var newDraw = DrawLib.newDraw(this.selection.event, undefined, after);

        this.dialogService.open({
            viewModel: DialogDraw, 
            model: {
                title: "New draw",
                draw: newDraw
            }
        }).then((result: DialogResult) => {
            //TODO add event after selected draw
            if ('Ok' === result.output) {
                this.mainLib.addDraw(newDraw, 0, after);
            } else if ('Generate' === result.output) {
                this.mainLib.addDraw(newDraw, 1, after);
            }
        });
    }

    edit(draw: Draw): void {
        if(!draw) {
            return;
        }
        var editedDraw = DrawLib.newDraw(draw._event, draw);

        this.dialogService.open({
            viewModel: DialogDraw, 
            model: {
                title: "Edit draw",
                draw: editedDraw
            }
        }).then((result: DialogResult) => {
            if ('Ok' === result.output) {
                this.mainLib.updateDraw(editedDraw, draw);
            } else if ('Generate' === result.output) {
                this.mainLib.updateDraw(editedDraw, draw, GenerateType.Create);
            } else if ('Del' === result.output) {
                this.mainLib.removeDraw(draw);
            }
        });
    }

    validate(draw: Draw): void {
        this.mainLib.validateDraw(draw);
    }

    generate(draw: Draw, generate?: GenerateType): void {
        this.mainLib.updateDraw(draw, undefined, generate || GenerateType.Create);
    }

    updateQualif(draw: Draw): void {
        this.mainLib.updateQualif(draw);
    }

    remove(draw: Draw): void {
        this.mainLib.removeDraw(draw);
    }

    //#region match
    isMatch(box: Box): boolean {
        return box && 'score' in box;
    }
    editMatch(match: Match): void {

        var editedMatch = <Match> DrawLib.newBox(match._draw, match);

        this.dialogService.open({
            viewModel: DialogMatch, 
            model: {
                title: "Edit match",
                match: editedMatch
            }
        }).then((result: DialogResult) => {
            if ('Ok' === result.output) {
                this.mainLib.editMatch(editedMatch, match);
            }
        });
    }
    //#endregion match
}