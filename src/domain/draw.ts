import { Player } from "./player";
import { RankString, ScoreString } from "./types";

export const enum DrawType {
  Normal, // = 0
  Final, // = 1
  PouleSimple, // = 2
  PouleAR, // = 3
}
export const enum Mode {
  Build,
  Plan,
  Play,
  Lock,
}

export interface Draw {
  id: string; //new draw has no id

  name: string;

  type: DrawType; //Normal, Final, Poule simple, Poule aller/retour

  suite?: boolean;

  minRank: RankString;
  maxRank: RankString;

  //nbEntry: number;
  nbColumn: number;
  nbOut: number;

  orientation?: number; //Default, Portrait, Landscape

  //matches: Match[];
  boxes: (BoxIn | Match)[];

  mode?: Mode;

  //group/suite
  _previous?: Draw;
  _next?: Draw;

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
  place?: string;
  date?: Date;

  matchFormat?: string; //FFT extent

  note?: string;

  _player1?: Player; //TODO for planning and dialog match
  _player2?: Player;
}

export interface BoxIn extends Box {
  order?: number;
  qualifIn?: number;
  seeded?: number;
}

export interface Box {
  // id: string;
  position: number;

  hidden?: boolean;
  locked?: boolean;

  playerId?: string;

  //Planning
  receive?: boolean;
  aware?: boolean;
}