import { Coordinates } from "./tournament";

export type Id = string;

export type SexeString = 'H' | 'F' | 'M';

export type Player = {

    id: Id;

    //General info
    name: string;
    firstname?: string;
    sexe: SexeString;
    birth?: Date;
    category?: string; // TODO? number?
    club?: string;
    licence?: string;
    nationality?: string;
    external?: boolean;   //TODO FFT extent
    assimilated?: boolean;    //TODO FFT extent
    rank: string;
    rank2?: string;

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
