import { A } from "@solidjs/router";
import { Component, For, Show } from "solid-js";
import { emptyTournament } from "../../assets/data";
import { openFile, saveFile } from "../../services/file/file";
import { showDialog } from "../Dialogs";
import { selection } from "../util/selection";
import { storeTournament, useTournaments } from "./TournamentsStore";
import { dateLocal } from "../../utils/date";
import type { Tournament } from "../../domain/tournament";

const MAX_MRU = 10;

export const Tournaments: Component = () => {

    const [tournaments, setTournaments] = useTournaments();

    const newItem = async () => {
        showDialog({
            name: "new",
            onOk(t: Tournament) {
                const tStored = storeTournament(t);
                const i = tournaments.findIndex((v) => v.id === tStored.id);
                if (i !== -1) {
                    setTournaments((ts) => ts.slice(i, MAX_MRU));
                } else {
                    setTournaments((ts) => [tStored, ...ts.slice(0, MAX_MRU)]);
                }
            },
        });
    };

    const loadFile = async () => {
        const t = await openFile();
        setTournaments((ts) => [storeTournament(t), ...ts.slice(0, MAX_MRU)]);
    };

    const saveTheFile = async () => {
        await saveFile(selection.tournament);
    };

    const clearStorage = () => {
        // localStorage.removeItem('jat');
        setTournaments([storeTournament(emptyTournament())]);
    };

    const selectItem = async (index: number) => {
        // move the selected tournament on top of the list
        setTournaments((ts) => {
            const t = ts.splice(index, 1);
            return [...t, ...ts];
        });
    }

    return <div class="p-2">
        <h3>Tournmanent</h3>
        <span>
            <button type="button" onClick={[showDialog, { name: "info" }]}><i class="icon2-info" /></button>
            {selection.tournament.info.name}
        </span>

        <div>
            <button type="button" onClick={newItem} class="p-2 rounded-full">➕New tournament</button>

            <button type="button" onClick={loadFile} class="p-2 rounded-full">💾 Open file</button>
            <button type="button" onClick={saveTheFile} class="p-2 rounded-full">💾 Save file</button>
            <button type="button" onClick={clearStorage} class="p-2 rounded-full">❌ Clear storage</button>
        </div>

        <h3>Last tournaments:</h3>
        <ul>
            <For each={tournaments}>{(tournament, i) => (
                <Show when={i() > 0}>
                    <li><A href="/tournament/" onClick={[selectItem, i()]}>
                        {tournament.name} ({dateLocal(tournament.date)}) #{tournament.id}
                    </A></li>
                </Show>
            )}</For>
        </ul>
    </div>
}
