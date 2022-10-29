import { A } from "@solidjs/router";
import { Component, For } from "solid-js";
import { DrawError } from "../domain/validation";
import { validateTournament } from "../services/validationService";
import { drawById, selection, urlBox, urlDraw, urlPlayer } from "./util/selection";

export const Errors: Component = () => {
    return (<>
        <div class="flex justify-between items-center px-2">
            <h3>Errors</h3>
            <button onClick={() => validateTournament(selection.tournament)}><i class="icon2-refresh"></i></button>
        </div>
        <ul>
            <For each={[...selection.playerErrors.entries()]}>{([playerId, errors]) => (
                <For each={errors}>{({message, detail, player}) => (
                    <li class="p-2">
                        <A href={urlPlayer(player)}>
                            {message}: {player.name}{detail ? ` (${detail})` : ''}
                        </A>
                    </li>
                )}</For>
            )}</For>
            {/* <For each={Object.entries(selection.drawErrors)} fallback={ */}
            <For each={[...selection.drawErrors.entries()]} fallback={
                <div>No draw error.</div>
            }>{([eventdrawId, errors]: [string, DrawError[]]) => {
                const [draw, event] = drawById(eventdrawId);
                return (
                    <li class="p-2">
                        <h4 class="bg-slate-300 border-l-8"
                            style={{ "border-color": event?.color ?? 'transparent' }}
                        >
                            <A href={urlDraw(draw, event)}>
                                {event?.name} - {draw?.name}
                            </A>
                        </h4>
                        <ul>
                            <For each={errors}>{({message, detail, player, box}) => (
                                <li>
                                    <A href={urlBox(box, draw, event)}>
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