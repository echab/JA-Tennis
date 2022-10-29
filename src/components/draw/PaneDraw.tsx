import { Component, createEffect, Show } from "solid-js";
import { A, useParams } from "@solidjs/router";
import { indexOf } from "../../services/util/find";
import { showDialog } from "../Dialogs";
import { selection, selectDraw, drawById } from "../util/selection";
import { DrawDraw } from "./DrawDraw";

export const PaneDraw: Component = () => {

    const params = useParams();

    // const [draw, event] = drawById(params.drawId, params.eventId); // TODO? reactive

    const event = () => selection.tournament.events.find(({ id }) => id === params.eventId);

    const drawIndex = () => {
        const evt = event();
        return evt && params.drawId
            ? indexOf(evt.draws ?? [], 'id', params.drawId)
            : -2;
    };
    const draw = () => event()?.draws[drawIndex()];

    const prevDraw = () => event()?.draws[drawIndex() - 1];
    const nextDraw = () => event()?.draws[drawIndex() + 1];

    createEffect(() => {
        selectDraw(event(), draw());
    });

    const randomize = () => {
        const evt = event(), drw = draw();
        // if (evt && drw) {
        //     const lib = drawLib(evt, drw);
        //     const newDraw = lib.generateDraw(GenerateType.Create, registeredPlayersOrQ());
        // }
    };

    return <div class="flex flex-col items-start">
        <div class="flex justify-between self-stretch items-center px-2">
            <h4>{event()?.name}
                <Show when={draw()}> - <button class="p-2 rounded-full"
                    onClick={() => showDialog("draw")}
                ><i class="icon2-info"></i></button> {draw()?.name}
                </Show>
            </h4>
            <Show when={event() && draw()}>
                <div>
                    <button class="p-2 rounded-full"
                        onClick={() => showDialog("draw")}
                    ><i class="icon2-info"></i></button>

                    <button class="p-2 rounded-full"
                    // onClick={() => commandManager.wrap()}
                    ><i class="icon2-draw-left"></i></button>

                    <button class="p-2 rounded-full"
                    // onClick={() => commandManager.wrap()}
                    ><i class="icon2-draw-bottom"></i></button>

                    <button class="p-2 rounded-full"
                    // onClick={() => commandManager.wrap(randomize)}
                    ><i class="icon2-random"></i></button>

                    <A class="p-2 rounded-full inline-block hover:bg-gray-200 [&.pointer-events-none]:opacity-50 "
                        // onclick={() => selectDraw(event()!, prevDraw())}
                        // disabled={!prevDraw()}
                        classList={{ "pointer-events-none": !prevDraw() }}
                        href={`/event/${params.eventId}/${prevDraw()?.id}`}
                    ><i class="icon2-left-arrow"></i></A>

                    <A class="p-2 rounded-full inline-block hover:bg-gray-200 [&.pointer-events-none]:opacity-50"
                        // onclick={() => selectDraw(event()!, nextDraw())}
                        // disabled={!nextDraw()}
                        href={`/event/${params.eventId}/${nextDraw()?.id}`}
                        classList={{ "pointer-events-none": !nextDraw() }}
                    ><i class="icon2-right-arrow"></i></A>
                </div>
            </Show>
        </div>
        <Show when={draw()}>
            <DrawDraw
                event={event()!}
                draw={draw()!}
                players={selection.tournament.players}
            />
        </Show>
    </div>;
};