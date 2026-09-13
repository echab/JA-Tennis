import { type Component, Show } from "solid-js";
import { useLocation, type RouteSectionProps } from "@solidjs/router";
import { indexOf } from "../../services/util/find";
import { showDialog } from "../Dialogs";
import { selection, drawById, setSelection } from "../util/selection";
import { DrawDraw } from "./DrawDraw";
import { IconSexe } from "../misc/IconSexe";
import { commandManager } from "../../services/util/commandManager";
import { drawLib, GenerateType } from "../../services/draw/drawLib";
import { findDrawPlayersOrQ, updateDraws } from "../../services/drawService";
import { BUILD, PLAN, PLAY } from "../../domain/draw";
import { Router } from "../../router";

type Data = {
}

export const PaneDraw: Component<RouteSectionProps<Data | undefined>> = (props) => {

    const location = useLocation();

    const cur = () => drawById(props.params.drawId ?? '', props.params.eventId);
    const event = () => cur().event;
    const draw = () => cur().draw;

    const drawIndex = () => {
        const evt = event();
        return evt && props.params.drawId
            ? indexOf(evt.draws ?? [], 'id', props.params.drawId)
            : -2;
    };

    const prevDraw = () => event()?.draws[drawIndex() - 1];
    const nextDraw = () => event()?.draws[drawIndex() + 1];

    // // change selection on url change
    // createEffect(() => ({ evt: event(), drw: draw(), findBoxes: draw()?.boxes.find, boxPos: props.params.boxPos}), ({ evt, drw, findBoxes, boxPos }) => {
    //     if (evt && drw && findBoxes) {
    //         const pos = boxPos ? +boxPos : NaN;
    //         // console.log('effect: select box', pos, evt.id, drw.id);
    //         selectBox(evt, drw, findBoxes(({ position }) => position === pos));
    //     }
    // });

    // // change url on selection change
    // const navigate = useNavigate();
    // createEffect(() => ({ box: selection.box, draw: selection.draw, event: selection.event, tournament: selection.tournament }), ({ box, draw, event, tournament }) => {
    //     const url = urlBox(box, draw, event, tournament);
    //     // if (location.pathname.startsWith(urlBox()) && location.pathname !== url) {
    //     if (location.pathname !== url) {
    //         // console.log('effect: navigate from', location.pathname, 'to', url);
    //         navigate(url, { replace: true });
    //     }
    // });

    const lockDraw = () => {
        setSelection((sel) => {
            if (sel.draw) {
                sel.draw.lock = sel.draw.lock === PLAN ? BUILD : PLAN;
            }
        });
    };

    const randomize = () => {
        const evt = event(), drw = draw();
        if (evt && drw) {
            const lib = drawLib(evt, drw);
            const drawPlayers = findDrawPlayersOrQ(drw, selection.tournament.players);
            const newDraws = lib.generateDraw(selection.tournament._types, GenerateType.Mix, drawPlayers);
            commandManager.add(updateDraws(evt, newDraws));
        }
    };

    const generateLeft = () => {
        const evt = event(), drw = draw();
        if (evt && drw) {
            const lib = drawLib(evt, drw);
            const drawPlayers = findDrawPlayersOrQ(drw, selection.tournament.players);
            const newDraws = lib.generateDraw(selection.tournament._types, GenerateType.PlusEchelonne, drawPlayers);
            if (newDraws.length) {
                commandManager.add(updateDraws(evt, newDraws));
            }
        }
    }

    const generateDown = () => {
        const evt = event(), drw = draw();
        if (evt && drw) {
            const lib = drawLib(evt, drw);
            const drawPlayers = findDrawPlayersOrQ(drw, selection.tournament.players);
            const newDraws = lib.generateDraw(selection.tournament._types, GenerateType.PlusEnLigne, drawPlayers);
            if (newDraws.length) {
                commandManager.add(updateDraws(evt, newDraws));
            }
        }
    }

    return <div class="flex flex-col items-start">
        <div class="flex justify-between self-stretch items-center px-2 sticky top-0 z-20">
            <h4 class="border-l-8 bg-white bg-opacity-80"
                style={{ "border-color": event()?.color ?? 'transparent' }}
            >
                <IconSexe sexe={event()?.sexe} double={event()?.typeDouble} />
                {event()?.name}
                <Show when={draw()}>
                    <a class={["p-2 rounded-full inline-block hover:bg-gray-200 [&.pointer-events-none]:opacity-50 ",
                        { "pointer-events-none": !prevDraw() }]}
                        // onclick={() => selectDraw(event()!, prevDraw())}
                        // disabled={!prevDraw()}
                        href={Router.paths.draw(event()?.id ?? '')(prevDraw()?.id ?? '')(location.query)} replace
                        title="View the previous draw of the event"
                    ><i class="icon2-left-arrow" /></a>
                    {/* <button class="p-2 rounded-full" onClick={() => showDialog("draw")}><i class="icon2-info" /></button> */}
                    <span class="inline-block min-w-[5em]">{draw()?.name}</span>
                    <a class={["p-2 rounded-full inline-block hover:bg-gray-200 [&.pointer-events-none]:opacity-50",
                        { "pointer-events-none": !nextDraw() }]}
                        // onclick={() => selectDraw(event()!, nextDraw())}
                        // disabled={!nextDraw()}
                        href={Router.paths.draw(event()?.id ?? '')(nextDraw()?.id ?? '')(location.query)} replace
                        title="View the next draw of the event"
                    ><i class="icon2-right-arrow" /></a>
                </Show>
            </h4>
            <Show when={event() && draw()}>
                <div class="bg-white bg-opacity-80 print:hidden">
                    <button class="p-2 rounded-full" title="Edit draw information"
                        onClick={() => showDialog({ name: "draw" })}
                    ><i class="icon2-info" /></button>

                    <button class="p-2 rounded-full aria-selected:bg-blue-200"
                        title={`Lock/unlock draw updates (${draw()?.lock ?? BUILD})`}
                        aria-selected={draw()?.lock === PLAN ? 'true' : 'false'}
                        onClick={lockDraw}
                    ><i class="icon2-locker" /></button>

                    <Show when={(draw()?.lock ?? BUILD) === BUILD}>
                        {/* eslint-disable-next-line no-bitwise */}
                        <Show when={!((draw()?.lock ?? BUILD) & PLAY)}>
                            <button class="p-2 rounded-full" title="Change the draw structure to be more progressive"
                                onClick={generateLeft}
                            ><i class="icon2-draw-left" /></button>

                            <button class="p-2 rounded-full" title="Change the draw structure to be more direct"
                                onClick={generateDown}
                            ><i class="icon2-draw-bottom" /></button>
                        </Show>

                        <button class="p-2 rounded-full" title="Shuffle the players with same rank"
                            onClick={randomize}
                        ><i class="icon2-random" /></button>

                        <button class="p-2 rounded-full" title="Place the seeded positions"
                            // onClick={placeSeeded}
                        ><i class="icon2-seeded" /></button>
                    </Show>
                    <button class="p-2 rounded-full" title="Place the qualified position, in or out of the draw group"
                        // onClick={placeQualifs}
                    ><i class="icon2-qualif-in" /></button>
                </div>
            </Show>
        </div>
        <Show when={draw()}>
            <DrawDraw
                event={event()!} draw={draw()!}
                tournament={selection.tournament}
            />
        </Show>
    </div>;
};