import { type Component, createEffect, Show, untrack } from "solid-js";
import type { RouteSectionProps } from "@solidjs/router";
import { selTournament, selectBox, selectDraw } from "../util/selection";
import { DrawHeader } from "./DrawHeader.tsx";
import { DrawDraw } from "./DrawDraw.tsx";
import { SideDraws } from "../event/SideDraws.tsx";
import { showDialog } from "../Dialogs.tsx";
import { byId } from "../../services/util/find.ts";

type Data = {
}

export const PaneDraw: Component<RouteSectionProps<Data | undefined>> = (props) => {

    // init selection from url and after tournament load
    createEffect(() => {
        // trigger on tournament load
        const _ = selTournament.id;
        return { ...props.params };
    }, ({ eventId, drawId, boxPos }) => {
        untrack(() => {
            // console.log('effect: select box', boxPos, eventId, drawId);
            selectBox(eventId, drawId, Number(boxPos));
            document.getElementById(`pos${boxPos}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
    });

    return (
        <Show
            when={byId(selTournament.events, props.params.eventId)}
            fallback={
                <div class="m-4 italic">Event <code>{props.params.eventId}</code> not found.</div>
            }
        >{(event) =>
            <Show when={byId(event().draws, props.params.drawId)}
                fallback={
                    <div class="m-2">
                        <DrawHeader event={event()} />
                        <SideDraws event={event()} />
                        <hr />
                        <div>
                            <button type="button" class="rounded-full p-0.5 px-1" title="Add a draw"
                                onClick={() => {
                                    selectDraw(event().id, undefined);
                                    showDialog({ name: "draw" });
                                }}
                            >➕ Add a new draw</button>
                        </div>
                    </div>
                }
            >{(draw) =>
                <DrawDraw
                    event={event()}
                    draw={draw()}
                    boxPos={Number(props.params.boxPos)}
                />
                }</Show>
            }</Show>
    );
}
