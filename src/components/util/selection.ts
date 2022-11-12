import { createStore, produce } from "solid-js/store";
import type { Draw, Match, PlayerIn } from "../../domain/draw";
import type { Player } from "../../domain/player";
import { DEFAULT_SLOT_LENGTH, Place, TEvent, Tournament } from "../../domain/tournament";
import type { DrawProblem, PlayerProblem } from "../../domain/validation";
import { groupFindQ, isMatch } from "../../services/drawService";
import { dayOf } from "../../services/planningService";
import { validateDraw, validatePlayer } from "../../services/validationService";
import { minutes } from "../../utils/date";

export interface SelectionItems {
    tournament: Tournament;
    player?: Player;
    event?: TEvent;
    draw?: Draw;
    box?: PlayerIn | Match;
    boxQ?: PlayerIn | Match;
    day?: number;
    place?: Place;

    playerProblems: Map<string,PlayerProblem[]>;
    drawProblems: Map<string, DrawProblem[]>;
}

const emptyTournament: Tournament = { version: 13, id: '', types: { name: '', versionTypes: -1 }, info: { name: '', slotLength: DEFAULT_SLOT_LENGTH }, players: [], events: [] };

export const [selection, setSelection] = createStore<SelectionItems>({
    tournament: emptyTournament,
    playerProblems: new Map(),
    drawProblems: new Map(),
});

export function selectTournament(tournament: Tournament) {
    update((sel) => {
        sel.tournament = tournament;
        sel.player = undefined;
        sel.event = undefined;
        sel.draw = undefined;
        sel.box = undefined;
        sel.boxQ = undefined;
        sel.day = undefined;
        sel.place = undefined;

        sel.playerProblems = new Map(
            tournament.players.map((player) => [player.id, validatePlayer(player)])
                .filter(([,err]) => err.length) as Iterable<[string,PlayerProblem[]]>
        );
        // sel.drawProblems.clear();
        sel.drawProblems = new Map(
            tournament.events.flatMap((event) => event.draws
                .map((draw) => [`${draw.id}-${event.id}`, validateDraw(tournament, event, draw)])
                .filter(([,err]) => err.length) as Array<[string,DrawProblem[]]>
            )
        );
    });
}

export function selectPlayer(player?: Player): void {
    update((sel) => {
        sel.player = player;
    });
}

export function selectDay(day?: number): void {
    update((sel) => {
        sel.day = isFinite(day ?? NaN) ? day : undefined;
    });
}

export function selectPlace(place?: Place): void {
    update((sel) => {
        sel.place = place;
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

export function selectBox(event: TEvent, draw: Draw, box?: PlayerIn | Match): void {
    // TODO should navigate, effect?
    update((sel) => {
        sel.event = event;
        sel.draw = draw;
        sel.box = box;
        sel.boxQ = box ? groupFindQ(event, draw, box) : undefined;
    });
}

export function selectByError(error: PlayerProblem | DrawProblem) {
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

export function isPlayerError(error: PlayerProblem | DrawProblem  ): error is PlayerProblem {
    return !!error.player;
}
export function isDrawError(error: PlayerProblem | DrawProblem  ): error is DrawProblem {
    return !!(error as DrawProblem).draw;
}

export function update(fn: (originalSelection: SelectionItems) => void) {
    setSelection(produce(fn));
}

/** find a draw from id which could be a composed like `idDraw-idEvent` */
export function drawById(idDraw: string, parent?: string | Tournament): {draw?: Draw, event?: TEvent} {
    // eslint-disable-next-line prefer-const
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
    return `/draw/${event?.id ?? ''}`.replace(/\/+$/, '');
}

export function urlDraw(draw?: Draw, event?: TEvent) {
    if (!event) {
        event = selection.event; // reactive default value
    }
    return `/draw/${event?.id ?? ''}/${draw?.id ?? ''}`.replace(/\/+$/, '');
}

// TODO could return URL and preserve current search
export function urlBox(box?: PlayerIn | Match, draw?: Draw, event?: TEvent, tournament?: Tournament, scroll?: boolean) {
    if (!tournament) {
        tournament = selection.tournament;
    }
    if (!event) {
        event = selection.event; // reactive default value
    }
    if (!draw) {
        draw = selection.draw; // reactive default value
    }

    const search = box && isMatch(box)? {
        day : dayOf(box.date, tournament.info),
        hour : minutes(box.date),
        place : box.place,
        playerId: box.playerId,
    } : {
        playerId: box?.playerId
    };

    return `/draw/${event?.id ?? ''}/${draw?.id ?? ''}/${box ? scroll ? `${box.position}#pos${box.position}` : box.position : ''}`
        .replace(/\/*$/, buildSearch(search));
}

export function urlDay(day?: number) {
    return `/planning/${day ?? ''}`.replace(/\/+$/, '');
}

/** return current searchParam string like `?day=2&player=345` if parameters are present or '' */
function buildSearch(params?: Record<string, string | number | undefined>): string {
    // const [searchParams] = useSearchParams<Searchs>();
    const searchParams = location.search;
    const search = new URLSearchParams(searchParams);
    if (params) {
        for (const [name, value] of Object.entries(params)) {
            if (value !== undefined) {
                search.set(name, String(value));
            }
        }
    }
    return search.entries().next() ? `?${search}` : '';
}
