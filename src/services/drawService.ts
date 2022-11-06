import { byId, indexOf } from "./util/find";
import { guid } from "./util/guid";
import { ASSERT, shuffle } from "../utils/tool";
import { rank } from "./types";

import { Box, BUILD, Draw, KNOCKOUT, Match, PlayerIn, QEMPTY } from "../domain/draw";
import { TEvent } from "../domain/tournament";
import { OptionalId } from "../domain/object";
import { Command } from "./util/commandManager";
import { selection, update } from "../components/util/selection";
import { drawLib } from "./draw/drawLib";
import { Player } from "../domain/player";
import { defined } from "./util/object";

const MAX_TETESERIE = 32,
    MAX_QUALIF = 32;

// modeBuild = BUILD;
// modePlan = PLAN;
// modePlay = Mode.Play;
// modeLock = Mode.Lock;

export function updateDraws(
    event: TEvent,
    draws: Array<OptionalId<Draw>>,
): Command {
    const draw = draws[0]; // TODO use all draws (generated round robin)
    const d = draw as Draw;
    const id = draw.id;
    if (!id) {
        draw.id = guid("d");
    }
    const i = id ? indexOf(event.draws, "id", id) : -1;
    // const prev = id ? { ...event.draws[i] } : undefined; // clone
    const prev = id ? event.draws[i] : undefined;

    const act = () => update((sel) => {
        sel.event = event;
        sel.draw = d;
        if (!id) {
            sel.event.draws.push(d);
        } else {
            sel.event.draws[i] = d;
        }
    });
    act();

    const undo = () => update((sel) => {
        sel.event = event;
        sel.draw = prev;
        if (prev) {
            sel.event.draws[i] = prev;
        } else {
            sel.event.draws.pop();
        }
    });

    return { name: `Add draw ${draw.name}`, act, undo };
}

export function updateMatch(event: TEvent, draw: Draw, match: Match): Command {
    // const id = match.id;
    // if (!id) {
    //   match.id = guid("b");
    // }
    const i = indexOf(draw.boxes, "position", match.position);
    const prev = { ...draw.boxes[i] } as Match; // clone
    const lib = drawLib(event, draw);

    const prevBoxQ = groupFindQ(event, draw, match);

    const act = () => update((sel) => {
        sel.event = event;
        sel.draw = draw;
        sel.box = sel.draw.boxes[i];
        sel.boxQ = prevBoxQ;
        if (!sel.box || !isMatch(sel.box)) {
            throw new Error("updateMatch without selected match");
        }
        sel.draw.boxes[i] = match;
        lib.putResult(sel.box, match, sel.boxQ);
    });
    act();

    const undo = () => update((sel) => {
        sel.event = event;
        sel.draw = draw;
        sel.box = sel.draw.boxes[i];
        sel.boxQ = prevBoxQ;
        if (!sel.box || !isMatch(sel.box)) {
            throw new Error("updateMatch without selected match");
        }
        lib.putResult(sel.box, prev, sel.boxQ);
    });

    return { name: `Match result ${match.position}`, act, undo }; // TODO
}

export function newDraw(parent: TEvent, source?: Draw, after?: Draw): Draw {
    const draw: Draw = {
        id: guid("d"),
        name: "",
        type: KNOCKOUT,
        nbColumn: 3,
        nbOut: 1,
        minRank: after ? rank.next(after.maxRank) : rank.first(),
        maxRank: rank.first(),
        boxes: [],
        ...source,
    };

    if (
        draw.maxRank && draw.minRank && rank.compare(draw.minRank, draw.maxRank) > 0
    ) {
        draw.maxRank = draw.minRank;
    }

    return draw;
}

export function initDraw(draw: Draw, parent: TEvent): void {
    draw.type ||= KNOCKOUT;
    draw.nbColumn ||= 0;
    draw.nbOut ||= 0;
    draw.lock ||= BUILD;
}

export function deleteDraw(drawId: string): Command {
    const event = selection.event;
    if (!event) {
        throw new Error('No selected event');
    }
    const i = indexOf(
        event.draws,
        "id",
        drawId,
        "Player to remove not found",
    );
    const prevDraw = event.draws[i];

    const act = () => update((sel) => {
        sel.event = event;
        sel.event.draws.splice(i, 1);
        sel.draw = event.draws.at(i);
    });
    act();

    const undo = () => update((sel) => {
        sel.event = event;
        sel.event.draws.splice(i, 0, prevDraw);
        sel.draw = prevDraw;
    });

    return { name: `Remove draw ${prevDraw.name}`, act, undo };
}

//newBox(parent: Draw, matchFormat?: string, position?: number): Box
//newBox(parent: Draw, source?: Box, position?: number): Box
export function newBox<T extends Box = Box>(
    parent: Draw,
    source?: number | Box,
    position?: number,
): T {
    let box = {} as T;
    if ("number" === typeof source) { //matchFormat
        const match = box as unknown as Match;
        match.score = ""; // delete match.score
        match.matchFormat = source;
    } else {
        box = {...source} as T;
        //box.id = undefined;
        //box.position= undefined;
    }
    if ("number" === typeof position) {
        box.position = position;
    }
    return box;
}

