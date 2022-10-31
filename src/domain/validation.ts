import { Box, Draw } from "./draw";
import { Player } from "./player";
import { TEvent, Tournament } from "./tournament";

export interface IValidation {
    validatePlayer?(player: Player): PlayerProblem[];
    validateDraw?(tournament: Tournament, event: TEvent, draw: Draw): DrawProblem[];
    //validateDay(): boolean;   //VerifieJour
}

export type PlayerProblem = {
    message: string;
    player: Player;
    detail?: string;

    // TODO ignore?: boolean;
};

export type DrawProblem = {
    message: string;
    draw: Draw;
    box?: Box;
    player?: Player;
    detail?: string;

    // TODO ignore?: boolean;
};