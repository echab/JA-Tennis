import { Box, Draw } from "./draw";
import { Player } from "./player";
import { TEvent, Tournament } from "./tournament";

export interface IValidation {
    validatePlayer?(player: Player): PlayerError[];
    validateDraw?(tournament: Tournament, event: TEvent, draw: Draw): DrawError[];
    //validateDay(): boolean;   //VerifieJour
}

export type PlayerError = {
    message: string;
    player: Player;
    detail?: string;

    // TODO ignore?: boolean;
};

export type DrawError = {
    message: string;
    draw: Draw;
    box?: Box;
    player?: Player;
    detail?: string;

    // TODO ignore?: boolean;
};