// export function validate(draw: Draw): void {
//   _validateDraw(draw);
// }

// export function generate(draw: Draw, generate?: GenerateType): void {
//   _updateDraw(draw, undefined, generate || GenerateType.Create);
// }

/** A match, with a score field */
export function isMatch(box: Box): box is Match {
    return box && (box as Match).score !== undefined;
}

/** A input player, without a score field */
export function isPlayerIn(box: Box): box is PlayerIn {
    return box && (box as Match).score !== undefined;
}

export function _updateQualif(event: TEvent, draw: Draw): void {
    const lib = drawLib(event, draw);

    //retreive qualifIn box
    const qualifs: PlayerIn[] = [];
    for (let i = draw.boxes.length - 1; i >= 0; i--) {
        const boxIn = draw.boxes[i] as PlayerIn;
        if (boxIn.qualifIn) {
            qualifs.push(boxIn);
        }
    }

    shuffle(qualifs);

    //remove old qualif numbers
    for (let i = qualifs.length - 1; i >= 0; i--) {
        lib.setPlayerIn(qualifs[i], 0);
    }

    //assign new qualif number
    for (let i = qualifs.length - 1; i >= 0; i--) {
        lib.setPlayerIn(qualifs[i], i + 1);
    }
}

// export function getPlayer(box: Box): Player {
//   return byId(box._draw._event._tournament.players, box.playerId);
// }

export function groups(event: TEvent): number[] {
    const result: number[] = [];
    event.draws.forEach((d, i) => {
        if (!d.cont) {
            result.push(i);
        }
    });
    // result.push(event.draws.length);
    return result;
}

/**
 * Return the first and last indexes (exclusive) of the draws in the same group as given draw
 * (mainly for group of round robin).
 */
export function groupDraw(event: TEvent, draw: Draw): [number, number] {
    const draws = event.draws;
    const i = draws.findIndex(({ id }) => id === draw.id);
    if (i === -1) {
        return [0, 0];
    }
    let iStart = i, iNext = i + 1;
    // eslint-disable-next-line no-empty
    for (; iStart > 0 && draws[iStart].cont; iStart--) {}
    // eslint-disable-next-line no-empty
    for (; iNext < draws.length && draws[iNext].cont; iNext++) {}
    return [iStart, iNext];
}

/** return the first and last indexes (exclusive) of the draws of the previous group. */
export function previousGroup(event: TEvent, draw: Draw): [number, number] | undefined { //getPrecedent
    const draws = event.draws;
    const i = draws.findIndex(({ id }) => id === draw.id);
    let iStart = i;
    // eslint-disable-next-line no-empty
    for (; iStart > 0 && draws[iStart].cont; iStart--) {}
    if (iStart > 0) {
        return groupDraw(event, draws[iStart - 1]);
    }
}

/** return the first and last indexes (exclusive) of the draws of the next group. */
export function nextGroup(event: TEvent, draw: Draw): [number, number] | undefined { //getSuivant
    const draws = event.draws;
    const i = draws.findIndex(({ id }) => id === draw.id);
    if (i >= 0) {
        let iNext = i + 1;
        // eslint-disable-next-line no-empty
        for (; iNext < draws.length && draws[iNext].cont; iNext++) {}
        if (iNext < draws.length) {
            return groupDraw(event, draws[iNext]);
        }
    }
}

//setType(BYTE iType) {
//    //ASSERT(TABLEAU_NORMAL <= iType && iType <= TABLEAU_POULE_AR);
//    if ((m_iType & TABLEAU_POULE ? 1 : 0) !== (iType & TABLEAU_POULE ? 1 : 0)) {

//        //Efface les boites si poule et plus poule ou l'inverse
//        for (; m_nBoite > 0; m_nBoite--) {
//            delete draw.boxes[m_nBoite - 1];
//            draw.boxes[m_nBoite - 1] = NULL;
//        }
//        m_nColonne = 0;
//        m_nQualifie = 0;
//    }

//    m_iType = iType;
//}

export function isSlot(box: Match): boolean { //isCreneau
    return isMatch(box) && (box.place !== undefined || !!box.date);
}

export function findSeeded(
    event: TEvent,
    origin: Draw | [number, number],
    iTeteSerie: number,
): [Draw, PlayerIn] | [] { //FindTeteSerie
    ASSERT(1 <= iTeteSerie && iTeteSerie <= MAX_TETESERIE);
    const [groupStart, groupEnd] = Array.isArray(origin) ? origin : groupDraw(event, origin);
    for (let i = groupStart; i < groupEnd; i++) {
        const boxes = event.draws[i].boxes;
        for (const box of boxes) {
            const boxIn: PlayerIn = box;
            if (boxIn.seeded === iTeteSerie) {
                return [event.draws[i], boxIn];
            }
        }
    }
    return [];
}

