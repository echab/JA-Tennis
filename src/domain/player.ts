import { Box } from "./draw";
import { Tournament } from "./tournament";

export type Id = string;

export interface Player {

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
    solde?: Number;

    //Coordinates
    adress1?: string;
    adress2?: string;
    zipCode?: string;
    city?: string;
    phone1?: string;
    phone2?: string;
    email?: string;

    //Teams
    players?: Player[];  //TODO class Team extends Player

    //Availability
    comment?: string;

    /** @deprecated */
    _tournament?: Tournament;
}

export interface PlayerIn extends Box {

    seeded ?: number;

    qualifIn?: number;

    order ?: number;
}