import { Box, Draw, DrawType, Match } from "../../domain/draw";
import { Player, PlayerIn } from "../../domain/player";
import { TEvent } from "../../domain/tournament";
import { Knockout } from "./knockout";
import { Roundrobin } from "./roundrobin";

export const enum GenerateType {
  None,
  Create,
  PlusEchelonne,
  PlusEnLigne,
  Mix,
}

export interface IDrawLib {
  resize(oldDraw?: Draw, nJoueur?: number): void;
  nbColumnForPlayers(nJoueur: number): number;

  generateDraw(generate: GenerateType, registeredPlayersOrQ: (Player|number)[]): Draw[];

  putPlayer(box: Box, playerId: string, bForce?: boolean): boolean;
  removePlayer(box: Box, bForce?: boolean): boolean;

  setPlayerIn(box: PlayerIn, inNumber?: number, playerId?: string): boolean; //SetQualifieEntrant
  setPlayerOut(box: Match, outNumber?: number): boolean; //SetQualifieSortant
  findPlayerIn(inNumber: number): PlayerIn | undefined; //FindQualifieEntrant
  findPlayerOut(outNumber: number): Match | undefined; //FindQualifieSortant
  computeScore(): boolean; //CalculeScore
  boxesOpponents(match: Match): { box1: Box; box2: Box };

  isJoueurNouveau(box: Box): boolean;
}

export function drawLib(event: TEvent, draw: Draw) : IDrawLib {
  // TODO cache result WeakMap
  if (draw.type === DrawType.Normal ||draw.type === DrawType.Final) {
    return new Knockout(event, draw);
  }
  return new Roundrobin(event, draw);
}
