import { Box, Draw, DrawType, Match, PlayerIn } from "../../domain/draw";
import type { Player } from "../../domain/player";
import type { TEvent } from "../../domain/tournament";
import { addValidator } from "../validationService";
import { DrawLibBase } from "./drawLibBase";
import { Knockout } from "./knockout";
import { knockoutValidation } from "./knockoutValidation";
import { Roundrobin } from "./roundrobin";
import { roundrobinValidation } from "./roundrobinValidation";

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

  setPlayerIn(box: PlayerIn, inNumber?: number, playerId?: string): boolean; //SetQualifieEntrant
  setPlayerOut(box: Match, outNumber?: number): boolean; //SetQualifieSortant
  findPlayerIn(inNumber: number): PlayerIn | undefined; //FindQualifieEntrant
  findPlayerOut(outNumber: number): Match | undefined; //FindQualifieSortant
  computeScore(): boolean; //CalculeScore
  boxesOpponents(match: Match): { box1: Box; box2: Box };

  isNewPlayer(box: Box): boolean;
}

export function drawLib(event: TEvent, draw: Draw) : IDrawLib & DrawLibBase {
  // TODO cache result WeakMap
  if (draw.type === DrawType.Knockout ||draw.type === DrawType.Final) {
    return new Knockout(event, draw);
  }
  return new Roundrobin(event, draw);
}

addValidator(knockoutValidation);
addValidator(roundrobinValidation);
