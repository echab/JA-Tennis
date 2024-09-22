import { Component, createEffect, createSignal, For, Show } from 'solid-js';
import { A, useNavigate, type RouteSectionProps } from '@solidjs/router';
import { selection, selectPlayer, urlPlayer } from '../util/selection';
import type { Player } from '../../domain/player';
import { dragStart } from '../../services/util/dragdrop';
import { getRegisteredPlayers, isRegistred } from '../../services/tournamentService';
import { findDrawPlayerIds } from '../../services/drawService';
import { getId } from '../../services/util/find';
import { showDialog } from '../Dialogs';
import { IconSexe } from '../misc/IconSexe';

type Data = {
    short?: boolean;
}

export const Players: Component<RouteSectionProps<Data>> = (props) => {

    const short = !!props.data?.short; // TODO detect we are into the SidePanel

    const [registred, setRegistred] = createSignal(short);

    // change selection on url change
    createEffect(() => {
        const player = props.params.playerId
            ? selection.tournament.players.find(({id}) => id === props.params.playerId)
            : undefined;
        selectPlayer(player);
    });

    // change url on selection change
    const navigate = useNavigate();
    createEffect(() => {
        const url = urlPlayer(selection.player);
        if (location.pathname.startsWith(urlPlayer()) && location.pathname !== url) {
            navigate(url, { replace: true });
        }
    });

    const eventById = Object.fromEntries(selection.tournament.events.map((e) => [e.id, e]));

    const drawPlayerIds = () => selection.draw ? findDrawPlayerIds(selection.draw) : new Set<string>();

    const drawRegisteredPlayerIds = () => new Set(
        selection.event && selection.draw
            ? getRegisteredPlayers(selection.tournament.players, selection.event, selection.draw.minRank, selection.draw.maxRank).map(getId)
            : []
    );

    const editPlayer = (player?: Player) => { selectPlayer(player); showDialog("player"); };

    return (
        <>
            <div class="flex justify-between items-center px-2">
                <h3>Players</h3>

                <label><input type="checkbox"
                    checked={registred()}
                    onChange={({target}) => setRegistred((target as HTMLInputElement).checked)}
                /> registered</label>

                <button type="button" onclick={[editPlayer,null]} class="p-2 rounded-full" title='Add player'>➕</button>
                <Show when={short}>
                    <A href={urlPlayer()} replace class="p-2 rounded-full" title="Open the list in the main page">&Gt;</A>
                </Show>
            </div>
            <table class="table table-hover table-condensed w-auto mx-2">
                {/* <caption>Players</caption> */}
                <thead>
                    <tr>
                        <th class="span1 font-normal">
                            {/* <input type="checkbox" disabled title="Select all players" /> */}

                        </th>
                        <th class="text-left font-normal">sexe</th>
                        <th class="text-left font-normal">name</th>
                        <th class="text-left font-normal">rank</th>
                        <Show when={!short} fallback={
                            <th class="text-left font-normal">reg</th>
                        }>
                            <th class="text-left font-normal">club</th>
                            <th class="text-left font-normal">registrations</th>
                            <th class="text-left font-normal">phone</th>
                            <th class="text-left font-normal">email</th>
                        </Show>
                    </tr>
                </thead>
                <tbody ondragstart={dragStart}>
                    <For each={selection.tournament.players.filter((p) => !registred() || !selection.event || (selection.event && p.registration.includes(selection.event.id)))} fallback={<tr><td colspan="3">No player</td></tr>}>{(player) =>
                        <tr classList={{ info: player.id === selection.player?.id }}
                            onclick={[selectPlayer,player]}
                            draggable={true} data-type="player" data-id={player.id}
                        >
                            <td>
                                <input type="checkbox"
                                    checked={selection.player?.id === player.id}
                                    // disabled
                                    // onChange={(event) => selectPlayer(player)}
                                />
                                {/* <small>{player.id}</small> */}
                            </td>
                            <td class="text-left">
                                <i class="icon2-info hover" onclick={[editPlayer,player]}/>
                                <IconSexe sexe={player.sexe} />
                            </td>
                            <td class="text-left">
                                {player.name} {player.firstname}
                            </td>
                            <td class="text-left">{player.rank}</td>
                            <Show when={!short} fallback={
                                <td class="text-left">
                                    <Show when={selection.event}><i
                                        classList={{
                                            "icon2-checkmark": (!selection.draw && isRegistred(selection.event!, player)) || drawPlayerIds().has(player.id),
                                            "icon2-checkmark2": drawRegisteredPlayerIds().has(player.id),
                                        }}
                                    /></Show>
                                </td>
                            }>
                                <td>
                                    {player.club}
                                </td>
                                <td>
                                    <For each={player.registration}>{(eventId, i) =>
                                        <span>{(i() ? ', ' : '') + eventById[eventId]?.name}</span>
                                    }</For>
                                </td>
                                <td>
                                    {player.phone1} {player.phone2}
                                </td>
                                <td>
                                    {player.email}
                                </td>
                            </Show>
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
