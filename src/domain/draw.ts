import type { Player } from "./player";
import type { RankString, ScoreString } from "./types";

export const KNOCKOUT = 0, FINAL = 1, ROUNDROBIN = 2, ROUNDROBIN_RETURN = 3;
export type DrawType = typeof KNOCKOUT | typeof FINAL | typeof ROUNDROBIN | typeof ROUNDROBIN_RETURN;

export const BUILD = 0, PLAN = 1, PLAY = 2, LOCK = 3;
export type Mode = typeof BUILD | typeof PLAN | typeof PLAY | typeof LOCK;

export interface Draw {
    id: string; //new draw has no id

    name: string;

    type: DrawType; //Normal, Final, Poule simple, Poule aller/retour

    cont?: boolean;

    minRank: RankString;
    maxRank: RankString;

    //nbEntry: number;
    nbColumn: number;
    nbOut: number;

    formatMatch?: number;

    orientation?: number; //Default, Portrait, Landscape

    //matches: Match[];
    boxes: Array<PlayerIn | Match>;

    lock?: Mode;

    //_refresh?: Date; //force refresh //TODO?
}

//export interface IDrawDimensions {
//    boxWidth: number;
//    boxHeight: number;
//    interBoxWidth: number;
//    interBoxHeight: number;
//}

export interface Match extends Box {
    //winner: number; //1 or 2 (or undefined)
    score: ScoreString; //a match is a box with a score member
    wo?: boolean;
    qualifOut?: number;

    canceled?: boolean;
    vainqDef?: boolean; //TODO english

    //Planning
    place?: number;
    date?: Date;

    matchFormat?: string; //FFT extent

    note?: string;

    _player1?: Player; //TODO for planning and dialog match
    _player2?: Player; //TODO PlayerIn to get Q and playerId
}

export interface PlayerIn extends Box {
    order?: number; // 0 or undefined:not computed,  >0: first appearance, 	<0: next appearances
    qualifIn?: number;
    seeded?: number;
}

export const QEMPTY = 0;

export interface Box {
    // id: string;
    position: number;

    hidden?: boolean;
    locked?: boolean;

    playerId?: string;

    //Planning
    receive?: boolean;  // TODO move into Match as receive1, receive1, aware1, aware2 (for compatibility with roundrobin)
    aware?: boolean;
}
