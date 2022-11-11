import { Coordinates } from "./tournament";
import { CategoryId, RankString } from "./types";

export type Id = string;

export type SexeString = 'H' | 'F' | 'M';

export type Player = {

    id: Id;

    //General info
    name: string;
    firstname?: string;
    sexe: SexeString;
    birth?: Date | number;
    category?: CategoryId;
    club?: string;
    licence?: string;
    nationality?: string;
    foreign?: boolean;   //TODO FFT extent
    assimilated?: boolean;    //TODO FFT extent
    rank: RankString;
    rank2?: RankString;

    //Registrations
    registration: string[]; //TEvent ids
    solde?: number;
    soldeType?: number;
    soldeEspece?: number;
    soldeCheque?: number;

    //Coordinates

    //Teams players ids
    teamIds?: string[];

    //Availability
    avail?: number[];
    comment?: string;

} & Coordinates;

/** Team is a Player with mandatory teamIds field */
export type Team = Omit<Player, 'teamIds'> & { teamIds: string[] };
