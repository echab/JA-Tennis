import { type Component, For } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { openFile, saveFile } from "../../services/file/file";
import { showDialog } from "../Dialogs";
import { selectTournament, selTournament } from "../util/selection";
import { clearStoredTournaments, listStoredTournaments, restoreTournament, storeTournament } from "../../services/tournamentsStore";
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
        const t = await clearStoredTournaments();
        selectTournament(t);
        navigate(Router.paths({ pane: 'tournament' }));
    };

    const selectItem = async (id: string) => {
        // move the selected tournament on top of the list
        const t = await restoreTournament(id)
        selectTournament(t);
    }

    return <div class="p-2">
        <div class="flex items-baseline justify-between">
            <h3>Tournmanent</h3>
            <button type="button" onClick={newItem} class="p-2 rounded-full">➕New tournament</button>

            <button type="button" onClick={loadFile} class="p-2 rounded-full"><i class="icon2-open" /> Open file</button>
            <button type="button" onClick={saveTheFile} class="p-2 rounded-full"><i class="icon2-save" /> Save file</button>
        </div>
        <div>
            <button type="button" onClick={() => showDialog({ name: "info" })}><i class="icon2-info" /></button>
            {selTournament.info.name} - {selTournament._url}
        </div>

        <div class="flex gap-4 items-baseline justify-between">
            <h2>Last tournaments:</h2>
            <button type="button" onClick={clearStorage} class="p-2 rounded-full">❌ Clear storage</button>
        </div>
        <ul>
            <For each={listStoredTournaments().slice(1)} keyed={(t) => t.id}>{(tournament) => (
                <li>
                    <button type="button" onClick={() => selectItem(tournament().id)}>
                        {tournament().name} ({dateLocal(tournament().date)}) {tournament().url} #{tournament().id}
                    </button>
                </li>
            )}</For>
        </ul>
    </div>
}
