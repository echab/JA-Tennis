import { replacerPrivateField } from "../../services/util/object";
import type { Tournament } from "../../domain/tournament";
import { reviveTournament } from "../../services/tournamentService";
import { reviverDates } from "../../utils/date";
import { emptyTournament, mockTournament } from "../../assets/data";

// TODO store tournaments as binary, to avoid deep reactivity, and initTournament on load
type StoredTournament = {
    name: string;
    id: string,
    date: Date;
    content: string; // JSON.stringify
}

const MAX_MRU = 10;
const _storedTournaments: StoredTournament[] = JSON.parse(localStorage.jat ?? '[]');

export function serializeTournament(tournament: Tournament) {
    // TODO binary/base64 instead of json
    return JSON.stringify(tournament, replacerPrivateField);
}

export function deserializeTournament(data: string): Promise<Tournament> {
    // TODO binary/base64 instead of json
    return reviveTournament(JSON.parse(data, reviverDates));
}

export function listStoredTournaments() {
    return _storedTournaments.map(({ name, id, date }) => ({ name, id, date }));
}

export async function clearStoredTournaments() {
    _storedTournaments.splice(0, _storedTournaments.length);
    // localStorage.removeItem('jat');
    storeTournament(await emptyTournament());
}

export function storeTournament(tournament: Tournament): StoredTournament {
    const i = _storedTournaments.findIndex((t) => t.id === tournament.id);
    const t = {
        name: tournament.info.name,
        id: tournament.id,
        date: new Date(Date.now()),
        content: serializeTournament(tournament),
    };
    if (i !== -1) {
        _storedTournaments.splice(i, 1);
    }
    _storedTournaments.unshift(t);
    _storedTournaments.splice(MAX_MRU);
    localStorage.jat = JSON.stringify(_storedTournaments);
    return t;
}

export function restoreTournament(id?: string): Promise<Tournament> {
    const t = _storedTournaments.find((t) => t.id === id);
    // TODO binary/base64 instead of json
    return t ? deserializeTournament(t.content) : mockTournament();
}