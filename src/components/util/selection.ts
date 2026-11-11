import { createStore } from "solid-js";
import type { SearchParams } from "@solidjs/router";
import type { Draw, Match, PlayerIn } from "../../domain/draw";
import type { Player } from "../../domain/player";
import type { Place, TEvent, Tournament } from "../../domain/tournament";
import type { DrawProblem, PlayerProblem } from "../../domain/validation";
import { groupFindQ, isMatch } from "../../services/drawService";
import { dayOf } from "../../services/planningService";
import { validateDraw, validatePlayer } from "../../services/validationService";
import { minutes } from "../../utils/date";
import { emptyTournament } from "../../assets/data";
import { paths } from "../../router";
import { by, byId } from "../../services/util/find";

// create a store for the tournament to use reconcile() on load
export const [selTournament, setTournament] = createStore<Tournament>(emptyTournament, null, { name: 'selTournament'});

export function setTournamentEvent(eventId: string, cb: (event: TEvent) => void) {
    setTournament((t) => {
        const evt = t.events.find((e) => e.id === eventId);
        if (evt) {
            cb(evt);
        }
    });
}

export function setTournamentDraw(eventId: string, drawId: string, cb: (draw: Draw) => void) {
    setTournament((t) => {
        const evt = t.events.find((e) => e.id === eventId);
        if (evt) {
            const draw = evt.draws.find((d) => d.id === drawId);
            if (draw) {            
                cb(draw);
            }
        }
    });
}

export function setTournamentBox(eventId: string, drawId: string, i: number, cb: (boxes: Array<PlayerIn | Match>, i: number) => void) {
    setTournament((t) => {
        const evt = t.events.find((e) => e.id === eventId);
        if (evt) {
            const draw = evt.draws.find((d) => d.id === drawId);
            if (draw) {            
                cb(draw.boxes, i);
            }
        }
    });
}

export interface SelectionItems {
    player?: Player;
    eventId?: string;
    drawId?: string;
    box?: PlayerIn | Match;
    boxQ?: PlayerIn | Match;
    day?: number;
    place?: Place;

    playerProblems: Map<string, PlayerProblem[]>;
    /** key like "drawId-eventId" */
    drawProblems: Map<string, DrawProblem[]>;
}

export const [selection, setSelection] = createStore<SelectionItems>({
    playerProblems: new Map(),
    drawProblems: new Map(),
}, { shallow: true, name: 'selectionStore' });

export function selEvent(): TEvent | undefined {
    if (!selection.eventId) {
        return undefined;
    }
    return byId(selTournament.events, selection.eventId);
}
export function selDraw(): Draw | undefined {
    if (!selection.drawId) {
        return undefined;
    }
    const evt = selEvent();
    return evt ? byId(evt.draws, selection.drawId) : undefined;
}

export function selectTournament(tournament: Tournament) {
    setTournament(() => tournament);

    setSelection((sel) => {
        sel.player = undefined;
        sel.eventId = undefined;
        sel.drawId = undefined;
        sel.box = undefined;
        sel.boxQ = undefined;
        sel.day = undefined;
        sel.place = undefined;

        sel.playerProblems = new Map(
            tournament.players.map((player) => [player.id, validatePlayer(tournament, player)] as const)
                .filter(([, err]) => err.length)
        );
        // sel.drawProblems.clear();
        sel.drawProblems = new Map(
            tournament.events.flatMap((event) => event.draws
                .map((draw) => [`${draw.id}-${event.id}`, validateDraw(tournament, event, draw)] as const)
                .filter(([, err]) => err.length)
            )
        );
    });
}

export function selectPlayer(playerId?: string): void {
    setSelection((sel) => {
        // sel.player = selTournament.players.find((p) => p.id === playerId);
        sel.player = byId(selTournament.players, playerId);
    });
}

export function selectDay(day?: number): void {
    setSelection((sel) => {
        sel.day = isFinite(day ?? NaN) ? day : undefined;
    });
}

export function selectPlace(i?: number): void {
    setSelection((sel) => {
        sel.place = selTournament.places?.[i ?? -1];
    });
}

export function selectDraw(eventId?: string, drawId?: string): void {
    setSelection((sel) => {
        const evt = byId(selTournament.events, eventId);
        sel.eventId = evt?.id;
        sel.drawId = evt ? byId(evt.draws, drawId)?.id : undefined;

        sel.box = undefined;
        sel.boxQ = undefined;
    });
}

export function selectBox(eventId?: string, drawId?: string, boxPos?: number): void {
    setSelection((sel) => {
        const evt = byId(selTournament.events, eventId);
        const drw = evt ? byId(evt.draws, drawId) : undefined; // TODO IMMUTABLE_UPDATE_IN_STORE
        sel.eventId = evt?.id;
        sel.drawId = drw?.id;

        // const drw = evt ? byId(evt.draws, drawId) : undefined;
        // if (drw && sel.draw) {
        //     reconcile(drw, null)(sel.draw);
        // } else {
        //     sel.draw = drw;
        // }
        
        // const drw = evt ? byId(evt.draws, drawId) : undefined;
        // if (sel.draw && drw) {
        //     applyChanges(sel.draw, drw);
        // } else {
        //     sel.draw = drw;
        // }

        const box = sel.box = drw ? by(drw.boxes, 'position', boxPos) : undefined;
        sel.boxQ = box && evt && drw ? groupFindQ(evt, drw, box) : undefined;
    });
}

export function isPlayerError(error: PlayerProblem | DrawProblem): error is PlayerProblem {
    return !!error.player;
}
export function isDrawError(error: PlayerProblem | DrawProblem): error is DrawProblem {
    return !!(error as DrawProblem).draw;
}

/** find a draw from id which like `idDraw-idEvent` */
export function eventDrawById(idDrawEvent: string, tournament?: Tournament): { draw: Draw, event: TEvent } | undefined {
    const [idDraw, idEvent /* , idTournament */] = idDrawEvent.split('-');
    const event = byId((tournament ?? selTournament).events, idEvent);
    const draw = event ? byId(event.draws, idDraw) : undefined;
    return draw && event ? { draw, event } : undefined;
}

export function drawById(idDraw?: string, idEvent?: string, tournament?: Tournament): { draw: Draw, event: TEvent } | undefined {
    const event = idEvent ? byId((tournament ?? selTournament).events, idEvent) : undefined;
    const draw = idDraw && event ? byId(event.draws, idDraw) : undefined;
    return draw && event ? { draw, event } : undefined;
}

/** Return the box URL, preserving current search */
export function urlBox(box: PlayerIn | Match | undefined, drawId: string, eventId: string, tournament: Tournament, query?: SearchParams, scroll?: boolean) {

    const search = box && isMatch(box) ? {
        ...query,
        day: dayOf(box.date, tournament.info),
        hour: minutes(box.date),
        place: box.place,
        playerId: box.playerId,
    } : {
        ...query,
        playerId: box?.playerId
    };

    return paths.draw(eventId)(drawId)(box?.position ?? '')(search, scroll && box?.position ? `pos${box.position}` : '');
}
