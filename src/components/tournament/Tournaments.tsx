import { A } from "@solidjs/router";
import { Component, For } from "solid-js";
import { newTournament } from "../../services/tournamentService";
import { showDialog } from "../Dialogs";
import { selection, selectTournament } from "../util/selection";
import { useTournaments } from "./TournamentsStore";

export const Tournaments: Component = () => {

  const [tournaments, setTournaments] = useTournaments();

  const newItem = () => {
    // TODO select new tournament only on dialog OK
    const t = newTournament();
    setTournaments((ts) => [t, ...ts]);
    selectTournament(t);
    showDialog("info");
  };

  const selectItem = (index: number) => {
    // TODO move to the top of the list
    selectTournament(tournaments[index]);
  }

  return <div class="p-2">
    <h3>Tournmanent</h3>
    <span>
      <button type="button" onclick={[showDialog, "info"]}><i class="icon2-info"></i></button>
      {selection.tournament.info.name}
    </span>

    <div>
      <button type="button" onClick={newItem} class="p-2 rounded-full">➕New tournament</button>
    </div>

    {/* TODO New, Recent, Load, Save, etc... */}

    <h3>Last tournaments:</h3>
    <ul>
      <For each={tournaments}>{(tournament, i) => (
        <li>
          <A href="" onClick={[selectItem, i()]}>
            {tournament.info.name}
          </A></li>
      )}</For>
    </ul>
  </div>
}
