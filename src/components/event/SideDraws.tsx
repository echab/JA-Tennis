import { type Component, For, Show } from 'solid-js';
import { useLocation } from '@solidjs/router';
import { ChevronsRightIcon, FileSlidersIcon, LockKeyholeIcon } from '@lucide/solid';
import { DrawIcon } from '../misc/Icons';
import { Badge } from '../misc/Badge';
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
            <a class={["aria-selected:bg-surface-selected px-1 flex gap-1 items-center", { "mt-3": !draw.cont }]}
                aria-selected={selection.drawId === draw.id ? 'true' : undefined}
                // onclick={() => selectDraw(props.event, draw)}
                href={paths.draw(props.event.id)(draw.id)(location.query)} noscroll
            >
                <FileSlidersIcon class="hover"
                    onClick={() => {
                        selectDraw(props.event.id, draw.id);
                        showDialog({ name: "draw" });
                    }}
                />
                {/* <small>{draw.id} </small> */}
                <DrawIcon />
                <span class="grow">{drawName(draw)} {draw.cont ? '(c)' : ''}</span>
                {/* TODO list the count of registered players in this draw, by rank */}

                {/* <span class="hover" onClick={() => commandManager.wrap(() => deleteDraw(draw.id))}><TrashIcon /></span> */}
                
                <Badge count={selection.drawProblems.get(`${draw.id}-${props.event.id}`)?.length ?? 0} minDisplay={1} />

                <Show when={draw.lock}><LockKeyholeIcon class=" opacity-60 mr-1" /></Show>

                <Show when={props.short}>
                    <span class="rounded-full hover:bg-surface-selecting hover"><ChevronsRightIcon /></span>
                </Show>
            </a>
        }</For>
    );
}