export function groupFindQ(event: TEvent, draw: Draw, box: Box): PlayerIn | Match | undefined {
    const qualifOut = (box as Match).qualifOut;
    const qualifIn = (box as PlayerIn).qualifIn;
    if (qualifOut !== undefined && qualifOut !== QEMPTY) {
        const nextGrp = nextGroup(event, draw);
        if (nextGrp) {
            const [, nextPlayerIn] = groupFindPlayerIn(event, nextGrp, qualifOut);
            return nextPlayerIn;
        }
    } else if (qualifIn !== undefined && qualifIn !== QEMPTY) {
        const prevGrp = previousGroup(event, draw);
        if (prevGrp) {
            const [, prevPlayerOut] = groupFindPlayerOut(event, prevGrp, qualifIn);
            return prevPlayerOut;
        }
    }
}

/**
 *
 * @param event
 * @param group
 * @param iQualifie
 * @returns draw and box
 * @deprecated see findGroupQualifIns
 */
export function groupFindPlayerIn(
    event: TEvent,
    [groupStart, groupEnd]: [number, number],
    iQualifie: number,
): [Draw, PlayerIn] | [] {
    ASSERT(1 <= iQualifie && iQualifie <= MAX_QUALIF);
    //const group = Array.isArray(group) ? group : groupDraw(event, group);
    for (let i = groupStart; i < groupEnd; i++) {
        const d = event.draws[i];
        const lib = drawLib(event, d);
        const playerIn = lib.findPlayerIn(iQualifie);
        if (playerIn) {
            return [d, playerIn];
        }
    }
    return [];
}

/** @deprecated see findGroupQualifOuts */
export function groupFindPlayerOut(
    event: TEvent,
    [groupStart, groupEnd]: [number, number],
    iQualifie: number,
): [Draw, Match] | [] {
    ASSERT(1 <= iQualifie && iQualifie <= MAX_QUALIF);
    //const group = Array.isArray(origin) ? origin : groupDraw(event, origin);
    for (let i = groupStart; i < groupEnd; i++) {
        const d = event.draws[i];
        const lib = drawLib(event, d);
        const boxOut = lib.findPlayerOut(iQualifie);
        if (boxOut) {
            return [d, boxOut];
        }
    }

    //Si iQualifie pas trouvé, ok si < somme des nSortant du groupe
    let outCount = 0;
    for (let i = groupStart; i < groupEnd; i++) {
        const d = event.draws[i];
        if (d.type >= 2) {
            outCount += d.nbOut;
        }
    }
    if (iQualifie <= outCount) {
        ASSERT(false);
        // return -2 as any; //TODO
    }
    return [];
}

/** @deprecated see findGroupQualifOuts */
export function groupFindAllPlayerOut(
    event: TEvent,
    origin: Draw | [number, number],
    hideNumbers?: boolean,
): number[] { //FindAllQualifieSortant
    //Récupère les qualifiés sortants du tableau
    const group = Array.isArray(origin) ? origin : groupDraw(event, origin);
    if (!group) {
        return [];
    }
    const a: number[] = [];
    for (let i = 1; i <= MAX_QUALIF; i++) {
        const [, m] = groupFindPlayerOut(event, group, i);
        if (m) {
            a.push(hideNumbers ? QEMPTY : i);
        }
    }
    return a;
}

export function findDrawPlayerIds(draw: Draw, withQualifIn = true): Set<string> {
    return new Set(
        (draw.boxes as PlayerIn[])
            .filter(({ playerId, qualifIn }) => playerId && (withQualifIn || !qualifIn))
            .map(({ playerId }) => playerId)
            .filter(defined)
    );
}

/**
 * List all input qualifies or players (exclusively)
 * @returns an array of `Player`s or qualify `number`s which could be `QEMPTY`
 */
export function findDrawPlayersOrQ(draw: Draw, players: Player[]): Array<Player | number> {
    return (draw.boxes as PlayerIn[])
        .map(({ qualifIn, playerId, order }) => order
            ? qualifIn || (playerId ? byId(players, playerId) : undefined)
            : undefined)
        .filter((q): q is Player | number => q !== undefined);
}

/**
 * List all output qualifies
 * @returns an array of [qualifNum, Draw, position]
 */
export function findGroupQualifOuts(event: TEvent, [groupStart, groupEnd]: [number, number]): Array<[number, Draw, number]> {
    const result: Array<[number, Draw, number]> = [];
    for (let i = groupStart; i < groupEnd; i++) {
        const draw = event.draws[i];
        result.push(...
        (draw.boxes as Match[])
            .filter(({qualifOut}) => qualifOut !== undefined)
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            .map<[number, Draw, number]>(({ qualifOut, position }) => [qualifOut!, draw, position])
        );
    }
    return result;
}

/**
 * List all input qualifies
 * @returns an array of [qualifNum, Draw, position]
 */
export function findGroupQualifIns(event: TEvent, [groupStart, groupEnd]: [number, number]): Array<[number, Draw, number]> {
    const result: Array<[number, Draw, number]> = [];
    for (let i = groupStart; i < groupEnd; i++) {
        const draw = event.draws[i];
        result.push(...
        (draw.boxes as PlayerIn[])
            .filter(({qualifIn}) => qualifIn !== undefined)
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            .map<[number, Draw, number]>(({ qualifIn, position }) => [qualifIn!, draw, position])
        );
    }
    return result;
}
