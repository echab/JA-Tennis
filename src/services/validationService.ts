import { drawById, type SelectionItems, setSelection } from "../components/util/selection";
import type { Draw } from "../domain/draw";
import type { Player } from "../domain/player";
import type { TEvent, Tournament } from "../domain/tournament";
import type { DrawProblem, IValidation, PlayerProblem } from "../domain/validation";
import { knockoutValidation } from "./draw/knockoutValidation";
import { roundrobinValidation } from "./draw/roundrobinValidation";

const validLibs: IValidation[] = [
    knockoutValidation,
    roundrobinValidation,
];

export const addValidator = (validator: IValidation) => {
    validLibs.push(validator); // TODO validLibs is undefined in tests?!?
}

export function validateTournament(tournament: Tournament) {
    setSelection((sel) => {
    // cleanup errors from deleted players
        [...sel.playerProblems.keys()].forEach((playerId) => {
            if (tournament.players.find(({id}) => id === playerId)) {
                sel.playerProblems.delete(playerId);
            }
        });

        tournament.players.forEach((player) => {
            const errors = validatePlayer(tournament, player);
            if (errors.length) {
                sel.playerProblems.set(player.id, errors);
            } else {
                sel.playerProblems.delete(player.id);
            }
        });

        // cleanup errors from deleted draws
        [...sel.drawProblems.keys()].forEach((key) => {
            const {draw} = drawById(key, tournament);
            if (!draw) {
                sel.drawProblems.delete(key);
            }
        });

        tournament.events.forEach((event) => event.draws.forEach((draw) => {
            const errors = validateDraw(tournament, event, draw);
            const key = `${draw.id}-${event.id}`;
            if (errors.length) {
                sel.drawProblems.set(key, errors);
            } else {
                sel.drawProblems.delete(key);
            }
        }));
    });
}

export function validatePlayer(tournament: Tournament, player: Player): PlayerProblem[] {
    const result: PlayerProblem[] = [];
    for (const lib of validLibs) {
        const fn = lib.validatePlayer;
        if (fn) {
            result.push(...fn(tournament, player));
        }
    }

    if (tournament._types.validation.validatePlayer) {
        result.push(...tournament._types.validation.validatePlayer(tournament, player));
    }

    result.forEach(({ message, player, detail }) => {
        console.warn(`Validation error on ${player.name}${detail ? ` (${detail})` : ''} : ${message}`);
    });
    return result;
}

export function validateDraw(tournament: Tournament, event: TEvent, draw: Draw): DrawProblem[] {
    // console.log('validate draw ', event.name, ' draw:', draw.id, draw.name);
    const result: DrawProblem[] = [];
    for (const lib of validLibs) {
        const fn = lib.validateDraw;
        if (fn) {
            result.push(...fn(tournament, event, draw));
        }
    }

    if (tournament._types.validation.validateDraw) {
        result.push(...tournament._types.validation.validateDraw(tournament, event, draw));
    }

    // result.forEach(({ message, draw, box, player, detail }) => {
    //   console.warn(`Validation error on ${draw.name}${box && player ? ` for ${player.name}` : ''}${detail ? ` (${detail})` : ''} : ${message}`);
    // });
    return result;
}

// export function hasErrorBox(box: Box, drawId: string): boolean {
//   const c = box && drawProblems[drawId];
//   const e = c && by(c, "position", box.position);
//   return !!e;
// }

// export function getErrorBox(box: Box, drawId: string): DrawError | undefined {
//   const c = box && drawProblems[drawId];
//   if (c) {
//     return by(c, "position", box.position);
//   }
// }

export function errorCount(
    { playerProblems: playerProblems, drawProblems: drawProblems }: Pick<SelectionItems, 'playerProblems' | 'drawProblems'>
): number {
    return [...playerProblems.values()].reduce((sum, errors) => sum + errors.length, 0)
    + [...drawProblems.values()].reduce((sum, errors) => sum + errors.length, 0);
}