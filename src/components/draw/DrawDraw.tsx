import { type Component, Show } from "solid-js";
import { useLocation } from "@solidjs/router";
import { indexOf } from "../../services/util/find";
import { showDialog } from "../Dialogs";
import { selTournament, setTournamentDraw } from "../util/selection";
import { IconSexe } from "../misc/IconSexe";
import { commandManager } from "../../services/util/commandManager";
import { drawLib, GenerateType } from "../../services/draw/drawLib";
import { findDrawPlayersOrQ, updateDraws } from "../../services/drawService";
import { BUILD, type Draw, PLAN, PLAY, ROUNDROBIN } from "../../domain/draw";
import type { TEvent } from "../../domain/tournament";
import { DrawKnockout } from './DrawKnockout';
import { DrawRoundRobin } from './DrawRoundRobin';
import { Router } from "../../router";
import './Draw.css';

type Props = {
    event: TEvent,
    draw: Draw,
    boxPos: number,
}

export const DrawDraw: Component<Props> = (props) => {

    const lib = () => drawLib(props.event, props.draw);

    const lockDraw = () => {
        setTournamentDraw(props.event.id, props.draw.id, (draw) => {
            draw.lock = draw.lock === PLAN ? BUILD : PLAN;
        });
    };

    const randomize = () => {
        const drawPlayers = findDrawPlayersOrQ(props.draw, selTournament.players);
        const newDraws = lib().generateDraw(selTournament._types, GenerateType.Mix, drawPlayers);
        commandManager.add(updateDraws(props.event, newDraws));
    };

    const generateLeft = () => {
        const drawPlayers = findDrawPlayersOrQ(props.draw, selTournament.players);
        const newDraws = lib().generateDraw(selTournament._types, GenerateType.PlusEchelonne, drawPlayers);
        if (newDraws.length) {
            commandManager.add(updateDraws(props.event, newDraws));
        }
    }

    const generateDown = () => {
        const drawPlayers = findDrawPlayersOrQ(props.draw, selTournament.players);
        const newDraws = lib().generateDraw(selTournament._types, GenerateType.PlusEnLigne, drawPlayers);
        if (newDraws.length) {
            commandManager.add(updateDraws(props.event, newDraws));
        }
    }

    return <div class="flex flex-col items-start">
        <div class="flex justify-between self-stretch items-center px-2 sticky top-0 z-20">
            <DrawHeader event={props.event} draw={props.draw} boxPos={props.boxPos} />
            <div class="bg-white bg-opacity-80 print:hidden">
                <button class="p-2 rounded-full" title="Edit draw information"
                    onClick={() => showDialog({ name: "draw" })}
                ><i class="icon2-info" /></button>

                <button class="p-2 rounded-full aria-selected:bg-blue-200"
                    title={`Lock/unlock draw updates (${props.draw.lock ?? BUILD})`}
                    aria-selected={props.draw.lock === PLAN ? 'true' : 'false'}
                    onClick={lockDraw}
                ><i class="icon2-locker" /></button>

                <Show when={(props.draw.lock ?? BUILD) === BUILD}>
                    {/* eslint-disable-next-line no-bitwise */}
                    <Show when={!((props.draw.lock ?? BUILD) & PLAY)}>
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
        </div>
        <Show when={!!(props.draw.type & ROUNDROBIN)} fallback={ // oxlint-disable-line no-bitwise
            <DrawKnockout event={props.event} draw={props.draw} tournament={selTournament} />
            }>
            <DrawRoundRobin event={props.event} draw={props.draw} tournament={selTournament} />
        </Show>
    </div>;
};

const DrawHeader: Component<Props> = (props) => {

    const location = useLocation();

    const drawIndex = () => {
        return props.event && props.draw.id
            ? indexOf(props.event.draws ?? [], 'id', props.draw.id)
            : -2;
    };

    const prevDraw = () => props.event.draws[drawIndex() - 1];
    const nextDraw = () => props.event.draws[drawIndex() + 1];

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
                href={Router.paths.draw(props.event?.id ?? '')(prevDraw()?.id ?? '')(location.query)} replace
                title="View the previous draw of the event"
            ><i class="icon2-left-arrow" /></a>
            {/* <button class="p-2 rounded-full" onClick={() => showDialog("draw")}><i class="icon2-info" /></button> */}
            <span class="inline-block min-w-[5em]">{props.draw.name}</span>
            <a class={["p-2 rounded-full inline-block hover:bg-gray-200 [&.pointer-events-none]:opacity-50",
                { "pointer-events-none": !nextDraw() }]}
                // onclick={() => selectDraw(props.event, nextDraw())}
                // disabled={!nextDraw()}
                href={Router.paths.draw(props.event.id ?? '')(nextDraw()?.id ?? '')(location.query)} replace
                title="View the next draw of the event"
            ><i class="icon2-right-arrow" /></a>
        </Show>
    </h4>
}
