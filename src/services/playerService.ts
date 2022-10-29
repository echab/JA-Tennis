import { selection, update } from "../components/util/selection";
import type { OptionalId } from "../domain/object";
import type { Player } from "../domain/player";
import { TEvent } from "../domain/tournament";
import { removeValue } from "./util/array";
import type { Command } from "./util/commandManager";
import { indexOf } from "./util/find";
import { Guid } from "./util/guid";

export function updatePlayer(
  player: OptionalId<Player>,
): Command {
  // const p: Player = { ...player, id: Guid.create("p") }; // clone source
  const p = player as Player;
  const id = player.id;
  if (!id) {
    player.id = Guid.create("p");
  }
  const i = id ? indexOf(selection.tournament.players, "id", id) : -1;
  // const prev = id ? { ...selection.tournament.players[i] } : undefined; // clone
  const prev = id ? selection.tournament.players[i] : undefined;

  const act = () => update((sel) => {
    if (!id) {
      sel.tournament.players.push(p);
    } else {
      sel.tournament.players[i] = p;
    }
    sel.player = p;
  });
  act();

  const undo = () => update((sel) => {
    if (prev) {
      sel.tournament.players[i] = prev;
    } else {
      sel.tournament.players.pop();
    }
    sel.player = sel.tournament.players.at(i);
  });

  return { name: `Add player ${player.name}`, act, undo };
}

export function deletePlayer(
  playerId: string,
): Command {
  const tournament = selection.tournament;

  const i = indexOf(
    tournament.players,
    "id",
    playerId,
    "Player to remove not found",
  );
  const prevPlayer = tournament.players[i];
  const prevBoxes = tournament.events.flatMap((event, e) =>
    event.draws.flatMap((draw, d) =>
      draw.boxes.filter((box) => box.playerId === playerId)
        .map((_, b) => ({ e, d, b }))
    )
  );

  const act = () => update((sel) => {
    sel.tournament.players.splice(i, 1);
    for (const { e, d, b } of prevBoxes) {
      sel.tournament.events[e].draws[d].boxes[b].playerId = "";
    }
    sel.player = sel.tournament.players.at(i);
  });
  act();

  const undo = () => update((sel) => {
    sel.tournament.players.splice(i, 0, prevPlayer);
    for (const { e, d, b } of prevBoxes) {
      sel.tournament.events[e].draws[d].boxes[b].playerId = playerId;
    }
    sel.player = prevPlayer;
  });

  return { name: `Remove player ${prevPlayer.name}`, act, undo };
}

export function registerPlayer(
  player: Player,
  event: TEvent,
  register = true,
): Command {
  const iPlayer = indexOf(selection.tournament.players, "id", player.id);
  const eventId = event.id;

  const prev = [...selection.tournament.players[iPlayer].registration]; // clone

  // TODO check compatibility
  // isSexeCompatible(event, player.sexe)

  const act = () => update((sel) => {
    const p = sel.tournament.players[iPlayer];
    if (register) {
      if (!p.registration.includes(eventId)) {
        p.registration.push(eventId);
      }
    } else {
      removeValue(p.registration, eventId);
    }
    sel.player = p;
  });
  act();

  const undo = () => update((sel) => {
    const p = sel.tournament.players[iPlayer];
    p.registration = [...prev]; // clone again?
    sel.player = p;
  });

  return {
    name: `${
      register ? "Register" : "Unregister"
    } ${player.name} to ${event.name}`,
    act,
    undo,
  };
}
