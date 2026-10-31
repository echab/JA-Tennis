import { snapshot } from "solid-js";
import { selectPlayer, selTournament, setTournament } from "../components/util/selection";
import type { OptionalId } from "../domain/object";
import type { Player } from "../domain/player";
import type { TEvent } from "../domain/tournament";
import { removeValue } from "./util/array";
import type { Command } from "./util/commandManager";
import { indexOf } from "./util/find";
import { guid } from "./util/guid";
import { applyChangesAt } from "./util/object";

export function updatePlayer(
    player: OptionalId<Player>,
): Command {
    // const p: Player = { ...player, id: guid("p") }; // clone source
    const p = player as Player;
    const id = player.id;
    player.id ??= guid("p");
    const i = id ? indexOf(selTournament.players, "id", id) : -1;
    const prev = snapshot<Player | undefined>(selTournament.players[i]);

    const act = () => {
        setTournament((t) => {
            applyChangesAt(t.players, i, p);
        });
        selectPlayer(p.id);
    };
    act();

    const undo = () => {
        setTournament((t) => {
            applyChangesAt(t.players, i, prev);
        });
        selectPlayer(prev?.id);
    };

    return { name: `Add player ${player.name}`, act, undo };
}

export function deletePlayer(
    playerId: string,
): Command {
    const i = indexOf(
        selTournament.players,
        "id",
        playerId,
        "Player to remove not found",
    );
    const prevPlayer = snapshot(selTournament.players[i]);
    const prevBoxes = selTournament.events.flatMap((event, e) =>
        event.draws.flatMap((draw, d) =>
            draw.boxes.filter((box) => box.playerId === playerId)
                .map((_, b) => ({ e, d, b }))
        )
    );

    const act = () => {
        setTournament((t) => {
            t.players.splice(i, 1);
            for (const { e, d, b } of prevBoxes) {
                t.events[e].draws[d].boxes[b].playerId = "";
            }
        });
        selectPlayer();
    };
    act();

    const undo = () => {
        setTournament((t) => {
            t.players.splice(i, 0, prevPlayer);
            for (const { e, d, b } of prevBoxes) {
                t.events[e].draws[d].boxes[b].playerId = playerId;
            }
        });
        selectPlayer(prevPlayer.id);
    };

    return { name: `Remove player ${prevPlayer.name}`, act, undo };
}

export function registerPlayer(
    player: Player,
    event: TEvent,
    register = true,
): Command {
    const iPlayer = indexOf(selTournament.players, "id", player.id);
    const eventId = event.id;

    const prev = snapshot(selTournament.players[iPlayer].registration);

    // TODO check compatibility
    // isSexeCompatible(event, player.sexe)

    const act = () => {
        setTournament((t) => {
            const p = t.players[iPlayer];
            if (register) {
                if (!p.registration.includes(eventId)) {
                    p.registration.push(eventId);
                }
            } else {
                removeValue(p.registration, eventId);
            }
        });
        selectPlayer(player.id);
    };
    act();

    const undo = () => {
        setTournament((t) => {
            t.players[iPlayer].registration = prev;
        });
        selectPlayer(player.id);
    };

    return {
        name: `${
            register ? "Register" : "Unregister"
        } ${player.name} to ${event.name}`,
        act,
        undo,
    };
}
