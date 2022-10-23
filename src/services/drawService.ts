import { indexOf } from "./util/find";
import { Guid } from "./util/guid";
import { extend, isArray, isObject } from "./util/object";
import { shuffle } from "../utils/tool";
import { rank } from "./types";

import { Box, Draw, DrawType, Match, Mode, PlayerIn } from "../domain/draw";
import { TEvent } from "../domain/tournament";
import { OptionalId } from "../domain/object";
import { Command } from "./util/commandManager";
import { update } from "../components/util/selection";
import { drawLib } from "./draw/drawLib";
import { DrawLibBase } from "./draw/drawLibBase";

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

  const act = () => {
    update(({ event }) => {
      if (!event) {
        throw new Error("updateDraw without event");
      }
      if (!id) {
        event.draws.push(d);
      } else {
        event.draws[i] = d;
      }
    });
  };
  act();

  const undo = () => {
    update(({ event }) => {
      if (!event) {
        throw new Error("updateDraw without event");
      }
      if (prev) {
        event.draws[i] = prev;
      } else {
        event.draws.pop();
      }
    });
  };

  return { name: `Add draw ${draw.name}`, act, undo };
}

export function updateMatch(event: TEvent, draw: Draw, match: Match): Command {
  // const id = match.id;
  // if (!id) {
  //   match.id = Guid.create("b");
  // }
  const i = indexOf(draw.boxes, "position", match.position);
  const prev = { ...draw.boxes[i] } as Match;
  // TODO boxIn of next draw/group
  const lib = drawLib(event, draw);

  const act = () => {
    update(({ event, draw, box }) => {
      if (!event || !draw) {
        throw new Error("updateMatch without event or draw");
      }
      // draw.boxes[i] = match;
      lib.putResult(draw.boxes[i] as Match, match);
    });
  };
  act();

  const undo = () => {
    update(({ event, draw }) => {
      if (!event || !draw) {
        throw new Error("updateMatch without event or draw");
      }
      // draw.boxes[i] = prev;
      lib.putResult(draw.boxes[i] as Match, prev);
    });
  };

  return { name: `Match result ${match.position}`, act, undo }; // TODO
}

export function newDraw(parent: TEvent, source?: Draw, after?: Draw): Draw {
  const draw: Draw = {
    id: Guid.create("d"),
    name: "",
    type: DrawType.Normal,
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
  draw.type = draw.type || DrawType.Normal;
  draw.nbColumn = draw.nbColumn || 0;
  draw.nbOut = draw.nbOut || 0;
  draw.mode = draw.mode || Mode.Build;
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

// function groupStartIndex({draws}: TEvent, draw: Draw): number { //getDebut
//   //return the first Draw of the suite
//   let i = draws.findIndex(({id}) => id === draw.id);
//   for (;i>0 && draws[i].suite; i--) {
//   }
//   return i;
// }

// function groupEndIndex({draws}: TEvent, draw: Draw): number { //getFin
//   //return the last Draw of the suite
//   let i = draws.findIndex(({id}) => id === draw.id);
//   for (;i<draws.length; i++) {
//     if (!draws[i].suite) {

//     }
//   }
//   return i-1;
// }

/**
 * Return the first and last indexes (exclusive) of the draws in the same group as given draw
 * (mainly for group of round robin).
 */
export function groupDraw(event: TEvent, draw: Draw): [number,number] {
  const draws = event.draws;
  let i = draws.findIndex(({ id }) => id === draw.id);
  let iStart = i, iNext = i + 1;
  for (; iStart > 0 && draws[iStart].suite; iStart--) {
  }
  for (; iNext < draws.length && draws[iNext].suite; iNext++) {
  }
  return [iStart, iNext];
}

/** return the first and last indexes (exclusive) of the draws of the previous group. */
export function previousGroup(event: TEvent, draw: Draw): [number,number] | undefined { //getPrecedent
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
export function nextGroup(event: TEvent, draw: Draw): [number,number] | undefined { //getSuivant
  const draws = event.draws;
  let i = draws.findIndex(({ id }) => id === draw.id);
  let iNext = i + 1;
  for (; iNext < draws.length && draws[iNext].suite; iNext++) {
  }
  if (iNext < draws.length) {
    return groupDraw(event, draws[iNext]);
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
  return isMatch(box) && (!!box.place || !!box.date);
}

// TODO duplicated in drawLibBase
export function findSeeded(
  event: TEvent,
  origin: Draw | [number,number],
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

export function groupFindPlayerIn(
  event: TEvent,
  [groupStart, groupEnd]: [number,number],
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
  [groupStart, groupEnd]: [number,number],
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
  origin: Draw | [number,number],
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
  origin: Draw | [number,number],
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
    throw message || "Assertion is false";
  }
}
