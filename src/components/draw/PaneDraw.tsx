import { Component, createEffect, Show } from "solid-js";
import { A, useNavigate, useParams } from "@solidjs/router";
import { indexOf } from "../../services/util/find";
import { showDialog } from "../Dialogs";
import { selection, drawById, selectBox, urlBox } from "../util/selection";
import { DrawDraw } from "./DrawDraw";
import { Params } from "../App";
import { IconSexe } from "../misc/IconSexe";
import { commandManager } from "../../services/util/commandManager";
import { drawLib, GenerateType } from "../../services/draw/drawLib";
import { findDrawPlayersOrQ, updateDraws } from "../../services/drawService";

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

    // change selection on url change
    createEffect(() => {
        const evt = event(), drw = draw();
        const pos = drw && params.boxPos ? +params.boxPos : NaN;
        if (evt && drw) {
            // console.log('effect: select box', pos, evt.id, drw.id);
            selectBox(evt, drw, drw.boxes.find(({ position }) => position === pos));
        }
    });

    // change url on selection change
    const navigate = useNavigate();
    createEffect(() => {
        const url = urlBox(selection.box, selection.draw, selection.event); // TODO using default params don't work?
        // if (location.pathname.startsWith(urlBox()) && location.pathname !== url) {
        if (location.pathname !== url) {
            // console.log('effect: navigate from', location.pathname, 'to', url);
            navigate(url, { replace: true });
        }
    });

    const randomize = () => {
        const evt = event(), drw = draw();
        if (evt && drw) {
            const lib = drawLib(evt, drw);
            const drawPlayers = findDrawPlayersOrQ(drw, selection.tournament.players);
            const newDraws = lib.generateDraw(GenerateType.Mix, drawPlayers);
            return commandManager.wrap(() => updateDraws(evt, newDraws));
        }
    };

    const generateLeft = () => {
        const evt = event(), drw = draw();
        if (evt && drw) {
            const lib = drawLib(evt, drw);
            const drawPlayers = findDrawPlayersOrQ(drw, selection.tournament.players);
            const newDraws = lib.generateDraw(GenerateType.PlusEchelonne, drawPlayers);
            return commandManager.wrap(() => updateDraws(evt, newDraws));
        }
    }

    const generateDown = () => {
        const evt = event(), drw = draw();
        if (evt && drw) {
            const lib = drawLib(evt, drw);
            const drawPlayers = findDrawPlayersOrQ(drw, selection.tournament.players);
            const newDraws = lib.generateDraw(GenerateType.PlusEnLigne, drawPlayers);
            return commandManager.wrap(() => updateDraws(evt, newDraws));
        }
    }

    return <div class="flex flex-col items-start">
        <div class="flex justify-between self-stretch items-center px-2">
            <h4 class="border-l-8"
                style={{ "border-color": event()?.color ?? 'transparent' }}
            >
                <IconSexe sexe={event()?.sexe} />
                {event()?.name}
                <Show when={draw()}>
                    <A class="p-2 rounded-full inline-block hover:bg-gray-200 [&.pointer-events-none]:opacity-50 "
                        // onclick={() => selectDraw(event()!, prevDraw())}
                        // disabled={!prevDraw()}
                        classList={{ "pointer-events-none": !prevDraw() }}
                        href={`/event/${params.eventId}/${prevDraw()?.id}`} replace={true}
                        title="View the previous draw of the event"
                    ><i class="icon2-left-arrow"></i></A>
                    {/* <button class="p-2 rounded-full" onClick={() => showDialog("draw")}><i class="icon2-info"></i></button> */}
                    <span class="inline-block min-w-[5em]">{draw()?.name}</span>
                    <A class="p-2 rounded-full inline-block hover:bg-gray-200 [&.pointer-events-none]:opacity-50"
                        // onclick={() => selectDraw(event()!, nextDraw())}
                        // disabled={!nextDraw()}
                        href={`/event/${params.eventId}/${nextDraw()?.id}`} replace={true}
                        classList={{ "pointer-events-none": !nextDraw() }}
                        title="View the next draw of the event"
                    ><i class="icon2-right-arrow"></i></A>
                </Show>
            </h4>
            <Show when={event() && draw()}>
                <div>
                    <button class="p-2 rounded-full" title="Edit draw information"
                        onClick={() => showDialog("draw")}
                    ><i class="icon2-info"></i></button>

                    <button class="p-2 rounded-full" title="Lock/unlock draw updates"
                        // onClick={lockDraw}
                    ><i class="icon2-locker"></i></button>

                    <button class="p-2 rounded-full" title="Change the draw structure to be more progressive"
                        onClick={generateLeft}
                    ><i class="icon2-draw-left"></i></button>

                    <button class="p-2 rounded-full" title="Change the draw structure to be more direct"
                        onClick={generateDown}
                    ><i class="icon2-draw-bottom"></i></button>

                    <button class="p-2 rounded-full" title="Shuffle the players with same rank"
                        onClick={randomize}
                    ><i class="icon2-random"></i></button>

                    <button class="p-2 rounded-full" title="Place the seeded positions"
                        // onClick={placeSeeded}
                    ><i class="icon2-seeded"></i></button>

                    <button class="p-2 rounded-full" title="Place the qualified position, in or out of the draw group"
                        // onClick={placeQualifs}
                    ><i class="icon2-qualif-in"></i></button>
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