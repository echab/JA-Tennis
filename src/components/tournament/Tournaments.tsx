import { useNavigate } from "@solidjs/router";
import { Component, For, Show } from "solid-js";
import { openFile, saveFile } from "../../services/file/file";
import { showDialog } from "../Dialogs";
import { selectTournament, selTournament } from "../util/selection";
import { clearStoredTournaments, listStoredTournaments, restoreTournament, storeTournament } from "./TournamentsStore";
import { dateLocal } from "../../utils/date";
import type { Tournament } from "../../domain/tournament";
import { Router } from "../../router";

export const Tournaments: Component = () => {

    const navigate = useNavigate();

    const newItem = async () => {
        showDialog({
            name: "new",
            onOk(t: Tournament) {
                storeTournament(t);
                selectTournament(t);
                navigate(Router.paths({ pane: 'tournament' }));
            },
        });
    };

    const loadFile = async () => {
        const t = await openFile();
        storeTournament(t);
        selectTournament(t);
        navigate(Router.paths({ pane: 'tournament' }));
    };

    const saveTheFile = async () => {
        await saveFile(selTournament);
    };

    const clearStorage = async () => {
        clearStoredTournaments();
        navigate(Router.paths({ pane: 'tournament' }));
    };

    const selectItem = async (id: string) => {
        // move the selected tournament on top of the list
        await restoreTournament(id);
    }

    return <div class="p-2">
        <h3>Tournmanent</h3>
        <span>
            <button type="button" onClick={[showDialog, { name: "info" }]}><i class="icon2-info" /></button>
            {selTournament.info.name}
        </span>

        <div>
            <button type="button" onClick={newItem} class="p-2 rounded-full">➕New tournament</button>

            <button type="button" onClick={loadFile} class="p-2 rounded-full"><i class="icon2-open" /> Open file</button>
            <button type="button" onClick={saveTheFile} class="p-2 rounded-full"><i class="icon2-save" /> Save file</button>
            <button type="button" onClick={clearStorage} class="p-2 rounded-full">❌ Clear storage</button>
        </div>

        <h3>Last tournaments:</h3>
        <ul>
            <For each={listStoredTournaments()}>{(tournament, i) => (
                <Show when={i() > 0}>
                    <li><a href="/?pane=tournament" onClick={() => selectItem(tournament.id)}>
                        {tournament.name} ({dateLocal(tournament.date)}) #{tournament.id}
                    </a></li>
                </Show>
            )}</For>
        </ul>
    </div>
}
