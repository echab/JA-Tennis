import {autoinject,bindable} from 'aurelia-framework';
import {DialogService,DialogResult} from 'aurelia-dialog';

import {DialogEvent} from './event/dialog-event';

import { Selection,ModelType } from './selection';
import { indexOf } from './util/find';
import { Guid } from './util/guid';
import { Undo } from './util/undo';

import { newEvent } from '../services/eventService';
import { TEvent, Tournament } from '../domain/tournament';

@autoinject
export class EventEditor {

    constructor(
        private dialogService: DialogService,
        public selection:Selection, 
        private undo:Undo
        ) {}

    add(after?: TEvent): void { //TODO afterEvent

        var event = newEvent(this.selection.tournament);

        this.dialogService.open({
            viewModel: DialogEvent, 
            model: {
                title: "New event",
                event
            }
        }).then((result: DialogResult) => {
            if ('Ok' === result.output) {
                this._addEvent(this.selection.tournament, event, after); //TODO add event after selected event
            }
        });
    }

    edit(event: TEvent): void {

        var editedEvent = newEvent(this.selection.tournament, event);

        this.dialogService.open({
            viewModel: DialogEvent, 
            model: {
                title: "Edit event",
                event: editedEvent
            }
        }).then((result: DialogResult) => {
            if ('Ok' === result.output) {
                this._editEvent(editedEvent, event);
            } else if ('Del' === result.output) {
                this.remove(event)
            }
        });
    }

    // =====

    private _addEvent(tournament: Tournament, event: TEvent, afterEvent?: TEvent): void {
        var c = tournament.events;
        var index = afterEvent ? indexOf(c, 'id', afterEvent.id) + 1 : c.length;

        event.id = Guid.create('e');
        this.undo.insert(c, index, event, "Add " + event.name, ModelType.TEvent);   //c.push( newEvent);
        this.selection.select(event, ModelType.TEvent);
    }

    private _editEvent(editedEvent: TEvent, event: TEvent): void {
        var isSelected = this.selection.event === event;
        this.undo.updateProperties(event, editedEvent, "Edit " + editedEvent.name, ModelType.TEvent);   //event.* = editedEvent.*;
        if (isSelected) {
            this.selection.select(editedEvent, ModelType.TEvent);
        }
    }

    remove(event: TEvent): void {
        var c = event._tournament.events;
        var i = indexOf(c, "id", event.id, "TEvent to remove not found");
        this.undo.remove(c, i, "Delete " + c[i].name + " " + i, ModelType.TEvent); //c.splice( i, 1);
        if (this.selection.event === event) {
            this.selection.select(c[i] || c[i - 1], ModelType.TEvent);
        }
    }
}