import { type Component, For, Show } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { useLocation } from '@solidjs/router';
import { selectDraw, selection, selTournament } from '../util/selection';
import { commandManager } from '../../services/util/commandManager';
import { registerPlayer } from '../../services/playerService';
import { dragOver, getDragPlayer, getDropEvent } from '../../services/util/dragdrop';
import { isSexeCompatible } from '../../services/tournamentService';
import { drawName } from '../../services/drawService';
import { showDialog } from '../Dialogs';
import { IconSexe } from '../misc/IconSexe';
import { Router } from '../../router';

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
                aria-selected={event.id === selection.event?.id ? 'true' : 'false'}
                class="border-l-8 m-2"
                style={{ "border-color": event.color ?? 'transparent' }}
                onDrop={drop_handler} onDragOver={dragOver} data-type='event' data-id={event.id}
            >
                <div class="flex justify-between items-center aria-selected:bg-blue-200 bg-slate-200"
                    aria-selected={selection.event === event ? 'true' : 'false'}
                >
                    {/* <input type="checkbox" /> */}
                    <a href={Router.paths.draw(event.id)(location.query)} noscroll>
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

                <div>
                    <For each={event.draws}>{(draw) =>
                        <div class={["draws px-1", { error: selection.drawProblems.has(`${draw.id}-${event.id}`) }]}
                            aria-selected={draw.id === selection.draw?.id ? 'true' : 'false'}
                        >
                            <a class={["aria-selected:bg-blue-200 block", { "mt-2": !draw.cont }]}
                                aria-selected={selection.draw?.id === draw.id ? 'true' : 'false'}
                                // onclick={() => selectDraw(event, draw)}
                                href={Router.paths.draw(event.id)(draw.id)(location.query)} noscroll
                            >
                                <i class="icon2-info hover"
                                    onClick={() => {
                                        selectDraw(event.id, draw.id);
                                        showDialog({ name: "draw" });
                                    }}
                                />
                                {/* <small>{draw.id} </small> */}
                                <i class="icon2-draw" />
                                <Show when={draw.lock}><i class="icon2-locker opacity-60 mr-1" /></Show>
                                {drawName(draw)} {draw.cont ? '(c)' : ''}
                                {/* TODO list the count of registered players in this draw, by rank */}

                                <span class="float-right hover">&Gt;</span>

                                {/* <span class=" float-right hover" onClick={() => commandManager.wrap(() => deleteDraw(draw.id))}><i class="icon2-cross" /></span> */}
                            </a>
                        </div>
                    }</For>
                </div>

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