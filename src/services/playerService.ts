import { selection, selectPlayer, update } from "../components/util/selection";
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

  const act = () => {
    update(({ tournament }) => {
      if (!id) {
        tournament.players.push(p);
      } else {
        tournament.players[i] = p;
      }
    });
  };
  act();

  const undo = () => {
    update(({ tournament }) => {
      if (prev) {
        tournament.players[i] = prev;
      } else {
        tournament.players.pop();
      }
    });
  };

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

  const act = () => {
    update(({ tournament }) => {
      tournament.players.splice(i, 1);
      for (const { e, d, b } of prevBoxes) {
        tournament.events[e].draws[d].boxes[b].playerId = "";
      }
    });
  };
  act();

  const undo = () => {
    update(({ tournament }) => {
      tournament.players.splice(i, 0, prevPlayer);
      for (const { e, d, b } of prevBoxes) {
        tournament.events[e].draws[d].boxes[b].playerId = playerId;
      }
    });
    selectPlayer(prevPlayer);
  };

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

  const act = () => {
    update(({ tournament }) => {
      const p = tournament.players[iPlayer];
      if (register) {
        if (!p.registration.includes(eventId)) {
          p.registration.push(eventId);
        }
      } else {
        removeValue(p.registration, eventId);
      }
    });
  };
  act();

  const undo = () => {
    update(({ tournament }) => {
      tournament.players[iPlayer].registration = [...prev]; // clone again?
    });
  };

  return {
    name: `${
      register ? "Register" : "Unregister"
    } ${player.name} to ${event.name}`,
    act,
    undo,
  };
}

// export function remove(player: Player) {
//     const c = player._tournament.players;
//     const i = indexOf(c, "id", player.id, "Player to remove not found");
//     // this.undo.remove(c, i, "Delete " + player.name + " " + i, ModelType.Player);   //c.splice( i, 1);
//   // if (this.selection.player === player) {
//   //     this.selection.select(c[i] || c[i - 1], ModelType.Player); //select next or previous
//   // }
//   //TODO update all _player internal references
//   // initTournament(player._tournament);
// }
