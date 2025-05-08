import { createContext, ParentComponent, useContext } from "solid-js";
import { SetStoreFunction } from "solid-js/store";
import { createLocalStore } from "../../services/util/localStore";
import { replacerPrivateField } from "../../services/util/object";
import type { Tournament } from "../../domain/tournament";
import { reviveTournament } from "../../services/tournamentService";
import { reviverDates } from "../../utils/date";
import { mockTournament } from "../../assets/data";

// TODO store tournaments as binary, to avoid deep reactivity, and initTournament on load
type StoredTournament = {
    name: string;
    date: Date;
    content: string; // JSON.stringify
}

const context = createContext<[StoredTournament[], SetStoreFunction<StoredTournament[]>]>(
    [[], () => {}], // no-op store
);

// const mockEntry = storeTournament(mockTournament);

export const TournamentsProvider: ParentComponent = (props) => {
    /** Store of tournaments */
    const tournamentsStore = createLocalStore<StoredTournament[]>("jat", [storeTournament(mockTournament)]);

    return (
        <context.Provider value={tournamentsStore}>
            {props.children}
        </context.Provider>
    );
}

export function useTournaments() {
    return useContext(context);
}

export function serializeTournament(tournament: Tournament) {
    // TODO binary/base64 instead of json
    return JSON.stringify(tournament, replacerPrivateField);
}

export function deserializeTournament(data: string): Promise<Tournament> {
    // TODO binary/base64 instead of json
    return reviveTournament(JSON.parse(data, reviverDates));
}

export function storeTournament(tournament: Tournament): StoredTournament {
    return {
        name: tournament.info.name,
        date: new Date(Date.now()),
        content: serializeTournament(tournament),
    };
}

export function restoreTournament(storedTournament: StoredTournament): Promise<Tournament> {
    // TODO binary/base64 instead of json
    return deserializeTournament(storedTournament.content);
}