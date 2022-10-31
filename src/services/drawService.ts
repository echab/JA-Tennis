import { byId, indexOf } from "./util/find";
import { Guid } from "./util/guid";
import { extend, isArray, isObject } from "./util/object";
import { shuffle } from "../utils/tool";
import { rank } from "./types";

import { Box, Draw, DrawType, Match, Mode, PlayerIn } from "../domain/draw";
import { TEvent } from "../domain/tournament";
import { OptionalId } from "../domain/object";
import { Command } from "./util/commandManager";
import { selection, update } from "../components/util/selection";
import { drawLib } from "./draw/drawLib";
import { Player } from "../domain/player";

const MAX_TETESERIE = 32,
  MAX_QUALIF = 32,
  QEMPTY = -1;

// modeBuild = Mode.Build;
// modePlan = Mode.Plan;
// modePlay = Mode.Play;
// modeLock = Mode.Lock;

export function updateDraws(
  event: TEvent,
  draws: OptionalId<Draw>[],
): Command {
  const draw = draws[0]; // TODO use all draws (generated round robin)
  const d = draw as Draw;
  const id = draw.id;
  if (!id) {
    draw.id = Guid.create("d");
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
  //   match.id = Guid.create("b");
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
    id: Guid.create("d"),
    name: "",
    type: DrawType.Knockout,
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
  draw.type = draw.type || DrawType.Knockout;
  draw.nbColumn = draw.nbColumn || 0;
  draw.nbOut = draw.nbOut || 0;
  draw.mode = draw.mode || Mode.Build;
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
  source?: string | Box,
  position?: number,
): T {
  const box: T = <any>{};
  if (isObject(source)) {
    extend(box, source);
    //box.id = undefined;
    //box.position= undefined;
  } else if ("string" === typeof source) { //matchFormat
    const match = box as unknown as Match;
    match.score = ""; // delete match.score
    match.matchFormat = source;
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
  return box && "undefined" !== typeof (box as Match).score;
}

/** A input player, without a score field */
export function isPlayerIn(box: Box): box is PlayerIn {
  return box && "undefined" === typeof (box as Match).score;
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
    if (!d.suite) {
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
  let i = draws.findIndex(({ id }) => id === draw.id);
  if (i === -1) {
    return [0, 0];
  }
  let iStart = i, iNext = i + 1;
  for (; iStart > 0 && draws[iStart].suite; iStart--) {
  }
  for (; iNext < draws.length && draws[iNext].suite; iNext++) {
  }
  return [iStart, iNext];
}

/** return the first and last indexes (exclusive) of the draws of the previous group. */
export function previousGroup(event: TEvent, draw: Draw): [number, number] | undefined { //getPrecedent
  const draws = event.draws;
  let i = draws.findIndex(({ id }) => id === draw.id);
  let iStart = i;
  for (; iStart > 0 && draws[iStart].suite; iStart--) {
  }
  if (iStart > 0) {
    return groupDraw(event, draws[iStart - 1]);
  }
}

/** return the first and last indexes (exclusive) of the draws of the next group. */
export function nextGroup(event: TEvent, draw: Draw): [number, number] | undefined { //getSuivant
  const draws = event.draws;
  let i = draws.findIndex(({ id }) => id === draw.id);
  if (i >= 0) {
    let iNext = i + 1;
    for (; iNext < draws.length && draws[iNext].suite; iNext++) {
    }
    if (iNext < draws.length) {
      return groupDraw(event, draws[iNext]);
    }
  }
}

//setType(BYTE iType) {
//    //ASSERT(TABLEAU_NORMAL <= iType && iType <= TABLEAU_POULE_AR);
//    if ((m_iType & TABLEAU_POULE ? 1 : 0) != (iType & TABLEAU_POULE ? 1 : 0)) {

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
  const [groupStart, groupEnd] = isArray(origin) ? origin : groupDraw(event, origin);
  for (let i = groupStart; i < groupEnd; i++) {
    const boxes = event.draws[i].boxes;
    for (let j = 0; j < boxes.length; j++) {
      const boxIn: PlayerIn = boxes[j];
      if (boxIn.seeded === iTeteSerie) {
        return [event.draws[i], boxIn];
      }
    }
  }
  return [];
}

export function groupFindQ(event: TEvent, draw: Draw, box: Box): Box | undefined {
  const qualifOut = (box as Match).qualifOut;
  const qualifIn = (box as PlayerIn).qualifIn;
  if (qualifOut !== undefined) {
    const nextGrp = nextGroup(event, draw);
    if (nextGrp) {
      const [, nextPlayerIn] = groupFindPlayerIn(event, nextGrp, qualifOut);
      return nextPlayerIn;
    }
  } else if (qualifIn !== undefined) {
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
 */
export function groupFindPlayerIn(
  event: TEvent,
  [groupStart, groupEnd]: [number, number],
  iQualifie: number,
): [Draw, PlayerIn] | [] {
  ASSERT(1 <= iQualifie && iQualifie <= MAX_QUALIF);
  //const group = isArray(group) ? group : groupDraw(event, group);
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

export function groupFindPlayerOut(
  event: TEvent,
  [groupStart, groupEnd]: [number, number],
  iQualifie: number,
): [Draw, Match] | [] {
  ASSERT(1 <= iQualifie && iQualifie <= MAX_QUALIF);
  //const group = isArray(origin) ? origin : groupDraw(event, origin);
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
    return <any>-2; //TODO
  }
  return [];
}

export function groupFindAllPlayerOut(
  event: TEvent,
  origin: Draw | [number, number],
  hideNumbers?: boolean,
): number[] { //FindAllQualifieSortant
  //Récupère les qualifiés sortants du tableau
  const group = isArray(origin) ? origin : groupDraw(event, origin);
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

/** @deprecated used only by aurelia draw-draw */
export function findAllPlayerOutBox(
  event: TEvent,
  origin: Draw | [number, number],
): Match[] { //FindAllQualifieSortantBox
  //Récupère les qualifiés sortants du tableau
  const group = isArray(origin) ? origin : groupDraw(event, origin);
  if (!group) {
    return [];
  }
  const a: Match[] = [];
  for (let i = 1; i <= MAX_QUALIF; i++) {
    const [, m] = groupFindPlayerOut(event, group, i);
    if (m) {
      a.push(m);
    }
  }
  return a;
}

export function findDrawPlayerIds(draw: Draw, withQualifIn = true): Set<string> {
  return new Set(
    (draw.boxes as PlayerIn[])
      .filter(({ playerId, qualifIn }) => playerId && (withQualifIn || !qualifIn))
      .map<string>(({ playerId }) => playerId!)
  );
}

/** list all input qualifies or players (exclusively) */
export function findDrawPlayersOrQ(draw: Draw, players: Player[]): (Player | number)[] {
  return (draw.boxes as PlayerIn[])
    .map(({ qualifIn, playerId, order }) => order
      ? qualifIn || (playerId ? byId(players, playerId) : undefined)
      : undefined)
    .filter((r): r is Player | number => !!r);
}

/**
 * Fill or erase a box with qualified in and/or player
 * setPlayerIn
 *
 * @param box
 * @param inNumber (optional)
 * @param player   (optional)
 */
// static setPlayerIn(box: PlayerIn, inNumber?: number, player?: Player): boolean {
//     // inNumber=0 => enlève qualifié
//     return _drawLibs[box._draw.type].setPlayerIn(box, inNumber, player);
// }

// static setPlayerOut(box: Match, outNumber?: number): boolean { //setPlayerOut
//     // iQualifie=0 => enlève qualifié
//     return _drawLibs[box._draw.type].setPlayerOut(box, outNumber);
// }

// static computeScore(draw: Draw): boolean {
//     return _drawLibs[draw.type].computeScore(draw);
// }

// static boxesOpponents(match: Match): { box1: Box; box2: Box } {
//     return _drawLibs[match._draw.type].boxesOpponents(match);
// }

function ASSERT(b: boolean, message?: string): void {
  if (!b) {
    debugger;
    throw new Error(message || "Assertion is false");
  }
}
