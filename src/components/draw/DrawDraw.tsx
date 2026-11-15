import { type Component, Show } from "solid-js";
import { CircleLetterHIcon, DicesIcon, FileSlidersIcon, LockKeyholeIcon } from "@lucide/solid";
import { DrawBottomIcon, DrawLeftIcon, QualifInIcon } from "../misc/Icons";
import { showDialog } from "../Dialogs";
import { selTournament, setTournamentDraw } from "../util/selection";
import { commandManager } from "../../services/util/commandManager";
import { drawLib, GenerateType } from "../../services/draw/drawLib";
import { findDrawPlayersOrQ, updateDraws } from "../../services/drawService";
import { BUILD, type Draw, PLAN, PLAY, ROUNDROBIN } from "../../domain/draw";
import type { TEvent } from "../../domain/tournament";
import { DrawHeader } from "./DrawHeader";
import { DrawKnockout } from './DrawKnockout';
import { DrawRoundRobin } from './DrawRoundRobin';

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
            <div class="bg-surface/80 print:hidden">
                <button class="p-2 rounded-full" title="Edit draw information"
                    onClick={() => showDialog({ name: "draw" })}
                ><FileSlidersIcon /></button>

                <button class="p-2 rounded-full aria-selected:bg-surface-selected"
                    title={`Lock/unlock draw updates (${props.draw.lock ?? BUILD})`}
                    aria-selected={props.draw.lock === PLAN ? 'true' : 'false'}
                    onClick={lockDraw}
                ><LockKeyholeIcon /></button>

                <Show when={(props.draw.lock ?? BUILD) === BUILD}>
                    {/* eslint-disable-next-line no-bitwise */}
                    <Show when={!((props.draw.lock ?? BUILD) & PLAY)}>
                        <button class="p-2 rounded-full" title="Change the draw structure to be more progressive"
                            onClick={generateLeft}
                        ><DrawLeftIcon /></button>

                        <button class="p-2 rounded-full" title="Change the draw structure to be more direct"
                            onClick={generateDown}
                        ><DrawBottomIcon /></button>
                    </Show>

                    <button class="p-2 rounded-full" title="Shuffle the players with same rank"
                        onClick={randomize}
                    ><DicesIcon /></button>

                    <button class="p-2 rounded-full" title="Place the seeded positions"
                        // onClick={placeSeeded}
                    ><CircleLetterHIcon /></button>
                </Show>
                <button class="p-2 rounded-full" title="Place the qualified position, in or out of the draw group"
                    // onClick={placeQualifs}
                ><QualifInIcon /></button>
            </div>
        </div>
        <Show when={!!(props.draw.type & ROUNDROBIN)} fallback={ // oxlint-disable-line no-bitwise
            <DrawKnockout event={props.event} draw={props.draw} tournament={selTournament} />
            }>
            <DrawRoundRobin event={props.event} draw={props.draw} tournament={selTournament} />
        </Show>
    </div>;
};
