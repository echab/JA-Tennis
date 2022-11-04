import { createContext, ParentComponent, useContext } from "solid-js";
import { SetStoreFunction } from "solid-js/store";
import { mockTournament } from "../../assets/data";
import { Tournament } from "../../domain/tournament";
import { createLocalStore } from "../../services/util/localStore";
import { reviver } from "../../utils/date";

// TODO store tournaments as binary, to avoid deep reactivity, and initTournament on load
// type StoredTournament = {
//     name: string;
//     date: Date;
//     content: string; // JSON.stringify
// }

const context = createContext<[Tournament[], SetStoreFunction<Tournament[]>]>(
    [[], () => {}], // no-op store
);

// TODO replace initTournament by a reviver

function replacer<T>(key: string, value: T): T | undefined {
    if (key.startsWith('_')) {
        return undefined;
    }
    return value;
}

export const TournamentsProvider: ParentComponent = (props) => {
    /** Store of tournaments */
    const tournamentsStore = createLocalStore<Tournament[]>("jat", [mockTournament], { reviver, replacer });

    return (
        <context.Provider value={tournamentsStore}>
            {props.children}
        </context.Provider>
    );
}

export function useTournaments() {
    return useContext(context);
}
