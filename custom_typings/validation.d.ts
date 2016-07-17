
interface IValidation {
    validatePlayer(player: Player): boolean;
    validateDraw(draw: Draw): boolean;
    //validateDay(): boolean;   //VerifieJour
}

interface IError {
    message: string;
    player?: Player;
    position?: number;
    detail?: string;
}