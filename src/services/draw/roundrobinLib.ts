export function column(pos: number, nCol: number): number { //iColPoule
    return Math.floor(pos / nCol);
}

export function row(pos: number, nCol: number): number { //iRowPoule
    return pos % nCol;
}

export function positionFirstIn(nCol: number): number {
    return nCol * (nCol + 1);
}
export function positionLastIn(nCol: number): number {
    return nCol * nCol + 1;
}

export function seedPositionOpponent1(pos: number, nCol: number): number {    //POULE_ADVERSAIRE1
    return (pos % nCol) + (nCol * nCol);
}

export function seedPositionOpponent2(pos: number, nCol: number): number {    //POULE_ADVERSAIRE2
    return Math.floor(pos / nCol) + (nCol * nCol);
}

export function positionMatchPoule(row: number, col: number, nCol: number): number { //IMATCH
    return (col * nCol) + row;
}

export function positionResize(pos: number, nColOld: number, nCol: number): number {
    const r = row(pos, nColOld),
        col = column(pos, nColOld);
    return (nCol - nColOld + r) + nCol * (nCol - nColOld + col);
}

// export function iDiagonale(box: Box): number {
//     const n = box._draw.nbColumn;
//     return (box.position % n) * (n + 1);
// }
export function iDiagonalePos(nbColumn: number, pos: number): number {
    return (pos % nbColumn) * (nbColumn + 1);
}

export function positionOpponent1({ nbColumn }: { nbColumn: number }, pos: number): number { // ADVERSAIRE1
    return pos % nbColumn + nbColumn * nbColumn;
}