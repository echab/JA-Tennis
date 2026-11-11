import { type Component, For } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { useLocation } from '@solidjs/router';
import { selectDraw, selection, selTournament } from '../util/selection';
import { commandManager } from '../../services/util/commandManager';
import { registerPlayer } from '../../services/playerService';
import { dragOver, getDragPlayer, getDropEvent } from '../../services/util/dragdrop';
import { isSexeCompatible } from '../../services/tournamentService';
import { SideDraws } from './SideDraws';
import { showDialog } from '../Dialogs';
import { IconSexe } from '../misc/IconSexe';
import { paths } from '../../router';

type Props = {
}

export const SideEvents: Component<Props> = () => {

    const location = useLocation();

    const drop_handler: JSX.EventHandlerUnion<HTMLDivElement, DragEvent> = (evt) => {
        evt.preventDefault();
        if (evt.dataTransfer) {
            const player = getDragPlayer(evt);
            const event = getDropEvent(evt);
            if (event && player && isSexeCompatible(event, player.sexe)) {
                commandManager.add(registerPlayer(player, event));
            }
        }
    }

    return <>
        <div class="flex justify-between items-center px-2">
            <h3>Draws</h3>

            <button type="button" class="rounded-full p-2 hover"
                onClick={() => {
                    selectDraw(undefined);
                    showDialog({ name: "event" });
                }}
            >➕ Add an event</button>

            {/* <button type="button" class="p-2 rounded-full">&Gt;</button> */}
        </div>
        <For each={selTournament.events} fallback={<div>No event</div>}>{(event) =>
            <div
                aria-selected={event.id === selection.eventId ? 'true' : 'false'}
                class="border-l-8 m-2"
                style={{ "border-color": event.color ?? 'transparent' }}
                onDrop={drop_handler} onDragOver={dragOver} data-type='event' data-id={event.id}
            >
                <div class="flex justify-between items-center aria-selected:bg-blue-200 bg-slate-200"
                    aria-selected={selection.eventId === event.id ? 'true' : 'false'}
                >
                    {/* <input type="checkbox" /> */}
                    <a href={paths.draw(event.id)(location.query)} noscroll>
                        <i class="icon2-info hover" onClick={() => {
                            selectDraw(event.id);
                            showDialog({ name: "event" });
                        }}/>
                        {/* <small>{event.id} </small> */}
                        <IconSexe sexe={event.sexe} double={event.typeDouble} />
                        <span>{event.name}</span>
                        {/* <small>X click.trigger="eventEditor.remove(event)"</small> */}
                    </a>

                    <button type="button" class="rounded-full p-0.5 px-1 hover" title="Add a draw"
                        onClick={() => {
                            selectDraw(event.id, undefined);
                            showDialog({ name: "draw" });
                        }}
                    >➕ Draw</button>
                </div>

                <SideDraws event={event} short />

                {/* TODO list the count of registered players not in any draw, by rank */}

            </div>
        }</For>

        <button type="button" class="rounded-full p-1"
            onClick={() => {
                selectDraw(undefined);
                showDialog({ name: "event" });
            }}
        >➕ Add an event</button>
    </>
}