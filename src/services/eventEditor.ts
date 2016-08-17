import {autoinject,bindable} from 'aurelia-framework';
import {DialogService,DialogResult} from 'aurelia-dialog';

import {DialogEvent} from '../views/event/dialog-event';

import { Selection,ModelType } from './selection';
import { Find } from './util/find';
import { Guid } from './util/guid';
import { Undo } from './util/undo';

import { DrawEditor } from './drawEditor';
import { isObject,extend } from './util/object'

@autoinject
export class EventEditor {

    constructor(
        private dialogService: DialogService,
        public selection:Selection, 
        private undo:Undo
        ) {}

    public static newEvent(parent: Tournament, source?: TEvent): TEvent {
        var event: TEvent = <any>{};
        if (isObject(source)) {
            extend(event, source);
        }
        event.id = event.id || Guid.create('e');

        this.init(event, parent);
        return event;
    }

    public static init(event: TEvent, parent: Tournament): void {
        event._tournament = parent;

        var c = event.draws = event.draws || [];
        if (c) {
            for (var i = c.length - 1; i >= 0; i--) {
                var draw = c[i];
                DrawEditor.init(draw, event);

                //init draws linked list
                draw._previous = c[i - 1];
                draw._next = c[i + 1];
            }
        }
    }

    add(after?: TEvent): void { //TODO afterEvent

        var newEvent = EventEditor.newEvent(this.selection.tournament);

        this.dialogService.open({
            viewModel: DialogEvent, 
            model: {
                title: "New event",
                event: newEvent
            }
        }).then((result: DialogResult) => {
            if ('Ok' === result.output) {
                this._addEvent(this.selection.tournament, newEvent, after); //TODO add event after selected event
            }
        });
    }

    edit(event: TEvent): void {

        var editedEvent = EventEditor.newEvent(this.selection.tournament, event);

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
        var index = afterEvent ? Find.indexOf(c, 'id', afterEvent.id) + 1 : c.length;

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
        var i = Find.indexOf(c, "id", event.id, "TEvent to remove not found");
        this.undo.remove(c, i, "Delete " + c[i].name + " " + i, ModelType.TEvent); //c.splice( i, 1);
        if (this.selection.event === event) {
            this.selection.select(c[i] || c[i - 1], ModelType.TEvent);
        }
    }
}