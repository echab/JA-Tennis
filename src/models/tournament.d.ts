import {Player} from './player'
import {Draw, Match} from './draw';
import { CategoryString,RankString } from './types';

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

export interface TournamentInfo {
    name: string;

    start?: Date;
    end?: Date;

    slotLength?: number;
}

export interface TEvent {

    id: string;

    name: string;

    typeDouble ?: boolean;
    sexe: string;

    category: CategoryString;
    maxRank: RankString;

    consolation ?: boolean;

    start?: Date;
    end?: Date;

    matchFormat ?: string;    //FFT extent

    color ?: string;

    draws: Draw[];

    _tournament ?: Tournament;
}