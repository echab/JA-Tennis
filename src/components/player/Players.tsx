import { Component, For, Show } from 'solid-js';
import { selection, selectPlayer } from '../util/selection';
import type { Player } from '../../domain/player';
import type { TEvent } from '../../domain/tournament';
import { dragStart } from '../../services/util/dragdrop';
import { getRegisteredPlayers, isRegistred } from '../../services/tournamentService';
import { findDrawPlayerIds } from '../../services/drawService';
import { getId } from '../../services/util/find';
import { showDialog } from '../Dialogs';

type Props = {
  players: Player[];
  events: TEvent[];
}

export const Players: Component<Props> = (props) => {
  
  const eventById = Object.fromEntries(props.events.map((e) => [e.id, e]));

  const drawPlayerIds = () => selection.draw ? findDrawPlayerIds(selection.draw) : new Set<string>();

  const drawRegisteredPlayerIds = () => new Set(
    selection.event && selection.draw
    ? getRegisteredPlayers(props.players, selection.event, selection.draw.minRank, selection.draw.maxRank).map(getId)
    : []
  );

  const editPlayer = (player?: Player) => { selectPlayer(player); showDialog("player"); };

  return (
    <>
      <div class="flex justify-between items-center">
        <h3>Players</h3>
        <button type="button" onclick={[editPlayer,null]}  class="p-2 rounded-full">➕ Add player</button>
        <button type="button" class="p-2 rounded-full">&Gt;</button>
      </div>
      <table class="table table-hover table-condensed w-auto">
        {/* <caption>Players</caption> */}
        <thead>
          <tr>
            <th class="span1"><input type="checkbox" disabled /></th>
            <th class="text-left">Player name</th>
            <th class="text-left">Rank</th>
            <th class="text-left">Reg</th>
            {/* <th class="text-left">Registrations</th> */}
          </tr>
        </thead>
        <tbody ondragstart={dragStart}>
          <For each={props.players} fallback={<tr><td colspan="3">No player</td></tr>}>{(player) =>
            <tr classList={{ info: player.id === selection.player?.id }}
              onclick={() => selectPlayer(player)}
              draggable={true} data-type="player" data-id={player.id}
            >
              <td>
                <input type="checkbox"
                  checked={selection.player?.id === player.id}
                  disabled
                // onChange={(event) => selectPlayer(player)}
                />
                <small>{player.id}</small>
              </td>
              <td class="text-left">
                <i class="icon2-info hover" onclick={[editPlayer,player]}></i>
                <span>
                <i classList={{
                  'icon2-male': player.sexe === 'H',
                  'icon2-female': player.sexe === 'F',
                  'icon2-mixte': player.sexe === 'M',
                }}></i>
                {player.name} {player.firstname}
                </span>
              </td>
              <td class="text-left">{player.rank}</td>
              <td class="text-left">
                <Show when={selection.event}><i
                   classList={{
                    "icon2-checkmark": (!selection.draw && isRegistred(selection.event!, player)) || drawPlayerIds().has(player.id),
                    "icon2-checkmark2": drawRegisteredPlayerIds().has(player.id),
                   }}
                   ></i></Show>
              </td>
              {/* <td>
                <For each={player.registration}>{(eventId, i) =>
                  <span>{(i() ? ', ' : '') + eventById[eventId].name}</span>
                }</For>
              </td> */}
              {/* <td class="hover">
                <button type="button" onclick={[commandManager.wrap(deletePlayer), player.id]} title={`Delete the player ${player.id}`}>✖</button>
              </td> */}
            </tr>
          }</For>
          <tr>
            <td colSpan={4}>
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
};
