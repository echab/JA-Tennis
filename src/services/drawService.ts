import { indexOf } from "./util/find";
import { Guid } from "./util/guid";
import { extend, isArray, isObject } from "./util/object";
import { shuffle } from "../utils/tool";
import { rank } from "./types";

import { Box, Draw, DrawType, Match, Mode } from "../domain/draw";
import { PlayerIn } from "../domain/player";
import { TEvent } from "../domain/tournament";
import { OptionalId } from "../domain/object";
import { Command } from "./util/commandManager";
import { update } from "../components/util/selection";
import { drawLib } from "./draw/drawLib";

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
  const prev = {...match};
  // TODO boxIn of next draw/group

  const act = () => {
    update(({ event, draw, box }) => {
      if (!event || !draw) {
        throw new Error("updateMatch without event or draw");
      }
      draw.boxes[i] = match;
    });
  };
  act();

  const undo = () => {
    update(({ event, draw }) => {
      if (!event || !draw) {
        throw new Error("updateMatch without event or draw");
      }
      draw.boxes[i] = prev;
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
    _previous: after,
  };
  //TODO? after._next = draw;

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
export function newBox(
  parent: Draw,
  source?: string | Box,
  position?: number,
): Box {
  var box: Box = <any> {};
  if (isObject(source)) {
    extend(box, source);
    //box.id = undefined;
    //box.position= undefined;
  } else if ("string" === typeof source) { //matchFormat
    var match: Match = <Match> box;
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

export function isMatch(box: Box): boolean {
  return box && "undefined" !== typeof (<Match> box).score;
}

export function _updateQualif(event: TEvent, draw: Draw): void {
  var lib = drawLib(event, draw);

  //retreive qualifIn box
  var qualifs: PlayerIn[] = [];
  for (var i = draw.boxes.length - 1; i >= 0; i--) {
    var boxIn = <PlayerIn> draw.boxes[i];
    if (boxIn.qualifIn) {
      qualifs.push(boxIn);
    }
  }

  shuffle(qualifs);

  //remove old qualif numbers
  for (i = qualifs.length - 1; i >= 0; i--) {
    lib.setPlayerIn(qualifs[i], 0);
  }

  //assign new qualif number
  for (i = qualifs.length - 1; i >= 0; i--) {
    lib.setPlayerIn(qualifs[i], i + 1);
  }
}

// export function getPlayer(box: Box): Player {
//   return byId(box._draw._event._tournament.players, box.playerId);
// }

function groupBegin(draw: Draw): Draw { //getDebut
  //return the first Draw of the suite
  var p = draw;
  while (p && p.suite) {
    if (!p._previous) {
      break;
    }
    p = p._previous;
  }
  return p;
}

function groupEnd(draw: Draw): Draw { //getFin
  //return the last Draw of the suite
  var p = groupBegin(draw);
  while (p && p._next && p._next.suite) {
    p = p._next;
  }
  return p;
}

//** return the group of draw of the given draw (mainly for group of round robin). */
export function groupDraw(draw: Draw): Draw[] {
  var draws: Draw[] = [];
  let d: Draw | undefined = groupBegin(draw);
  while (d) {
    draws.push(d);
    d = d._next;
    if (d && !d.suite) {
      break;
    }
  }
  return draws;
}

//** return the draws of the previous group. */
export function previousGroup(draw: Draw): Draw[] | undefined { //getPrecedent
  var p = groupBegin(draw);
  return p?._previous ? groupDraw(p._previous) : undefined;
}

//** return the draws of the next group. */
export function nextGroup(draw: Draw): Draw[] | undefined { //getSuivant
  var p = groupEnd(draw);
  return p && p._next ? groupDraw(p._next) : undefined;
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

export function findSeeded(
  origin: Draw | Draw[],
  iTeteSerie: number,
): [Draw, PlayerIn] | [] { //FindTeteSerie
  ASSERT(1 <= iTeteSerie && iTeteSerie <= MAX_TETESERIE);
  var group = isArray(origin) ? origin : groupDraw(origin);
  for (var i = 0; i < group.length; i++) {
    var boxes = group[i].boxes;
    for (var j = 0; j < boxes.length; j++) {
      var boxIn: PlayerIn = boxes[j];
      if (boxIn.seeded === iTeteSerie) {
        return [group[i], boxIn];
      }
    }
  }
  return [];
}

export function groupFindPlayerIn(
  event: TEvent,
  group: Draw[],
  iQualifie: number,
): [Draw, PlayerIn] | [] {
  ASSERT(1 <= iQualifie && iQualifie <= MAX_QUALIF);
  //var group = isArray(group) ? group : groupDraw(group);
  for (var i = 0; i < group.length; i++) {
    var d = group[i];
    var lib = drawLib(event, d);
    var playerIn = lib.findPlayerIn(iQualifie);
    if (playerIn) {
      return [d, playerIn];
    }
  }
  return [];
}

export function groupFindPlayerOut(
  event: TEvent,
  group: Draw[],
  iQualifie: number,
): [Draw, Match] | [] {
  ASSERT(1 <= iQualifie && iQualifie <= MAX_QUALIF);
  //var group = isArray(origin) ? origin : groupDraw(origin);
  for (var i = 0; i < group.length; i++) {
    var d = group[i];
    var lib = drawLib(event, d);
    var boxOut = lib.findPlayerOut(iQualifie);
    if (boxOut) {
      return [d, boxOut];
    }
  }

  //Si iQualifie pas trouvé, ok si < somme des nSortant du groupe
  var outCount = 0;
  for (var i = 0; i < group.length; i++) {
    var d = group[i];
    if (d.type >= 2) {
      outCount += d.nbOut;
    }
  }
  if (iQualifie <= outCount) {
    return <any> -2; //TODO
  }
  return [];
}

export function groupFindAllPlayerOut(
  event: TEvent,
  origin: Draw | Draw[],
  hideNumbers?: boolean,
): number[] { //FindAllQualifieSortant
  //Récupère les qualifiés sortants du tableau
  var group = isArray(origin) ? origin : groupDraw(origin);
  if (!group) {
    return [];
  }
  var a: number[] = [];
  for (var i = 1; i <= MAX_QUALIF; i++) {
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
  origin: Draw | Draw[],
): Match[] { //FindAllQualifieSortantBox
  //Récupère les qualifiés sortants du tableau
  var group = isArray(origin) ? origin : groupDraw(origin);
  if (!group) {
    return [];
  }
  var a: Match[] = [];
  for (var i = 1; i <= MAX_QUALIF; i++) {
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
