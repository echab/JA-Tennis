import { Component, createMemo, createSignal, For, Show, untrack } from 'solid-js';
import { selection, selectPlayer, selTournament } from '../util/selection';
import { dragStart } from '../../services/util/dragdrop';
import { getRegisteredPlayers, isRegistred } from '../../services/tournamentService';
import { findDrawPlayerIds } from '../../services/drawService';
import { getId } from '../../services/util/find';
import { showDialog } from '../Dialogs';
import { IconSexe } from '../misc/IconSexe';

type Props = {
    short?: boolean;
    playerId?: string;
    urlNewPlayer: (playerId?: string) => string;
}

export const Players: Component<Props> = (props) => {

    // const location = useLocation();

    const [registered, setRegistered] = createSignal(() => !!props.short, { name: 'registered'});

    const visiblePlayers = createMemo(() =>
        registered() && selection.event
            ? selTournament.players.filter((p) => untrack(() => p.registration.includes(selection.event!.id)))
            : selTournament.players
    );

    const eventById = (id: string) => selTournament.events.find((e) => e.id === id);

    const drawPlayerIds = () => selection.draw ? findDrawPlayerIds(selection.draw) : new Set<string>();

    const drawRegisteredPlayerIds = () => new Set(
        selection.event && selection.draw
            ? getRegisteredPlayers(selTournament._types, selTournament.players, selection.event, selection.draw.minRank, selection.draw.maxRank).map(getId)
            : []
    );

    const editPlayer = (playerId?: string) => {
        selectPlayer(playerId);
        showDialog({ name: "player" });
    };

    return (
        <>
            <div class="flex justify-between items-center px-2">
                <h3>Players</h3>

                <label><input type="checkbox"
                    checked={registered()}
                    onChange={({target}) => setRegistered((target as HTMLInputElement).checked)}
                /> registered</label>

                <button type="button" onClick={() => editPlayer(undefined)} class="p-2 rounded-full" title='Add player'>➕</button>
                <Show when={props.short}>
                    {/* <a href={Router.paths.players(location.query)} replace class="p-2 rounded-full" title="Open the list in the main page">&Gt;</a> */}
                    <a href={props.urlNewPlayer()} replace class="p-2 rounded-full" title="Open the list in the main page">&Gt;</a>
                </Show>
            </div>
            <table class={['table table-hover table-condensed table-fixed w-90 mx-2',
                !props.short ? 'w-210' : 'w-90'
            ]}>
                {/* <caption>Players</caption> */}
                <thead>
                    <tr>
                        <th class="span1 font-normal w-6">
                            {/* <input type="checkbox" disabled title="Select all players" /> */}
                        </th>
                        <th class="text-left font-normal w-10">sexe</th>
                        <th class="text-left font-normal w-46">name</th>
                        <th class="text-left font-normal w-12">rank</th>
                        <Show when={!props.short} fallback={
                            <th class="text-left font-normal w-20">reg</th>
                        }>
                            <th class="text-left font-normal w-30">club</th>
                            <th class="text-left font-normal w-16">category</th>
                            <th class="text-left font-normal w-40">registrations</th>
                            <th class="text-left font-normal w-26">phone</th>
                            <th class="text-left font-normal w-26">email</th>
                        </Show>
                    </tr>
                </thead>
                <tbody onDragStart={dragStart}>
                    <For each={visiblePlayers()}
                        // keyed={(p) => p.id}
                        fallback={<tr><td colspan="3">No player</td></tr>}
                    >{(player) =>
                        <tr class={{ info: player.id === selection.player?.id }}
                            onClick={() => selectPlayer(player.id)}
                            draggable="true" data-type="player" data-id={player.id}
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
                                <i class="icon2-info hover" onClick={() => editPlayer(player.id)}/>
                                <IconSexe sexe={player.sexe} />
                            </td>
                            <td class="text-left w-46 overflow-hidden whitespace-nowrap text-ellipsis">
                                {player.name} {player.firstname}
                            </td>
                            <td class="text-left">{player.rank}</td>
                            <Show when={!props.short} fallback={
                                <td class="text-left">
                                    <Show when={selection.event}><i
                                        class={{
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
                                    {player.category && selTournament._types.category.name(player.category)}
                                </td>
                                <td>
                                    <For each={player.registration}>{(eventId, i) =>
                                        <span>{(i() ? ', ' : '') + eventById(eventId)?.name}</span>
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
                        <td colspan={4} />
                    </tr>
                </tbody>
            </table>
        </>
    );
};
