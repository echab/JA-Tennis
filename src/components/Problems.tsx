import { A } from "@solidjs/router";
import { Component, createSignal, For, Show } from "solid-js";
import { DrawProblem } from "../domain/validation";
import { validateTournament } from "../services/validationService";
import { drawById, selection, urlBox, urlDraw, urlPlayer } from "./util/selection";

export const Problems: Component = () => {
    const [selectedDraw, setSelectedDraw] = createSignal(false);

    return (<>
        <div class="flex justify-between items-center px-2">
            <h3>Problems</h3>
            <label><input type="checkbox"
                checked={selectedDraw()}
                onChange={({target}) => setSelectedDraw((target as HTMLInputElement).checked)}
                /> selected draw</label>
            <button onClick={() => validateTournament(selection.tournament)}><i class="icon2-refresh"></i></button>
        </div>
        <ul>
            <For each={[...selection.playerProblems.entries()]}>{([playerId, errors]) => (
                <For each={errors}>{({message, detail, player}) => (
                    <li class="p-2">
                        <A href={urlPlayer(player)} replace={true}>
                            {message}: {player.name}{detail ? ` (${detail})` : ''}
                        </A>
                    </li>
                )}</For>
            )}</For>
            {/* <For each={Object.entries(selection.drawProblems)} fallback={ */}
            <For each={[...selection.drawProblems.entries()]} fallback={
                <div>No draw error.</div>
            }>{([eventdrawId, errors]: [string, DrawProblem[]]) => {
                const {draw, event} = drawById(eventdrawId);
                return (
                    <Show when={!selectedDraw() || (draw && draw?.id === selection.draw?.id)}>
                        <li class="p-2">
                            <h4 class="bg-slate-300 border-l-8"
                                style={{ "border-color": event?.color ?? 'transparent' }}
                            >
                                <A href={urlDraw(draw, event)} replace={true}>
                                    {event?.name} - {draw?.name || eventdrawId}
                                </A>
                            </h4>
                            <ul>
                                <For each={errors}>{({message, detail, player, box}) => (
                                    <li>
                                        <A href={urlBox(box, draw, event)} replace={true}>
                                            {message}: {player ? `${player.name} ` : ''}{detail ? ` (${detail})` : ''}
                                        </A>
                                    </li>
                                )}</For>
                            </ul>
                        </li>
                    </Show>
                );
            }}</For>
        </ul>
    </>
    );
}