import { indexOf } from "./util/find";
import { Guid } from "./util/guid";
import { initDraw } from "./drawService";
import { extend, isObject } from "./util/object";
import { Tournament, TEvent } from "../domain/tournament";
import { OptionalId } from "../domain/object";
import { Command } from "./util/commandManager";
import { selection, update } from "../components/util/selection";

/** Add a new event or update an existing event (with id) */
export function updateEvent(
  event: OptionalId<TEvent>,
): Command {
  const e = event as TEvent;
  const id = event.id;
  if (!id) {
    event.id = Guid.create("e");
  }
  const i = id ? indexOf(selection.tournament.events, "id", id) : -1;
  // const prev = id ? { ...selection.tournament.events[i] } : undefined; // clone
  const prev = id ? selection.tournament.events[i] : undefined;

  const act = () => {
    update(({ tournament }) => {
      if (!id) {
        tournament.events.push(e);
      } else {
        tournament.events[i] = e;
      }
    });
  };
  act();

  const undo = () => {
    update(({ tournament }) => {
      if (prev) {
        tournament.events[i] = prev;
      } else {
        tournament.events.pop();
      }
    });
  };

  return { name: `Add event ${event.name}`, act, undo };
}

export function newEvent(parent: Tournament, source?: TEvent): TEvent {
  const event: TEvent = <any> {};
  if (isObject(source)) {
    extend(event, source);
  }
  event.id = event.id || Guid.create("e");

  initEvent(event, parent);
  return event;
}

export function initEvent(event: TEvent, parent: Tournament): void {
  // event._tournament = parent;

  const c = event.draws = event.draws || [];
  if (c) {
    for (let i = c.length - 1; i >= 0; i--) {
      const draw = c[i];
      initDraw(draw, event);
    }
  }
}

export function removeEvent(tournament: Tournament, event: TEvent): void {
  const c = tournament.events;
  const i = indexOf(c, "id", event.id, "TEvent to remove not found");
  // this.undo.remove(c, i, "Delete " + c[i].name + " " + i, ModelType.TEvent); //c.splice( i, 1);
  // if (this.selection.event === event) {
  //     this.selection.select(c[i] || c[i - 1], ModelType.TEvent);
  // }
}
