import { type Component, Show } from "solid-js";
import { useLocation } from "@solidjs/router";
import { ChevronLeftIcon, ChevronRightIcon, FileSlidersIcon } from "@lucide/solid";
import { IconSexe } from "../misc/Icons";
import { indexOf } from "../../services/util/find";
import { drawName } from "../../services/drawService";
import { paths } from "../../router";
import type { TEvent } from "../../domain/tournament";
import type { Draw } from "../../domain/draw";
import { selectDraw } from "../util/selection";
import { showDialog } from "../Dialogs";

type Props = {
    event?: TEvent,
    draw?: Draw,
    boxPos?: number,
}

export const DrawHeader: Component<Props> = (props) => {

    const location = useLocation();

    const drawIndex = () => {
        return props.event && props.draw?.id
            ? indexOf(props.event.draws ?? [], 'id', props.draw.id)
            : -2;
    };

    const prevDraw = () => props.event?.draws[drawIndex() - 1];
    const nextDraw = () => props.event?.draws[drawIndex() + 1];

    return <h4 class="border-l-8 bg-surface/80 px-2"
        style={{ "border-color": props.event?.color ?? 'transparent' }}
    >
        <span class="hover p-2 rounded-full hover:bg-surface-selecting cursor-pointer" onClick={() => {
            selectDraw(props.event?.id);
            showDialog({ name: "event" });
        }} title="Edit event informations"><FileSlidersIcon /></span>
        <IconSexe sexe={props.event?.sexe} double={props.event?.typeDouble} />
        <span class="p-2">{props.event?.name}</span>
        <Show when={props.draw}>
            <a class={["p-2 rounded-full inline-block hover:bg-surface-selecting [&.pointer-events-none]:opacity-40 ",
                { "pointer-events-none": !prevDraw() }]}
                // onclick={() => selectDraw(props.event!, prevDraw())}
                // disabled={!prevDraw()}
                href={paths.draw(props.event?.id ?? '')(prevDraw()?.id ?? '')(location.query)} replace
                title="View the previous draw of the event"
            ><ChevronLeftIcon strokeWidth="4" /></a>
            {/* <button class="p-2 rounded-full" onClick={() => showDialog("draw")}><FileSlidersIcon /></button> */}
            <span class="inline-block min-w-[5em]">{drawName(props.draw)}</span>
            <a class={["p-2 rounded-full inline-block hover:bg-surface-selecting [&.pointer-events-none]:opacity-40",
                { "pointer-events-none": !nextDraw() }]}
                // onclick={() => selectDraw(props.event, nextDraw())}
                // disabled={!nextDraw()}
                href={paths.draw(props.event?.id ?? '')(nextDraw()?.id ?? '')(location.query)} replace
                title="View the next draw of the event"
            ><ChevronRightIcon strokeWidth="4" /></a>
        </Show>
    </h4>
}
