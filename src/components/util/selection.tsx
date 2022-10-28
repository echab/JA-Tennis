import { createStore, produce } from "solid-js/store";
import { Box, Draw } from "../../domain/draw";
import { Player } from "../../domain/player";
import { DEFAULT_SLOT_LENGTH, TEvent, Tournament } from "../../domain/tournament";
import { DrawError, PlayerError } from "../../domain/validation";
import { groupFindQ } from "../../services/drawService";

// export interface Selection extends SelectionActions {
//     selection: SelectionItems,
// };

export interface SelectionItems {
    tournament: Tournament;
    event?: TEvent;
    draw?: Draw;
    box?: Box;
    boxQ?: Box;
    player?: Player;

    playerErrors: { [playerId: string]: PlayerError[] };
    drawErrors: { [drawId: string]: DrawError[] };
}

const emptyTournament: Tournament = { id: '', info: { name: '', slotLength: DEFAULT_SLOT_LENGTH }, players: [], events: [] };

export const [selection, setSelection] = createStore<SelectionItems>({ tournament: emptyTournament, playerErrors:{}, drawErrors:{} });

export function selectTournament(tournament: Tournament) {
    update((sel) => {
        sel.tournament = tournament;
        sel.player = undefined;
        sel.event = undefined;
        sel.draw = undefined;
        sel.box = undefined;
        sel.boxQ = undefined;

        sel.playerErrors = {};
        sel.drawErrors = {};
    });
}

export function selectPlayer(player?: Player): void {
    update((sel) => {
        sel.player = player;
    });
}

export function selectEvent(event?: TEvent): void {
    update((sel) => {
        sel.event = event;
        sel.draw = undefined;
        sel.box = undefined;
        sel.boxQ = undefined;
    });
}

export function selectDraw(event?: TEvent, draw?: Draw): void {
    if (event) {
        if (draw) {
            // first unselect the previous one // TODO: should not be necessary
            update((sel) => {
                sel.event = event;
                sel.draw = undefined;
                sel.box = undefined;
                sel.boxQ = undefined;
            });
        }
    } else {
        draw = undefined;
    }
    update((sel) => {
        sel.event = event;
        sel.draw = draw;
        sel.box = undefined;
        sel.boxQ = undefined;
    });
}

export function selectBox(event: TEvent, draw: Draw, box?: Box): void {
    update((sel) => {
        sel.event = event;
        sel.draw = draw;
        sel.box = box;
        sel.boxQ = box ? groupFindQ(event, draw, box) : undefined;
    });
}

// export function setPlayerErrors(playerErrors?: Record<string, PlayerError[]>): void {
//     update((sel) => {
//         sel.playerErrors = playerErrors;
//     });
// }

// export function setDrawErrors(drawErrors?: Record<string, DrawError[]>): void {
//     update((sel) => {
//         sel.drawErrors = drawErrors;
//     });
// }

export function selectByError(error: PlayerError | DrawError) {
    update((sel) => {
        if (isDrawError(error)) {
            sel.event = sel.tournament.events.find(({ draws }) => draws.find(({ id }) => id === error.draw.id));
            sel.draw = error.draw;
            sel.box = error.box;
        }
        sel.player = error.player;
    });
}

export function isPlayerError(error: PlayerError | DrawError  ): error is PlayerError {
    return !!error.player;
}
export function isDrawError(error: PlayerError | DrawError  ): error is DrawError {
    return !!(error as DrawError).draw;
}

export function update(fn: (original: SelectionItems) => void) {
    setSelection(produce(fn));
}
