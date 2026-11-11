import { type Component, Show } from "solid-js";
import { useLocation } from "@solidjs/router";
import { indexOf } from "../../services/util/find";
import { IconSexe } from "../misc/IconSexe";
import { drawName } from "../../services/drawService";
import { paths } from "../../router";
import type { TEvent } from "../../domain/tournament";
import type { Draw } from "../../domain/draw";

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

    return <h4 class="border-l-8 bg-white bg-opacity-80"
        style={{ "border-color": props.event?.color ?? 'transparent' }}
    >
        <IconSexe sexe={props.event?.sexe} double={props.event?.typeDouble} />
        {props.event?.name}
        <Show when={props.draw}>
            <a class={["p-2 rounded-full inline-block hover:bg-gray-200 [&.pointer-events-none]:opacity-50 ",
                { "pointer-events-none": !prevDraw() }]}
                // onclick={() => selectDraw(props.event!, prevDraw())}
                // disabled={!prevDraw()}
                href={paths.draw(props.event?.id ?? '')(prevDraw()?.id ?? '')(location.query)} replace
                title="View the previous draw of the event"
            ><i class="icon2-left-arrow" /></a>
            {/* <button class="p-2 rounded-full" onClick={() => showDialog("draw")}><i class="icon2-info" /></button> */}
            <span class="inline-block min-w-[5em]">{drawName(props.draw)}</span>
            <a class={["p-2 rounded-full inline-block hover:bg-gray-200 [&.pointer-events-none]:opacity-50",
                { "pointer-events-none": !nextDraw() }]}
                // onclick={() => selectDraw(props.event, nextDraw())}
                // disabled={!nextDraw()}
                href={paths.draw(props.event?.id ?? '')(nextDraw()?.id ?? '')(location.query)} replace
                title="View the next draw of the event"
            ><i class="icon2-right-arrow" /></a>
        </Show>
    </h4>
}
