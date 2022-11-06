import { initEvent } from "./eventService";
import { Guid } from "./util/guid";
import { copy } from "../utils/tool";
import { shuffle } from "../utils/tool";
import { rank } from "./types";
import type { Player } from "../domain/player";
import { Tournament, TournamentInfo, TEvent, DEFAULT_SLOT_LENGTH } from "../domain/tournament";
import type { RankString } from "../domain/types";
import type { Command } from "./util/commandManager";
import { selection, update } from "../components/util/selection";

/** This function load tournament data from an url. */
export async function load(file_url?: Blob | string): Promise<Tournament> {
    if (!file_url) {
        const data = window.localStorage.tournament;
        if (data) {
            const tournament: Tournament = JSON.parse(data);
            initTournament(tournament);
            //this.selection.select(tournament, ModelType.Tournament);
            return tournament;
        } else {
            throw new Error("nothing in storage");
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
            throw new Error(resp.statusText);
        }
    } else { //if (file_url instanceof Blob) {
        throw new Error('Not supported');
        //     return new Promise((resolve, reject) => {
        //       const reader = new FileReader();
        //       reader.addEventListener("loadend", () => {
        //         try {
        //           const tournament: Tournament = JSON.parse(reader.result);
        //           tournament._url = (file_url as File).name; //TODO missing path
        //           initTournament(tournament);
        //           //this.selection.select(tournament, ModelType.Tournament);
        //           resolve(tournament);
        //         } catch (ex: any) {
        //           reject(ex.message);
        //         }
        //       });
        //       reader.addEventListener("error", () => reject(reader.error?.name));
        //       reader.addEventListener("abort", () => reject("aborted"));
        //       reader.readAsText(file_url as Blob); //TODO remove cast
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
        window.localStorage.tournament = JSON.stringify(data);
        return;
    }

//   let client = new HttpClient();
//   const data = await client.post(url || tournament._url, data);
}

// =====

export function newTournament(source?: Tournament): Tournament {
    const tournament: Tournament = source ? { ...source } : {
        version: 13,
        id: Guid.create("T"),
        types: { name: 'FFT', versionTypes: 5 },
        info: { name: "", slotLength: DEFAULT_SLOT_LENGTH },
        players: [],
        events: [],
    };
    return initTournament(tournament);
}

export function _newInfo(source?: TournamentInfo): TournamentInfo {
    return { name: '', slotLength: DEFAULT_SLOT_LENGTH, ...source };
}

export function updateInfo(info: TournamentInfo): Command {
    const prev = {...selection.tournament.info};

    const act = () => update((sel) => {
        sel.tournament.info = info;
    });
    act();

    const undo = () => update((sel) => {
        sel.tournament.info = prev;
    });

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

    return tournament;
}

export function isRegistred(event: TEvent, player: Player): boolean {
    return player.registration.indexOf(event.id) !== -1;
//   return player.registration?.includes(event.id);
}

export function getRegistred(players: Player[], event: TEvent): Player[] {
    return players.filter((player) =>
        isRegistred(event, player)
    );
}

export function getRegisteredPlayers(allPlayers: Player[], event: TEvent, drawMinRank: RankString, drawMaxRank: RankString): Player[] { //GetJoueursInscrit
    //Récupère les joueurs inscrits
    return allPlayers.filter((player) =>
        isRegistred(event, player)
    && (!player.rank || rank.within(player.rank, drawMinRank, drawMaxRank))
    );
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
        return rank.compare((p1 as Player).rank, (p2 as Player).rank);
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

export function ranksName(minRank: RankString, maxRank: RankString): string {
    return minRank === maxRank ? minRank : `${minRank} - ${maxRank}`;
}