import { type Component, createEffect, Show, untrack } from "solid-js";
import type { RouteSectionProps } from "@solidjs/router";
import { drawById, selTournament, selectBox } from "../util/selection";
import { DrawDraw } from "./DrawDraw.tsx";

type Data = {
}

export const PaneDraw: Component<RouteSectionProps<Data | undefined>> = (props) => {

    const cur = () => drawById(props.params.drawId ?? '', props.params.eventId);

    // init selection from url and after tournament load
    createEffect(() => {
        const _ = selTournament.id;
        return { ...props.params };
    }, ({ eventId, drawId, boxPos }) => {
        untrack(() => {
            // console.log('effect: select box', boxPos, eventId, drawId);
            selectBox(eventId, drawId, Number(boxPos));
        });
    });

    return <Show when={cur().event && cur().draw}>{
        <DrawDraw
            event={cur().event!}
            draw={cur().draw!}
            boxPos={Number(props.params.boxPos)}
        />
    }</Show>
}
