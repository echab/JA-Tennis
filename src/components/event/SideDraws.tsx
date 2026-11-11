import { type Component, For, Show } from 'solid-js';
import { useLocation } from '@solidjs/router';
import { selectDraw, selection } from '../util/selection';
import { drawName } from '../../services/drawService';
import { showDialog } from '../Dialogs';
import type { TEvent } from '../../domain/tournament';
import { paths } from '../../router';

type Props = {
    event: TEvent;
    short?: boolean;
}

export const SideDraws: Component<Props> = (props) => {
    const location = useLocation();

    return (
        <For each={props.event.draws}>{(draw) =>
            <div class={["draws px-1", { error: selection.drawProblems.has(`${draw.id}-${props.event.id}`) }]}
                aria-selected={draw.id === selection.drawId ? 'true' : 'false'}
            >
                <a class={["aria-selected:bg-blue-200 block", { "mt-2": !draw.cont }]}
                    aria-selected={selection.drawId === draw.id ? 'true' : 'false'}
                    // onclick={() => selectDraw(props.event, draw)}
                    href={paths.draw(props.event.id)(draw.id)(location.query)} noscroll
                >
                    <i class="icon2-info hover"
                        onClick={() => {
                            selectDraw(props.event.id, draw.id);
                            showDialog({ name: "draw" });
                        }}
                    />
                    {/* <small>{draw.id} </small> */}
                    <i class="icon2-draw" />
                    <Show when={draw.lock}><i class="icon2-locker opacity-60 mr-1" /></Show>
                    {drawName(draw)} {draw.cont ? '(c)' : ''}
                    {/* TODO list the count of registered players in this draw, by rank */}

                    {/* <span class=" float-right hover" onClick={() => commandManager.wrap(() => deleteDraw(draw.id))}><i class="icon2-cross" /></span> */}
                    
                    <Show when={props.short}>
                        <span class="float-right hover">&Gt;</span>
                    </Show>
                </a>
            </div>
        }</For>
    );
}