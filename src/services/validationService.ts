import { Box, Draw } from "../domain/draw";
import { Player } from "../domain/player";
import { TEvent, Tournament } from "../domain/tournament";
import { IError, IValidation } from "../domain/validation";
import { by } from "./util/find";

export class ValidationService implements IValidation {
  _validLibs: IValidation[] = [];

  _errorsDraw: { [id: string]: IError[] } = {};
  _errorsPlayer: { [id: string]: IError[] } = {};

  constructor() {
  }

  addValidator(validator: IValidation): void {
    this._validLibs.push(validator);
  }

  /** @override */
  validatePlayer(player: Player): boolean {
    var res = true;
    for (var i = 0; i < this._validLibs.length; i++) {
      res = res && this._validLibs[i].validatePlayer(player);
    }
    return res;
  }

  /** @override */
  validateDraw(tournament: Tournament, event: TEvent, draw: Draw, players: Player[]): boolean {
    var res = true;
    for (var i = 0; i < this._validLibs.length; i++) {
      res = res && this._validLibs[i].validateDraw(tournament, event, draw, players);
    }
    return res;
  }

  errorPlayer(message: string, player: Player, detail?: string): void {
    var a: string[] = [];
    a.push("Validation error on", player.name);
    if (detail) {
      a.push("(" + detail + ")");
    }
    a.push(":", message);
    console.warn(a.join(" "));

    var c = this._errorsPlayer[player.id];
    if (!c) {
      c = this._errorsPlayer[player.id] = [];
    }
    c.push({ message: message, player: player, detail: detail });
  }

  errorDraw(message: string, draw: Draw, box?: Box, player?: Player, detail?: string) {
    var a: string[] = [];
    a.push("Validation error on", draw.name);
    if (box && player) {
      a.push("for", player.name);
    }
    if (detail) {
      a.push("(" + detail + ")");
    }
    a.push(":", message);
    console.warn(a.join(" "));

    var c = this._errorsDraw[draw.id];
    if (!c) {
      c = this._errorsDraw[draw.id] = [];
    }
    c.push({
      message: message,
      player: box ? player : undefined,
      position: box ? box.position : undefined,
      detail: detail,
    });
  }

  hasErrorDraw(draw: Draw): boolean {
    var c = draw && this._errorsDraw[draw.id];
    return c && c.length > 0;
  }

  hasErrorBox(box: Box, drawId: string): boolean {
    const c = box && this._errorsDraw[drawId];
    const e = c && by(c, "position", box.position);
    return !!e;
  }

  getErrorDraw(draw: Draw): IError[] {
    return draw && this._errorsDraw[draw.id];
  }

  getErrorBox(box: Box, drawId: string): IError | undefined {
    var c = box && this._errorsDraw[drawId];
    if (c) {
      return by(c, "position", box.position);
    }
  }

  resetPlayer(player: Player): void {
    if (player) {
      delete this._errorsPlayer[player.id];
    } else {
      this._errorsPlayer = {};
    }
  }

  resetDraw(draw: Draw): void {
    if (draw) {
      delete this._errorsDraw[draw.id];
    } else {
      this._errorsDraw = {};
    }
  }
}
