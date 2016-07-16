import {DrawType,Mode} from './enums'
import {Player} from './player';
import { RankString,ScoreString } from './types';
import {TEvent} from './tournament';

export interface Draw {
    id: string; //new draw has no id

    name: string;

    type: DrawType;   //Normal, Final, Poule simple, Poule aller/retour

    suite?: boolean;

    minRank: RankString;
    maxRank: RankString;

    //nbEntry: number;
    nbColumn: number;
    nbOut: number;

    orientation?: number;    //Default, Portrait, Landscape

    //matches: Match[];
    boxes: Box[];

    mode?: Mode;

    _points?: IPoint[];

    //group/suite
    _previous?: Draw;
    _next?: Draw;

    _event?: TEvent;
    _refresh?: Date; //force angular refresh //TODO?
}

//export interface IDrawDimensions {
//    boxWidth: number;
//    boxHeight: number;
//    interBoxWidth: number;
//    interBoxHeight: number;
//}

export interface IPoint {
    x: number;
    y: number
}

export interface ISize {
    width: number;
    height: number;
}

export interface Match extends Box {

    //winner: number; //1 or 2 (or undefined)
    score: ScoreString;  //a match is a box with a score member
    wo?: boolean;
    qualifOut?: number;

    canceled?: boolean;
    vainqDef?: boolean; //TODO english

    //Planning
    place: string;
    date: Date;

    matchFormat: string;    //FFT extent

    note?: string;

    _player1: Player;    //TODO for planning and dialog match
    _player2: Player;
}

export interface Box {
    id: string;
    position: number;

    hidden?: boolean;
    locked?: boolean;

    playerId: string;
    _player?: Player;

    //Planning
    receive?: boolean;
    aware?: boolean;

    _draw?: Draw;
    _x?: number;
    _y?: number;
}