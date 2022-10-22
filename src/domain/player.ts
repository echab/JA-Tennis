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
    solde?: Number;

    //Coordinates

    //Teams
    players?: Player[];  //TODO class Team extends Player

    //Availability
    comment?: string;

} & Coordinates;

export interface PlayerIn extends Box {

    seeded ?: number;

    qualifIn?: number;

    order ?: number;
}