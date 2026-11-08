import { createStore, snapshot } from "solid-js";
import { replacerPrivateField } from "./util/object";
import type { Tournament } from "../domain/tournament";
import { reviveTournament } from "./tournamentService";
import { reviverDates } from "../utils/date";
import { emptyTournament, mockTournament } from "../assets/data";
import { fromBase64, toBase64 } from "./file/buffer";

type StoredTournament = {
    name: string;
    id: string,
    date: Date;
    url?: string;
    content: string; // JSON.stringify
}

const MAX_MRU = 10;
const [storedTournaments, setStoredTournaments] = createStore<StoredTournament[]>(
    JSON.parse(localStorage.jat ?? '[]'),
    { shallow: true, name: 'tournamentsStore' }
);

export async function serializeTournament(tournament: Tournament): Promise<string> {
    const json = JSON.stringify(tournament, replacerPrivateField);
    return toBase64(json);
}

export async function deserializeTournament(data: string, url?: string): Promise<Tournament> {
    if (!data.startsWith('{')) {
        data = await fromBase64(data);
    }
    const t = await reviveTournament(JSON.parse(data, reviverDates));
    t._url = url;
    return t;
}

export function listStoredTournaments(): Array<Omit<StoredTournament, 'content'>> {
    return storedTournaments;
}

export async function clearStoredTournaments() {
    setStoredTournaments((a) => {
        a.splice(0, storedTournaments.length);
    });
    // localStorage.removeItem('jat');
    const t = await emptyTournament();
    storeTournament(t);
    return t;
}

export async function storeTournament(tournament: Tournament): Promise<StoredTournament> {
    const t = {
        name: tournament.info.name,
        id: tournament.id,
        date: new Date(Date.now()),
        url: tournament._url,
        content: await serializeTournament(tournament),
    };
    setStoredTournaments((a) => {
        const i = a.findIndex((t) => t.id === tournament.id);
        if (i === 0) {
            a[0] = t;
        } else {
            if (i !== -1) {
                a.splice(i, 1);
            }
            a.unshift(t);
            a.splice(MAX_MRU);
        }
        localStorage.jat = JSON.stringify(snapshot(a));
    });
    return t;
}

export function restoreTournament(id?: string): Promise<Tournament> {
    const i = id ? storedTournaments.findIndex((t) => t.id === id) : 0;
    const t = storedTournaments[i];
    if (!t) {
        return mockTournament();
    }
    if (i !== 0) {
        setStoredTournaments((a) => {
            if (i !== -1) {
                a.splice(i, 1);
            }
            a.unshift(t);
            a.splice(MAX_MRU);
            localStorage.jat = JSON.stringify(snapshot(a));
        });
    }
    // TODO binary/base64 instead of json
    return deserializeTournament(t.content, t.url);
}