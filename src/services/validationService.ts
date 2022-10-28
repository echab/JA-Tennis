import { SelectionItems, update } from "../components/util/selection";
import { Draw } from "../domain/draw";
import { Player } from "../domain/player";
import { TEvent, Tournament } from "../domain/tournament";
import { DrawError, IValidation, PlayerError } from "../domain/validation";

const validLibs: IValidation[] = [];

// const [errorsDraw, setErrorsDraw] = createStore<{ [id: string]: DrawError[] }>({});
// const [errorsPlayer, setErrorsPlayer] = createStore<{ [id: string]: PlayerError[] }>({});

export function addValidator(validator: IValidation): void {
  validLibs.push(validator);
}

export function validateTournament(tournament: Tournament) {
  update((sel) => {
    tournament.players.forEach((player) => {
      const errors = validatePlayer(player);
      if (errors.length) {
        if (!sel.playerErrors) {
          sel.playerErrors = {};
        }
        sel.playerErrors[player.id] = errors;
      } else {
        if (sel.playerErrors) {
          delete sel.playerErrors[player.id];
        }
      }
    })
  
    tournament.events.forEach((event) => event.draws.forEach((draw) => {
      const errors = validateDraw(tournament, event, draw);
      if (errors.length) {
        if (!sel.drawErrors) {
          sel.drawErrors = {};
        }
        sel.drawErrors[draw.id] = errors;
      } else {
        if (sel.drawErrors) {
          delete sel.drawErrors[draw.id];
        }
      }
    }));
  
  });
}

export function validatePlayer(player: Player): PlayerError[] {
  const result: PlayerError[] = [];
  for (const lib of validLibs) {
    const fn = lib.validatePlayer;
    if (fn) {
      result.splice(-1, 0, ...fn(player));
    }
  }
  result.forEach(({ message, player, detail }) => {
    console.warn(`Validation error on ${player.name}${detail ? ` (${detail})` : ''} : ${message}`);
  });
  return result;
}

export function validateDraw(tournament: Tournament, event: TEvent, draw: Draw): DrawError[] {
  const result: DrawError[] = [];
  for (const lib of validLibs) {
    const fn = lib.validateDraw;
    if (fn) {
      result.splice(-1, 0, ...fn(tournament, event, draw));
    }
  }
  result.forEach(({ message, draw, box, player, detail }) => {
    console.warn(`Validation error on ${draw.name}${box && player ? ` for ${player.name}` : ''}${detail ? ` (${detail})` : ''} : ${message}`);
  });
  return result;
}

// export function hasErrorBox(box: Box, drawId: string): boolean {
//   const c = box && errorsDraw[drawId];
//   const e = c && by(c, "position", box.position);
//   return !!e;
// }

// export function getErrorBox(box: Box, drawId: string): DrawError | undefined {
//   const c = box && errorsDraw[drawId];
//   if (c) {
//     return by(c, "position", box.position);
//   }
// }

export function errorCount({ playerErrors, drawErrors }: Pick<SelectionItems, 'playerErrors' | 'drawErrors'>): number {
  return Object.values(playerErrors ?? {}).reduce((sum, errors) => sum + errors.length, 0)
    + Object.values(drawErrors ?? {}).reduce((sum, errors) => sum + errors.length, 0);
}