import { Component, createEffect, Show } from "solid-js";
import { A, useParams } from "@solidjs/router";
import { indexOf } from "../../services/util/find";
import { showDialog } from "../Dialogs";
import { selection, drawById, selectBox } from "../util/selection";
import { DrawDraw } from "./DrawDraw";
import { Params } from "../App";

export const PaneDraw: Component = () => {

    const params = useParams<Params>();

    const cur = () => drawById(params.drawId ?? '', params.eventId);
    const event = () => cur().event;
    const draw = () => cur().draw;

    const drawIndex = () => {
        const evt = event();
        return evt && params.drawId
            ? indexOf(evt.draws ?? [], 'id', params.drawId)
            : -2;
    };

    const prevDraw = () => event()?.draws[drawIndex() - 1];
    const nextDraw = () => event()?.draws[drawIndex() + 1];

    createEffect(() => {
        const evt = event();
        const drw = draw();
        const pos = params.boxPos ? +params.boxPos : NaN;
        evt && drw && selectBox(evt, drw, drw.boxes.find(({ position }) => position === pos));
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
            <h4 class="border-l-8"
                style={{ "border-color": event()?.color ?? 'transparent' }}
            >
                <i classList={{
                    'icon2-male': event()?.sexe === 'H',
                    'icon2-female': event()?.sexe === 'F',
                    'icon2-mixte': event()?.sexe === 'M',
                }}></i>
                {event()?.name}
                <Show when={draw()}>
                    <A class="p-2 rounded-full inline-block hover:bg-gray-200 [&.pointer-events-none]:opacity-50 "
                            // onclick={() => selectDraw(event()!, prevDraw())}
                            // disabled={!prevDraw()}
                            classList={{ "pointer-events-none": !prevDraw() }}
                            href={`/event/${params.eventId}/${prevDraw()?.id}`} replace={true}
                        ><i class="icon2-left-arrow"></i></A>
                    {/* <button class="p-2 rounded-full" onClick={() => showDialog("draw")}><i class="icon2-info"></i></button> */}
                    <span class="inline-block min-w-[5em]">{draw()?.name}</span>
                    <A class="p-2 rounded-full inline-block hover:bg-gray-200 [&.pointer-events-none]:opacity-50"
                        // onclick={() => selectDraw(event()!, nextDraw())}
                        // disabled={!nextDraw()}
                        href={`/event/${params.eventId}/${nextDraw()?.id}`} replace={true}
                        classList={{ "pointer-events-none": !nextDraw() }}
                    ><i class="icon2-right-arrow"></i></A>
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