import { initEvent } from "./eventService";
import { Guid } from "./util/guid";
import { copy } from "../utils/tool";
import { shuffle } from "../utils/tool";
import { rank } from "./types";
import { Player } from "../domain/player";
import { Tournament, TournamentInfo, TEvent, DEFAULT_SLOT_LENGTH } from "../domain/tournament";
import { DAYS } from "../utils/date";
import { RankString } from "../domain/types";
import { Command } from "./util/commandManager";
import { selection, update } from "../components/util/selection";

/** This function load tournament data from an url. */
export async function load(file_url?: Blob | string): Promise<Tournament> {
  if (!file_url) {
    const data = window.localStorage["tournament"];
    if (data) {
      const tournament: Tournament = JSON.parse(data);
      initTournament(tournament);
      //this.selection.select(tournament, ModelType.Tournament);
      return tournament;
    } else {
      throw Error("nothing in storage");
    }
  } else if (typeof file_url === "string") {
    const resp = await fetch(file_url);
    if (resp.ok) {
      const tournament = await resp.json() as Tournament;
      tournament._url = file_url;
      initTournament(tournament);
      //this.selection.select(tournament, ModelType.Tournament);
      return tournament;
    } else {
        throw Error(resp.statusText);
    }
  } else { //if (file_url instanceof Blob) {
    throw Error('Not supported');
//     return new Promise((resolve, reject) => {
//       const reader = new FileReader();
//       reader.addEventListener("loadend", () => {
//         try {
//           const tournament: Tournament = JSON.parse(reader.result);
//           tournament._url = (<File> file_url).name; //TODO missing path
//           initTournament(tournament);
//           //this.selection.select(tournament, ModelType.Tournament);
//           resolve(tournament);
//         } catch (ex: any) {
//           reject(ex.message);
//         }
//       });
//       reader.addEventListener("error", () => reject(reader.error?.name));
//       reader.addEventListener("abort", () => reject("aborted"));
//       reader.readAsText(<Blob> file_url); //TODO remove cast
//     });
  }
}

export async function save(tournament: Tournament, url?: string) {
  //   if (!tournament) {
  //     tournament = selection.tournament;
  //   }

  const data = {};
  copy(tournament, data);
  if (!url) {
    //this.$log.info(JSON.stringify(data));
    window.localStorage["tournament"] = JSON.stringify(data);
    return;
  }

//   let client = new HttpClient();
//   const data = await client.post(url || tournament._url, data);
}

// =====

export function newTournament(source?: Tournament): Tournament {
  const tournament: Tournament = source ? { ...source } : {
    id: Guid.create("T"),
    info: { name: "", slotLength: DEFAULT_SLOT_LENGTH },
    players: [],
    events: [],
  };
  return initTournament(tournament);
}

export function _newInfo(source?: TournamentInfo): TournamentInfo {
  return { name: '', slotLength: DEFAULT_SLOT_LENGTH, ...source };
}

export function updateInfo(info: TournamentInfo) : Command {
  const prev = selection.tournament.info;

  const act = () => {
    update(({ tournament }) => {
      tournament.info = info;
    });
  };
  act();

  const undo = () => {
    update(({ tournament }) => {
      tournament.info = prev;
    });

  };
  return {name:'Update info', act, undo};
}

export function initTournament(tournament: Tournament): Tournament {
  if (tournament.events) {
    for (let i = tournament.events.length - 1; i >= 0; i--) {
      //tournament.events[i] = new TEvent(tournament, tournament.events[i]);
      initEvent(tournament.events[i], tournament);
    }
  }

  tournament.info = tournament.info ?? { name: "" };
  tournament.info.slotLength = tournament.info.slotLength ?? DEFAULT_SLOT_LENGTH;
  if (tournament.info.start && tournament.info.end) {
    tournament._dayCount = Math.floor(
      (tournament.info.end.getTime() - tournament.info.start.getTime()) / DAYS +
        1,
    );
  }
  return tournament;
}

export function isRegistred(event: TEvent, player: Player): boolean {
  return player.registration?.indexOf(event.id) !== -1;
//   return player.registration?.includes(event.id);
}

export function getRegistred(players: Player[], event: TEvent): Player[] {
  return players.filter((player) =>
    isRegistred(event, player)
  );
}

export function getRegisteredPlayers(allPlayers: Player[], event: TEvent, drawMinRank: RankString, drawMaxRank: RankString): Player[] { //GetJoueursInscrit
  //Récupère les joueurs inscrits
  let ppJoueur: Player[] = [], //new short[nPlayer],
    nPlayer = 0;
  for (let i = 0; i < allPlayers.length; i++) {
    const pJ = allPlayers[i];
    if (isRegistred(event, pJ)) {
      if (
        !pJ.rank ||
        rank.within(pJ.rank, drawMinRank, drawMaxRank)
      ) {
        ppJoueur.push(pJ); //no du joueur
      }
    }
  }

  return ppJoueur;
}

export function sortPlayers(players: Array<Player | number>): void {
  //Tri les joueurs par classement
  const comparePlayersByRank = (
    p1: Player | number,
    p2: Player | number,
  ): number => {
    //if numbers, p1 or p2 are PlayerIn
    const isNumber1 = "number" === typeof p1,
      isNumber2 = "number" === typeof p2;
    if (isNumber1 && isNumber2) {
      return 0;
    }
    if (isNumber1) {
      return -1;
    }
    if (isNumber2) {
      return 1;
    }
    return rank.compare((<Player> p1).rank, (<Player> p2).rank);
  };
  players.sort(comparePlayersByRank);

  //Mélange les joueurs de même classement
  for (let r0 = 0, r1 = 1; r0 < players.length; r1++) {
    if (
      r1 === players.length || comparePlayersByRank(players[r0], players[r1])
    ) {
      //nouvelle plage de classement

      //r0: premier joueur de l'intervalle
      //r1: premier joueur de l'intervalle suivant
      shuffle(players, r0, r1);

      r0 = r1;
    }
  }
}

export function isSexeCompatible(event: TEvent, sexe: string): boolean {
  return event.sexe === sexe || //sexe épreuve = sexe joueur
    (event.sexe === "M" && !event.typeDouble); //ou simple mixte
}
