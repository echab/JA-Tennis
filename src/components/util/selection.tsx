import { createStore, produce } from "solid-js/store";
import { Box, Draw } from "../../domain/draw";
import { Player } from "../../domain/player";
import { DEFAULT_SLOT_LENGTH, TEvent, Tournament } from "../../domain/tournament";
import { DrawError, PlayerError } from "../../domain/validation";
import { groupFindQ } from "../../services/drawService";
import { validateDraw, validatePlayer } from "../../services/validationService";

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
    drawErrors: Map<string, DrawError[]>;
}

const emptyTournament: Tournament = { id: '', info: { name: '', slotLength: DEFAULT_SLOT_LENGTH }, players: [], events: [] };

export const [selection, setSelection] = createStore<SelectionItems>({
    tournament: emptyTournament,
    playerErrors:{},
    drawErrors: new Map(),
 });

export function selectTournament(tournament: Tournament) {
    update((sel) => {
        sel.tournament = tournament;
        sel.player = undefined;
        sel.event = undefined;
        sel.draw = undefined;
        sel.box = undefined;
        sel.boxQ = undefined;

        sel.playerErrors = Object.fromEntries(
            tournament.players.map((player) => [player.id, validatePlayer(player)])
            .filter(([_,err]) => err.length)
        );
        // sel.drawErrors.clear();
        sel.drawErrors = new Map(
            tournament.events.flatMap((event) => event.draws
                .map((draw) => [`${event.id}-${draw.id}`, validateDraw(tournament, event, draw)])
                // .filter(([_,err]) => err.length)
            )
        );
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
            sel.event = eventOfDraw(sel.tournament.events, error.draw);
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

export function eventOfDraw(events: TEvent[], draw: Draw) : TEvent | undefined {
    const drawId = draw.id;
    return events
        .find(({ draws }) => draws.find(({ id }) => id === drawId));
}

export function drawById(events: TEvent[], drawId: string) : Draw | undefined {
    for (const event of events) {
        const draw = event.draws.find(({ id }) => id === drawId);
        if (draw) {
            return draw;
        }
    }
}
