import { Draw, Match } from "./draw";
import { Player } from "./player";
import { CategoryString, RankString } from "./types";

export interface Tournament {

    id: string;

    info: TournamentInfo;

    players: Player[];

    events: TEvent[];

    places?: string[];

    _url?: string;

    _dayCount?: number;
    _day?: Match[][]; //list of matches by day
}

export const DEFAULT_SLOT_LENGTH = 90;

export interface TournamentInfo {
    name: string;

    start?: Date;
    end?: Date;

    slotLength: number; // default to 90 minutes
}

export interface TEvent {

    id: string;

    name: string;

    typeDouble ?: boolean;
    sexe: 'H' | 'F' | 'M';

    category: CategoryString;
    maxRank: RankString;

    consolation ?: boolean;

    start?: Date;
    end?: Date;

    matchFormat ?: string;    //FFT extent

    color ?: string;

    draws: Draw[];

    // _tournament?: Tournament;
}