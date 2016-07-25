
declare const enum GenerateType { None, Create, PlusEchelonne, PlusEnLigne, Mix }

interface IDrawLib {
    getSize(draw: Draw): ISize;
    computePositions(draw: Draw): IPoint[];
    resize(draw: Draw, oldDraw?: Draw, nJoueur?: number): void;
    nbColumnForPlayers(draw: Draw, nJoueur: number): number;
    generateDraw(draw: Draw, generate: GenerateType, afterIndex: number): Draw[];
    setPlayerIn(box: PlayerIn, inNumber?: number, player?: Player): boolean;    //SetQualifieEntrant
    setPlayerOut(box: Match, outNumber?: number): boolean;    //SetQualifieSortant
    findPlayerIn(draw: Draw, inNumber: number): PlayerIn;  //FindQualifieEntrant
    findPlayerOut(draw: Draw, outNumber: number): Match;    //FindQualifieSortant
    computeScore(draw: Draw): boolean;   //CalculeScore
    boxesOpponents(match: Match): { box1: Box; box2: Box };
}