/* eslint-disable no-bitwise */
import { Box, Draw } from "../../domain/draw";
import { by } from "../util/find";

export function column(pos: number): number {    //iCol
    // = Math.trunc(Math.log2(x+1))
    //TODO?, use a table
    let col = -1;
    // eslint-disable-next-line no-empty
    for (pos++; pos; pos >>= 1, col++) {}
    return col;
}

export function columnMin(nQ = 1): number {   //iColMinQ
    return !nQ || nQ === 1
        ? 0
        : column(nQ - 2) + 1;
}

export function columnMax(nCol: number, nQ = 1): number { //iColMaxQ
    return !nQ || nQ === 1
        ? nCol - 1
        : column(nQ - 2) + nCol;
}

export function positionTopCol(col: number): number { // iHautCol
    return (1 << (col + 1)) - 2;
}

export function positionBottomCol(col: number, nQ = 1): number {  //iBasColQ
    return !nQ || nQ === 1
        ? (1 << col) - 1    //iBasCol
        : (positionTopCol(col) - countInCol(col, nQ) + 1);
}

export function countInCol(col: number, nQ = 1): number { //nInColQ
    return !nQ || nQ === 1
        ? (1 << col)    //countInCol
        : nQ * countInCol(col - columnMin(nQ), 1);
}

export function positionMin(nQ = 1): number { //iBoiteMinQ
    return !nQ || nQ === 1
        ? 0
        : positionBottomCol(columnMin(nQ), nQ);
}

export function positionMax(nCol: number, nQ = 1): number {   //iBoiteMaxQ
    return !nQ || nQ === 1
        ? (1 << nCol) - 2  //iHautCol
        : positionTopCol(columnMax(nCol, nQ));
}

export function positionMatch(pos: number): number { //IMATCH
    return (pos - 1) >> 1;
}

export function positionOpponent(pos: number): number {  //IAUTRE
    return pos & 1 ? pos + 1 : pos - 1;
}

export function positionOpponent1(pos: number): number { //ADVERSAIRE1
    return (pos << 1) + 2;
}
export function positionOpponent2(pos: number): number { //ADVERSAIRE2
    return (pos << 1) + 1;
}

export function positionOpponents(pos: number): { pos1: number; pos2: number } { //ADVERSAIRE1, ADVERSAIRE2
    return {
        pos1: (pos << 1) + 2,
        pos2: (pos << 1) + 1
    };
}

export function scanLeftBoxes(
    draw: Draw,
    position: number,
    evenWithPlayer: boolean,
    callback: (box: Box, pos: number) => void
): void { //iBoiteDeGauche

    //formule de décalage à gauche:
    //
    // iNew = i + pivot * 2 ^ log2(i + 1)
    //
    //   pivot: iBoite qui est remplacée par 0
    //   i    : une case à gauche du pivot
    //   iNew : la même case après décalage

    const maxPos = positionMax(draw.nbColumn, draw.nbOut);

    for (let pos = position; ;) {
        let b: number;
        let j = pos - position * (1 <<(column(pos) - column(position)));
        for(;;) {
            j++;
            b = j + position * (1 << column(j));

            if (b > maxPos) {
                return;
            }
            const box = by(draw.boxes, 'position', b);
            if (!box) {
                return;
            }
            if(!!box.playerId || evenWithPlayer) {
                callback(box, b);
                break;
            }
        }
        pos = b;
    }
}
