import { Draw, Box, Match } from "../domain/draw";
import { Player } from "../domain/player";
import { Tournament, TEvent } from "../domain/tournament";
import { IError } from "../domain/validation";
import { by } from "./util/find";

// export const enum ModelType {
//   None,
//   Tournament,
//   Player,
//   TEvent,
//   Draw,
//   Match,
//   Box,
// }

// export class Selection {
//   tournament?: Tournament;
//   event?: TEvent;
//   draw?: Draw;
//   box?: Box;
//   player?: Player;

//   modelTypeNone = ModelType.None;
//   modelTypeTournament = ModelType.Tournament;
//   modelTypePlayer = ModelType.Player;
//   modelTypeEvent = ModelType.TEvent;
//   modelTypeDraw = ModelType.Draw;
//   modelTypeMatch = ModelType.Match;
//   modelTypeBox = ModelType.Box;

//   // constructor() {
//   // }

//   select2(
//     item: Box | Draw | TEvent | Player | Tournament | string,
//     type?: ModelType,
//   ): void {
//     if (item && type) {
//       //first unselect any item to close the actions dropdown
//       this.unselect(type);
//       //then select the new box
//       setTimeout(() => this.select(item, type), 0);
//       return;
//     }
//     this.select(item, type);
//   }

//   select(
//     item?: Box | Draw | TEvent | Player | Tournament | string,
//     type?: ModelType,
//   ): Box | Draw | TEvent | Player | Tournament | undefined {
//     if (!item) {
//       if (type) {
//         this.unselect(type);
//       }
//       return;
//     }

//     //if (type === ModelType.Box || ('_player' in item && (item as Box)._draw)) { //box
//     const b = item as Box;
//     if (type === ModelType.Box || (b._player && b._draw)) { //box
//       this.tournament = b._draw?._event?._tournament;
//       this.event = b._draw._event;
//       this.draw = b._draw;
//       this.box = b;
//       return b;
//     }
//     if (type === ModelType.Draw && "string" === typeof item) { //draw id
//       let id = item;
//       const d = this.event?.draws.find((draw: Draw) => draw.id === id);
//       // this.tournament = d._event._tournament;
//       // this.event = d._event;
//       this.draw = d;
//       this.box = undefined;
//       return d;
//     }
//     if (type === ModelType.Draw || (item as Draw)._event) { //draw
//       const d = item as Draw;
//       this.tournament = d._event?._tournament;
//       this.event = d._event;
//       this.draw = d;
//       this.box = undefined;
//       return d;
//     }
//     if (type === ModelType.TEvent && "string" === typeof item) { //event id
//       let id = item;
//       const e = this.tournament?.events.find((evt: TEvent) => evt.id === id);
//       // this.tournament = e._tournament;
//       this.event = e;
//       this.draw = e?.draws[0];
//       this.box = undefined;
//       return e;
//     }
//     if (
//       type === ModelType.TEvent ||
//       ((item as TEvent).draws && (item as TEvent)._tournament)
//     ) { //event
//       const e = item as TEvent;
//       this.tournament = e._tournament;
//       this.event = e;
//       this.draw = e.draws ? e.draws[0] : undefined;
//       this.box = undefined;
//       return e;
//     }
//     if (type === ModelType.Player && (typeof item === "string")) { //player id
//       let id = item;
//       const p = this.tournament?.players.find((player: Player) =>
//         player.id === id
//       );
//       // this.tournament = p._tournament;
//       this.player = p;
//       return p;
//     }
//     if (
//       type === ModelType.Player ||
//       ((item as Player).name && (item as Player)._tournament)
//     ) { //player
//       const p = item as Player;
//       this.tournament = p._tournament;
//       this.player = p;
//       return p;
//     }
//     if (
//       type === ModelType.Tournament ||
//       ((item as Tournament).players && (item as Tournament).events)
//     ) { //tournament
//       this.tournament = item as Tournament;
//       if (this.tournament.events && this.tournament.events[0]) {
//         this.event = this.tournament.events[0];
//         this.draw = this.event && this.event.draws
//           ? this.event.draws[this.event.draws.length - 1]
//           : undefined;
//       } else {
//         this.event = undefined;
//         this.draw = undefined;
//       }
//       this.box = undefined;
//       if (this.player && this.player._tournament !== this.tournament) {
//         this.player = undefined;
//       }
//       return this.tournament;
//     }
//   }

//   selectByError(
//     draw: Draw,
//     error: IError,
//   ): Box | Draw | TEvent | Player | Tournament | undefined {
//     if (error.position) {
//       const box = by(draw.boxes, "position", error.position);
//       return this.select(box, ModelType.Box);
//     } else if (error.player) {
//       return this.select(error.player, ModelType.Player);
//     } else {
//       return this.select(draw, ModelType.Draw);
//     }
//   }

//   unselect(type: ModelType): void {
//     //if (type) {
//     //cases cascade, without breaks.
//     switch (type) {
//       case ModelType.Tournament:
//         this.tournament = undefined;
//         this.player = undefined;
//       case ModelType.TEvent:
//         this.event = undefined;
//       case ModelType.Draw:
//         this.draw = undefined;
//       case ModelType.Box:
//         this.box = undefined;
//         break;
//       case ModelType.Player:
//         this.player = undefined;
//     }
//     //}
//   }

//   get isMatch(): boolean {
//     // return this.box && ('score' in this.box);
//     return !!this.box && ("undefined" !== typeof (this.box as Match).score);
//   }

//   get hasScore(): boolean {
//     const match = this.box as Match;
//     return !!match &&
//       (!!match.score || !!match.wo || !!match.canceled || !!match.vainqDef);
//   }
// }
