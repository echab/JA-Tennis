import { getId, indexOf } from "./util/find";
import { Guid } from "./util/guid";
import { initDraw } from "./drawService";
import { extend, isObject } from "./util/object";
import { Tournament, TEvent } from "../domain/tournament";
import { OptionalId } from "../domain/object";
import { Command, removeItemById } from "./util/commandManager";
import { selectEvent, selection, update } from "../components/util/selection";
import { removeValue } from "./util/array";

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

export function deleteEvent(eventId: string): Command {
  const { events, players } = selection.tournament;
  const i = indexOf(
    events,
    "id",
    eventId,
    "Player to remove not found",
  );
  const prevEvent = events[i];
  const registeredPlayerIds = new Set(
    players.filter((player) => player.registration.includes(eventId)).map(getId)
  );
  const byRegistered = ({id}:{id:string}) => registeredPlayerIds.has(id);

  const act = () => {
    update(({ tournament }) => {
      tournament.events.splice(i, 1);
      tournament.players
        // .filter(({id}) => registeredPlayers.has(id))
        .filter(byRegistered)
        .forEach(({registration}) => removeValue(registration, eventId))
    });
    selectEvent(undefined);
  };
  act();

  const undo = () => {
    update(({ tournament }) => {
      tournament.events.splice(i, 0, prevEvent);
      tournament.players
        .filter(byRegistered)
        .forEach(({registration}) => registration.push(eventId))
    });
    selectEvent(prevEvent);
  };

  return { name: `Remove event ${prevEvent.name}`, act, undo };
}
