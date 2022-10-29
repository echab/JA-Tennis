import { createStore, produce } from "solid-js/store";
import { Box, Draw } from "../../domain/draw";
import { Player } from "../../domain/player";
import { DEFAULT_SLOT_LENGTH, TEvent, Tournament } from "../../domain/tournament";
import { DrawError, PlayerError } from "../../domain/validation";
import { groupFindQ } from "../../services/drawService";
import { validateDraw, validatePlayer } from "../../services/validationService";

export interface SelectionItems {
    tournament: Tournament;
    event?: TEvent;
    draw?: Draw;
    box?: Box;
    boxQ?: Box;
    player?: Player;

    playerErrors: Map<string,PlayerError[]>;
    drawErrors: Map<string, DrawError[]>;
}

const emptyTournament: Tournament = { id: '', info: { name: '', slotLength: DEFAULT_SLOT_LENGTH }, players: [], events: [] };

export const [selection, setSelection] = createStore<SelectionItems>({
    tournament: emptyTournament,
    playerErrors: new Map(),
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

        sel.playerErrors = new Map(
            tournament.players.map((player) => [player.id, validatePlayer(player)])
            .filter(([,err]) => err.length) as Iterable<[string,PlayerError[]]>
        );
        // sel.drawErrors.clear();
        sel.drawErrors = new Map(
            tournament.events.flatMap((event) => event.draws
                .map((draw) => [`${draw.id}-${event.id}`, validateDraw(tournament, event, draw)])
                .filter(([,err]) => err.length) as Array<[string,DrawError[]]>
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
        if (draw && draw.id !== selection.draw?.id) {
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
    // TODO should navigate, effect?
    update((sel) => {
        sel.event = event;
        sel.draw = draw;
        sel.box = box;
        sel.boxQ = box ? groupFindQ(event, draw, box) : undefined;
    });
}

export function selectByError(error: PlayerError | DrawError) {
    update((sel) => {
        if (isDrawError(error)) {
            const {draw, event} = drawById(error.draw.id)
            sel.event = event;
            sel.draw = draw;
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

/** find a draw from id which could be a composed like `idDraw-idEvent` */
export function drawById(idDraw: string, parent?: string | Tournament) : {draw?:Draw, event?:TEvent} {
    let [idDraw2, idEvent2 /* , idTournament */] = idDraw.split('-');
    let tournament = selection.tournament;
    if (parent) {
        if (typeof parent === 'string') {
            idEvent2 = parent;
        } else {
            tournament = parent;
        }
    }
    const event = idEvent2 ? tournament.events.find(({id}) => id === idEvent2) : selection.event;
    const draw = idDraw2 ? event?.draws.find(({id}) => id === idDraw2) : undefined;
    return {draw, event};
}

export function urlPlayer(player?: Player) {
    return `/players/${player?.id ?? ''}`.replace(/\/+$/, '');
}

export function urlEvent(event?: TEvent) {
    return `/event/${event?.id ?? ''}`.replace(/\/+$/, '');
}

export function urlDraw(draw?: Draw, event = selection.event) {
    return `/event/${event?.id ?? ''}/${draw?.id ?? ''}`.replace(/\/+$/, '');
}

// TODO could return URL and preserve current search
export function urlBox(box?: Box, draw = selection.draw, event = selection.event) {
    return `/event/${event?.id ?? ''}/${draw?.id ?? ''}/${box ? box.position : ''}`.replace(/\/+$/, '');
}
