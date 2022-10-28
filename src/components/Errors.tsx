import { A } from "@solidjs/router";
import { Component, For } from "solid-js";
import { DrawError } from "../domain/validation";
import { validateTournament } from "../services/validationService";
import { selectBox, selection } from "./util/selection";

export const Errors: Component = () => {
    return (<>
        <div class="flex justify-between items-center px-2">
            <h3>Errors</h3>
            <button onClick={() => validateTournament(selection.tournament)}><i class="icon2-refresh"></i></button>
        </div>
        <ul>
            <For each={Object.entries(selection.playerErrors)}>{([playerId, errors]) => (
                <For each={errors}>{({message, detail, player}) => (
                    <li class="p-2">
                        <A href={`/player/${player.id}`}>
                            {message}: {player.name}{detail ? ` (${detail})` : ''}
                        </A>
                    </li>
                )}</For>
            )}</For>
            {/* <For each={Object.entries(selection.drawErrors)} fallback={ */}
            <For each={[...selection.drawErrors.entries()]} fallback={
                <div>No draw error.</div>
            }>{([eventdrawId, errors]: [string, DrawError[]]) => {
                const [eventId, drawId] = eventdrawId.split('-');
                const event = selection.tournament.events.find(({id}) => id === eventId);
                const draw = event?.draws.find(({id}) => id === drawId);
                return (
                    <li class="p-2">
                        <h4 class="bg-slate-300 border-l-8"
                            style={{ "border-color": event?.color ?? 'transparent' }}
                        >
                            <A href={event && draw ? `/event/${event.id}/${draw.id}` : ''}>
                                {event?.name} - {draw?.name}
                            </A>
                        </h4>
                        <ul>
                            <For each={errors}>{({message, detail, player, box}) => (
                                <li title={`player: ${player?.name} position: ${box?.position}`}
                                    onClick={() => event && draw && selectBox(event, draw, box)}
                                >
                                    <A href={event && draw ? `/event/${event.id}/${draw.id}/${box?.position ?? ''}` : ''}>
                                        {message}: {player ? `${player.name} ` : ''}{detail ? ` (${detail})` : ''}
                                    </A>
                                </li>
                            )}</For>
                        </ul>
                    </li>
                );
            }}</For>
        </ul>
    </>
    );
}