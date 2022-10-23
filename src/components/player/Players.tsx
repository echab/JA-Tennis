import { Component, createSignal, For, Show } from 'solid-js';
import { selection, selectPlayer } from '../util/selection';
import type { Player } from '../../domain/player';
import type { TEvent } from '../../domain/tournament';
import { updatePlayer, deletePlayer } from '../../services/playerService';
import { commandManager } from '../../services/util/commandManager';
import { DialogPlayer } from './DialogPlayer';
import { dragStart } from '../../services/util/dragdrop';

type Props = {
  players: Player[];
  events: TEvent[];
}

export const Players: Component<Props> = (props) => {
  
  const eventById = Object.fromEntries(props.events.map((e) => [e.id, e]));

  const [isDlgPlayer, showDlgPlayer] = createSignal(false);

  const editPlayer = (player?: Player) => { selectPlayer(player); showDlgPlayer(true); };

  return (
    <>
      <Show when={isDlgPlayer()}>
        <DialogPlayer events={props.events} player={selection.player}
          onOk={commandManager.wrap(updatePlayer)}
          onClose={() => showDlgPlayer(false)}
        />
      </Show>
      <table class="table table-hover table-condensed" style="width:auto;">
        {/* <caption>Players</caption> */}
        <thead>
          <tr>
            <th class="span1"><input type="checkbox" disabled /></th>
            <th class="text-left">Player name</th>
            <th class="text-left">Rank</th>
            <th class="text-left">Registrations</th>
            <td>
              <button type="button" onclick={[editPlayer,null]}>➕ Add player</button>
            </td>
          </tr>
        </thead>
        <tbody ondragstart={dragStart}>
          <For each={props.players} fallback={<tr><td colspan="3">No player</td></tr>}>{(player) =>
            <tr classList={{ info: player.id === selection.player?.id }}
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
              <td>
                <For each={player.registration}>{(eventId, i) =>
                  <span>{(i() ? ', ' : '') + eventById[eventId].name}</span>
                }</For>
              </td>
              <td class="hover">
                <button type="button" onclick={[commandManager.wrap(deletePlayer), player.id]} title={`Delete the player ${player.id}`}>✖</button>
              </td>
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
