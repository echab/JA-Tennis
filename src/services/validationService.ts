import { drawById, SelectionItems, update } from "../components/util/selection";
import { Draw } from "../domain/draw";
import { Player } from "../domain/player";
import { TEvent, Tournament } from "../domain/tournament";
import { DrawError, IValidation, PlayerError } from "../domain/validation";

const validLibs: IValidation[] = [];

// const [errorsDraw, setErrorsDraw] = createStore<{ [id: string]: DrawError[] }>({});
// const [errorsPlayer, setErrorsPlayer] = createStore<{ [id: string]: PlayerError[] }>({});

export function addValidator(validator: IValidation): void {
  validLibs?.push(validator); // TODO validLibs is undefined in tests?!?
}

export function validateTournament(tournament: Tournament) {
  update((sel) => {
    // cleanup errors from deleted players
    [...sel.playerErrors.keys()].forEach((playerId) => {
      if (tournament.players.find(({id}) => id === playerId)) {
        sel.playerErrors.delete(playerId);
      }
    });

    tournament.players.forEach((player) => {
      const errors = validatePlayer(player);
      if (errors.length) {
        sel.playerErrors.set(player.id, errors);
      } else {
        sel.playerErrors.delete(player.id);
      }
    });

    // cleanup errors from deleted draws
    [...sel.drawErrors.keys()].forEach((key) => {
      const {draw} = drawById(key, tournament);
      if (!draw) {
        sel.drawErrors.delete(key);
      }
    });

    tournament.events.forEach((event) => event.draws.forEach((draw) => {
      const errors = validateDraw(tournament, event, draw);
      const key = `${draw.id}-${event.id}`;
      if (errors.length) {
        sel.drawErrors.set(key, errors);
      } else {
        sel.drawErrors.delete(key);
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
  // result.forEach(({ message, draw, box, player, detail }) => {
  //   console.warn(`Validation error on ${draw.name}${box && player ? ` for ${player.name}` : ''}${detail ? ` (${detail})` : ''} : ${message}`);
  // });
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

export function errorCount(
  { playerErrors, drawErrors }: Pick<SelectionItems, 'playerErrors' | 'drawErrors'>
): number {
  return [...playerErrors.values()].reduce((sum, errors) => sum + errors.length, 0)
    + [...drawErrors.values()].reduce((sum, errors) => sum + errors.length, 0);
}