import { A, useLocation, useNavigate } from "@solidjs/router";
import { Component, For, Show } from "solid-js";
import { mockTournament } from "../../assets/data";
import { openFile, saveFile } from "../../services/file/file";
import { newTournament } from "../../services/tournamentService";
import { showDialog } from "../Dialogs";
import { selection, selectTournament } from "../util/selection";
import { useTournaments } from "./TournamentsStore";

const MAX_MRU = 10;

export const Tournaments: Component = () => {

    const [tournaments, setTournaments] = useTournaments();

    const newItem = () => {
    // TODO select new tournament only on dialog OK
        const t = newTournament();
        setTournaments((ts) => [t, ...ts.slice(0,MAX_MRU)]);
        selectTournament(t);
        showDialog("info");
    };

    const loadFile = async () => {
        const t = await openFile();
        setTournaments((ts) => [t, ...ts.slice(0,MAX_MRU)]);
        selectTournament(t);
    };

    const saveTheFile = async () => {
        await saveFile(selection.tournament);
    };

    const clearStorage = () => {
        localStorage.removeItem('jat');
        setTournaments([mockTournament]);
    };

    const selectItem = (index: number) => {
    // move the selected tournament on top of the list
        setTournaments((ts) => {
            const t = ts.splice(index, 1);
            return [...t, ...ts];
        });
        selectTournament(tournaments[0]);
    }

    return <div class="p-2">
        <h3>Tournmanent</h3>
        <span>
            <button type="button" onclick={[showDialog, "info"]}><i class="icon2-info" /></button>
            {selection.tournament.info.name}
        </span>

        <div>
            <button type="button" onClick={newItem} class="p-2 rounded-full">➕New tournament</button>

            <button type="button" onClick={loadFile} class="p-2 rounded-full">💾 Open file</button>
            <button type="button" onClick={saveTheFile} class="p-2 rounded-full">💾 Save file</button>
            <button type="button" onClick={clearStorage} class="p-2 rounded-full">❌ Clear storage</button>
        </div>

        {/* TODO New, Recent, Load, Save, etc... */}

        <h3>Last tournaments:</h3>
        <ul>
            <For each={tournaments}>{(tournament, i) => (
                <Show when={i() > 0}>
                    <li><A href="" onClick={[selectItem, i()]}>
                        {tournament.info.name}
                    </A></li>
                </Show>
            )}</For>
        </ul>
    </div>
}
