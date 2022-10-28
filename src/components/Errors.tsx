import { Component, For } from "solid-js";
import { validateTournament } from "../services/validationService";
import { selection } from "./util/selection";

export const Errors: Component = () => {
    return (<>
        <div class="flex justify-between items-center px-2">
            <h3>Errors</h3>
            <button onClick={() => validateTournament(selection.tournament)}><i class="icon2-refresh"></i></button>
        </div>
        <ul>
            <For each={Object.entries(selection.playerErrors ?? {})}>{([id, errors]) => (
                <li>
                    <div>{id}</div>
                    <ul>
                        <For each={errors}>{({message, detail, player}) => (
                            <li title={`player: ${player?.name}`}>
                                {message}: {detail}
                            </li>
                        )}</For>
                    </ul>
                </li>
            )}</For>
            <For each={Object.entries(selection.drawErrors ?? {})} fallback={
                <div>No draw error.</div>
            }>{([id, errors]) => (
                <li>
                    <div>{id}</div>
                    <ul>
                        <For each={errors}>{({message, detail, player, box}) => (
                            <li title={`player: ${player?.name} position: ${box?.position}`}>
                                {message}: {player ? `${player.name} ` : ''}{detail}
                            </li>
                        )}</For>
                    </ul>
                </li>
            )}</For>
        </ul>
    </>
    );
}