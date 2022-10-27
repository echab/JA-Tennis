import { SelectionItems, setDrawErrors, setPlayerErrors } from "../components/util/selection";
import { Box, Draw } from "../domain/draw";
import { Player } from "../domain/player";
import { TEvent, Tournament } from "../domain/tournament";
import { IError, IValidation } from "../domain/validation";
import { by } from "./util/find";

const validLibs: IValidation[] = [];

const errorsDraw: { [id: string]: IError[] } = {};
const errorsPlayer: { [id: string]: IError[] } = {};

export function addValidator(validator: IValidation): void {
  validLibs.push(validator);
}

export function validatePlayer(player: Player): boolean {
  let res = true;
  for (const lib of validLibs) {
    const fn = lib.validatePlayer;
    if (fn) {
      res = res && fn(player);
    }
  }
  setPlayerErrors(errorsPlayer);
  return res;
}

export function validateDraw(tournament: Tournament, event: TEvent, draw: Draw, players: Player[]): boolean {
  let res = true;
  for (const lib of validLibs) {
    const fn = lib.validateDraw;
    if (fn) {
      res = res && fn(tournament, event, draw, players);
    }
  }
  setDrawErrors(errorsDraw);
  return res;
}

export function errorPlayer(message: string, player: Player, detail?: string): void {
  const a: string[] = [];
  a.push("Validation error on", player.name);
  if (detail) {
    a.push("(" + detail + ")");
  }
  a.push(":", message);
  console.warn(a.join(" "));

  let c = errorsPlayer[player.id];
  if (!c) {
    c = errorsPlayer[player.id] = [];
  }
  c.push({ message, player, detail });
}

export function errorDraw(message: string, draw: Draw, box?: Box, player?: Player, detail?: string) {
  const a: string[] = [];
  a.push("Validation error on", draw.name);
  if (box && player) {
    a.push("for", player.name);
  }
  if (detail) {
    a.push("(" + detail + ")");
  }
  a.push(":", message);
  console.warn(a.join(" "));

  let c = errorsDraw[draw.id];
  if (!c) {
    c = errorsDraw[draw.id] = [];
  }
  c.push({
    message,
    player: box ? player : undefined,
    position: box ? box.position : undefined,
    detail,
  });
}

export function hasErrorDraw(draw: Draw): boolean {
  const c = draw && errorsDraw[draw.id];
  return c && c.length > 0;
}

export function hasErrorBox(box: Box, drawId: string): boolean {
  const c = box && errorsDraw[drawId];
  const e = c && by(c, "position", box.position);
  return !!e;
}

export function getErrorDraw(draw: Draw): IError[] {
  return draw && errorsDraw[draw.id];
}

export function getErrorBox(box: Box, drawId: string): IError | undefined {
  const c = box && errorsDraw[drawId];
  if (c) {
    return by(c, "position", box.position);
  }
}

export function resetPlayerErrors(player?: Player): void {
  if (player) {
    delete errorsPlayer[player.id];
  } else {
    Object.keys(errorsPlayer).forEach((id) => {
      delete errorsPlayer[id];
    });
  }
}

export function resetDrawErrors(draw?: Draw): void {
  if (draw) {
    delete errorsDraw[draw.id];
  } else {
    Object.keys(errorsDraw).forEach((id) => {
      delete errorsDraw[id];
    });
  }
}

export function resetErrors(): void {
  Object.keys(errorsDraw).forEach((id) => {
    delete errorsDraw[id];
  });
  Object.keys(errorsDraw).forEach((id) => {
    delete errorsDraw[id];
  });
}

export function errorCount({ playerErrors, drawErrors }: Pick<SelectionItems, 'playerErrors' | 'drawErrors'>): number {
  return Object.values(playerErrors ?? {}).reduce((sum, errors) => sum + errors.length, 0)
    + Object.values(drawErrors ?? {}).reduce((sum, errors) => sum + errors.length, 0);
}