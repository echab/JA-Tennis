import { Box } from "./draw";
import { Coordinates } from "./tournament";

export type Id = string;

export type Player = {

    id: Id;

    //General info
    name: string;
    firstname?: string;
    sexe: 'H' | 'F' | 'M';
    birth?: Date;
    category?: string;
    club?: string;
    licence?: string;
    nationality?: string;
    external ?: boolean;   //TODO FFT extent
    assimilated ?: boolean;    //TODO FFT extent
    rank: string;
    rank2 ?: string;

    //Registrations
    registration: string[]; //TEvent ids
    solde?: number;
    soldeType?: number;
    soldeEspece?: number;
    soldeCheque?: number;

    //Coordinates

    //Teams
    teamIds?: string[];  //TODO? class Team extends Player

    //Availability
    avail?: number[];
    comment?: string;

} & Coordinates;
