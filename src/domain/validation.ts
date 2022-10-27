import { Draw } from "./draw";
import { Player } from "./player";
import { TEvent, Tournament } from "./tournament";

export interface IValidation {
    validatePlayer?(player: Player): boolean;
    validateDraw?(tournament: Tournament, event: TEvent, draw: Draw, players: Player[]): boolean;
    //validateDay(): boolean;   //VerifieJour
}

export interface IError {
    message: string;
    player?: Player;
    position?: number;
    detail?: string;

    // TODO ignore?: boolean;
}