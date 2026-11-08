import { type Component, createMemo, createSignal, For } from "solid-js";
import { useLocation } from "@solidjs/router";
import { validateTournament } from "../services/validationService";
import { IconSexe } from "./misc/IconSexe";
import { drawById, selection, selTournament } from "./util/selection";
import { Router } from "../router";
import { drawName } from "../services/drawService";

export const Problems: Component = () => {
    const [selectedDraw, setSelectedDraw] = createSignal(false, { name: 'pb:selectedDraw' });
    const location = useLocation();
    
    const filteredDrawProblems = createMemo(() =>
        [...selection.drawProblems.entries()]
        .filter(([edId]) => !selectedDraw() || (edId.startsWith(`${selection.draw?.id}-`)))
        .map(([eventdrawId, errors]) => ({ eventdrawId, ...drawById(eventdrawId), errors }))
    );

    return (<>
        <div class="flex justify-between items-center px-2">
            <h3>Problems</h3>
            <label><input type="checkbox"
                checked={selectedDraw()}
                onChange={({target}) => setSelectedDraw((target as HTMLInputElement).checked)}
            /> selected draw</label>
            <button onClick={() => validateTournament(selTournament)}><i class="icon2-refresh" /></button>
        </div>
        <ul>
            <For each={[...selection.playerProblems.entries()]}>{([_playerId, errors]) => (
                <For each={errors}>{({message, detail, player}) => (
                    <li class="p-2">
                        <a href={Router.paths.players(player.id)(location.query, location.hash)} replace noscroll>
                            {message}: {player.name}{detail ? ` (${detail})` : ''}
                        </a>
                    </li>
                )}</For>
            )}</For>
            {/* <For each={Object.entries(selection.drawProblems)} fallback={ */}
            <For each={filteredDrawProblems()} fallback={
                <p class="italic m-2">No problem</p>
            }>{({ eventdrawId, event, draw, errors }) => 
                <li class="p-2">
                    <h4 class="bg-slate-300 border-l-8"
                        style={{ "border-color": event?.color ?? 'transparent' }}
                    >
                        <a href={Router.paths.draw(event?.id ?? '')(draw?.id ?? '')(location.query, location.hash)} replace>
                            <IconSexe sexe={event?.sexe} double={event?.typeDouble}/>{event?.name} - {drawName(draw) || eventdrawId}
                        </a>
                    </h4>
                    <ul>
                        <For each={errors}>{({message, detail, player, box}) => (
                            <li>
                                <a href={Router.paths.draw(event?.id ?? '')(draw?.id ?? '')(box?.position ?? '')(location.query)} replace noscroll>
                                    {message}: {player ? `${player.name} ` : ''}{detail ? ` (${detail})` : ''}
                                </a>
                            </li>
                        )}</For>
                    </ul>
                </li>
            }</For>
        </ul>
    </>
    );
}