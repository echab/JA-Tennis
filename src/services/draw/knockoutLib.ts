//TODO not a service but a static function library

export class KnockoutLib {

    column(pos: number): number {    //iCol
        //TODO, use a table
        var col = -1;
        for (pos++; pos; pos >>= 1, col++) { }
        return col;
    }

    columnMin(nQ?: number): number {   //iColMinQ
        return !nQ || nQ === 1
            ? 0
            : this.column(nQ - 2) + 1;
    }

    columnMax(nCol: number, nQ?: number): number { //iColMaxQ
        return !nQ || nQ === 1
            ? nCol - 1
            : this.column(nQ - 2) + nCol;
    }

    positionTopCol(col: number): number { // iHautCol
        return (1 << (col + 1)) - 2;
    }

    positionBottomCol(col: number, nQ?: number): number {  //iBasColQ
        return !nQ || nQ === 1
            ? (1 << col) - 1    //iBasCol
            : (this.positionTopCol(col) - this.countInCol(col, nQ) + 1);
    }

    countInCol(col: number, nQ?: number): number { //nInColQ
        return !nQ || nQ === 1
            ? (1 << col)    //countInCol
            : nQ * this.countInCol(col - this.columnMin(nQ), 1);
    }

    positionMin(nQ?: number): number { //iBoiteMinQ
        return !nQ || nQ === 1
            ? 0
            : this.positionBottomCol(this.columnMin(nQ), nQ);
    }

    positionMax(nCol: number, nQ?: number): number {   //iBoiteMaxQ
        return !nQ || nQ === 1
            ? (1 << nCol) - 2  //iHautCol
            : this.positionTopCol(this.columnMax(nCol, nQ));
    }

    positionMatch(pos: number): number { //IMATCH
        return (pos - 1) >> 1;
    }

    positionOpponent(pos: number): number {  //IAUTRE
        return pos & 1 ? pos + 1 : pos - 1;
    }

    positionOpponent1(pos: number): number { //ADVERSAIRE1
        return (pos << 1) + 2;
    }
    positionOpponent2(pos: number): number { //ADVERSAIRE2
        return (pos << 1) + 1;
    }

    positionOpponents(pos: number): { pos1: number; pos2: number } { //ADVERSAIRE1, ADVERSAIRE2
        return {
            pos1: (pos << 1) + 2,
            pos2: (pos << 1) + 1
        };
    }
}

// angular.module('jat.services.knockoutLib', [])
//     .factory('knockoutLib', [
//         () => {
//             return new KnockoutLib();
//         }
//     ]);
