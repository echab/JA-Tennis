import {autoinject,bindable} from 'aurelia-framework';
import {DialogService,DialogResult} from 'aurelia-dialog';

import {DialogEvent} from '../views/event/dialog-event';

import { Selection,ModelType } from './selection';
import { Undo } from './util/undo';

import { MainLib } from './mainLib';
import { TournamentLib } from './tournamentLib';

@autoinject
export class EventEditor {

    constructor(
        private mainLib: MainLib, 
        private dialogService: DialogService,
        public selection:Selection, 
        private undo:Undo
        ) {}

    add(after?: TEvent): void { //TODO afterEvent

        var newEvent = TournamentLib.newEvent(this.selection.tournament);

        this.dialogService.open({
            viewModel: DialogEvent, 
            model: {
                title: "New event",
                event: newEvent
            }
        }).then((result: DialogResult) => {
            if ('Ok' === result.output) {
                this.mainLib.addEvent(this.selection.tournament, newEvent, after); //TODO add event after selected event
            }
        });
    }

    edit(event: TEvent): void {

        var editedEvent = TournamentLib.newEvent(this.selection.tournament, event);

        this.dialogService.open({
            viewModel: DialogEvent, 
            model: {
                title: "Edit event",
                event: editedEvent
            }
        }).then((result: DialogResult) => {
            if ('Ok' === result.output) {
                this.mainLib.editEvent(editedEvent, event);
            } else if ('Del' === result.output) {
                this.mainLib.removeEvent(event)
            }
        });
    }

    remove(event: TEvent): void {
        this.mainLib.removeEvent(event);
    }
}