import { snapshot } from "solid-js";
import { getId, indexOf } from "./util/find";
import { guid } from "./util/guid";
import type { TEvent } from "../domain/tournament";
import type { OptionalId } from "../domain/object";
import type { Command } from "./util/commandManager";
import { selectDraw, selTournament, setTournament } from "../components/util/selection";
import { removeValue } from "./util/array";
import { applyChangesAt } from "./util/object";

/** Add a new event or update an existing event (with id) */
export function updateEvent(
    event: OptionalId<TEvent>,
): Command {
    const e = event as TEvent;
    const id = event.id;
    event.id ??= guid("e");
    const i = id ? indexOf(selTournament.events, "id", id) : -1;
    const prev = id ? snapshot(selTournament.events[i]) : undefined;

    const act = () => {
        setTournament((t) => {
            applyChangesAt(t.events, i, e);
        });
        selectDraw(event.id);
    };
    act();

    const undo = () => {
        setTournament((t) => {
            applyChangesAt(t.events, i, prev);
        });
        selectDraw(prev?.id);
    };

    return { name: `Add event ${event.name}`, act, undo };
}

export function deleteEvent(eventId: string): Command {
    const { events, players } = selTournament;
    const i = indexOf(
        events,
        "id",
        eventId,
        "Event to remove not found",
    );
    const prevEvent = snapshot(events[i]);
    const registeredPlayerIds = new Set(
        players.filter((player) => player.registration.includes(eventId)).map(getId)
    );
    const byRegistered = ({id}: {id: string}) => registeredPlayerIds.has(id);

    const act = () => {
        setTournament((t) => {
            t.events.splice(i, 1);
            t.players
            // .filter(({id}) => registeredPlayers.has(id))
                .filter(byRegistered)
                .forEach(({registration}) => removeValue(registration, eventId))
        });
        selectDraw();
    };
    act();

    const undo = () => {
        setTournament((t) => {
            t.events.splice(i, 0, prevEvent);
            t.players
                .filter(byRegistered)
                .forEach(({registration}) => registration.push(eventId))
        });
        selectDraw(prevEvent.id);
    };

    return { name: `Remove event ${prevEvent.name}`, act, undo };
}
