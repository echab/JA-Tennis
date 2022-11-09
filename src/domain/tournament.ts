import type { Draw, Match, PlayerIn } from "./draw";
import type { Player, SexeString } from "./player";
import type { CategoryId, RankString } from "./types";

export interface Tournament {
    version: number; // 13

    id: string;

    info: TournamentInfo;

    types: {
        name: string; // FFT
        versionTypes: number; // 5
        data?: unknown;
    };

    players: Player[];

    events: TEvent[];

    places?: Place[];

    _url?: string;
}

export const DEFAULT_SLOT_LENGTH = 90;

export interface TournamentInfo {
    name: string;

    start?: Date;
    end?: Date;

    homologation?: string;

    club?: {
        name: string;
        ligue?: string;
    } & Coordinates,

    referee?: {
        name: string;
        licence?: string;
    } & Coordinates;

    slotLength: number; // default to 90 minutes
}

export type Coordinates = {
    adress1?: string;
    adress2?: string;
    zipCode?: string;
    city?: string;
    phone1?: string;
    phone2?: string;
    email?: string;
}

export interface TEvent {

    id: string;

    name: string;

    typeDouble?: boolean;
    sexe: SexeString;

    category: CategoryId;
    maxRank: RankString;

    consolation?: boolean;

    start?: Date;
    end?: Date;

    matchFormat?: number;    //FFT extent

    color?: string;

    draws: Draw[];
}

export type Place = {
    name: string;
    avail: number[];
}

export type Slot = {
    event: TEvent;
    draw: Draw;
    match: Match;
    player1?: PlayerIn;
    player2?: PlayerIn;
};
