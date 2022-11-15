import type { RankString, ScoreString } from "./types";

export const KNOCKOUT = 0, FINAL = 1, ROUNDROBIN = 2, ROUNDROBIN_RETURN = 3;
export type DrawType = typeof KNOCKOUT | typeof FINAL | typeof ROUNDROBIN | typeof ROUNDROBIN_RETURN;

export const BUILD = 0, PLAN = 1, PLAY = 2, LOCK = 3;
export type Mode = typeof BUILD | typeof PLAN | typeof PLAY | typeof LOCK;

export const QEMPTY = -1;

export interface Draw {
    id: string; //new draw has no id

    name: string;

    type: DrawType; //Normal, Final, Poule simple, Poule aller/retour

    /** is continuing previous draw, ie in same group */
    cont?: boolean;

    minRank: RankString;
    maxRank: RankString;

    //nbEntry: number;
    nbColumn: number;
    nbOut: number;

    formatMatch?: number;

    orientation?: number; //Default, Portrait, Landscape

    boxes: Array<PlayerIn | Match>;

    lock?: Mode;

    //_refresh?: Date; //force refresh //TODO?
}

export interface Match extends Box {
    //winner: number; //1 or 2 (or undefined)

    /** a match is a box with a score member, could be empty string '' */
    score: ScoreString;

    wo?: boolean;

    /** undefined or QEMPTY === -1 or 1..n */
    qualifOut?: number;

    canceled?: boolean; // TODO english: gives up
    vainqDef?: boolean; //TODO english: Defaulting winner

    matchFormat?: number; //FFT extent

    //Planning
    place?: number;
    date?: Date;

    /** is player2 receiving? */
    receive?: 0 | 1;

    /** is player1 aware? (0=no, 1=voice message, 2=yes) */
    aware1?: 0 | 1 | 2;

    /** is player2 aware? (0=no, 1=voice message, 2=yes) */
    aware2?: 0 | 1 | 2;

    note?: string;
}

export interface PlayerIn extends Box {
    /** 0 or undefined:not computed,  >0: first appearance, 	<0: next appearances */
    order?: number;

    /** undefined or QEMPTY === -1 or 1..n */
    qualifIn?: number;

    /** undefined or 1..n */
    seeded?: number;
}

export interface Box {
    position: number;

    hidden?: boolean; // TODO hidden Box should be deleted
    locked?: boolean;

    playerId?: string;
}
