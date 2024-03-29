import { getId, indexOf } from "./util/find";
import { guid } from "./util/guid";
import { TEvent } from "../domain/tournament";
import { OptionalId } from "../domain/object";
import { Command } from "./util/commandManager";
import { selection, update } from "../components/util/selection";
import { removeValue } from "./util/array";

/** Add a new event or update an existing event (with id) */
export function updateEvent(
    event: OptionalId<TEvent>,
): Command {
    const e = event as TEvent;
    const id = event.id;
    if (!id) {
        event.id = guid("e");
    }
    const i = id ? indexOf(selection.tournament.events, "id", id) : -1;
    // const prev = id ? { ...selection.tournament.events[i] } : undefined; // clone
    const prev = id ? selection.tournament.events[i] : undefined;

    const act = () => update((sel) => {
        if (!id) {
            sel.tournament.events.push(e);
        } else {
            sel.tournament.events[i] = e;
        }
        sel.event = e;
        sel.draw = undefined;
    });
    act();

    const undo = () => update((sel) => {
        if (prev) {
            sel.tournament.events[i] = prev;
        } else {
            sel.tournament.events.pop();
        }
        sel.event = prev;
        sel.draw = undefined;
    });

    return { name: `Add event ${event.name}`, act, undo };
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
    const byRegistered = ({id}: {id: string}) => registeredPlayerIds.has(id);

    const act = () => update((sel) => {
        sel.tournament.events.splice(i, 1);
        sel.tournament.players
        // .filter(({id}) => registeredPlayers.has(id))
            .filter(byRegistered)
            .forEach(({registration}) => removeValue(registration, eventId))
        sel.event = undefined;
    });
    act();

    const undo = () => update((sel) => {
        sel.tournament.events.splice(i, 0, prevEvent);
        sel.tournament.players
            .filter(byRegistered)
            .forEach(({registration}) => registration.push(eventId))
        sel.event = prevEvent;
    });

    return { name: `Remove event ${prevEvent.name}`, act, undo };
}
