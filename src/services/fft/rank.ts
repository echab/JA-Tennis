import { Rank, RankString, RankGroupString } from "../../domain/types";

export class RankFFT implements Rank {

    private _group: { [groupName: string]: string } = {
        "4e série": "NC,40,30/5,30/4,30/3,30/2,30/1",
        "3e série": "30,15/5,15/4,15/3,15/2,15/1",
        "2e série": "15,5/6,4/6,3/6,2/6,1/6",
        "1e série": "0,-1/6,-2/6,-3/6,-4/6,-5/6",
        "promotion": "-15,-30"
    };

    private _groups = <string[]>[];
    private _groupOf: { [rank: string]: string } = {};
    private _ranks: string[] = [];
    private _index: { [rank: string]: number } = {};

    constructor() {
        let i: string;
        for (i in this._group) {
            this._groups.push(i);
            const g: string[] = this._group[i].split(",");
            this._ranks = this._ranks.concat(g);
            for (let j = g.length - 1; j >= 0; j--) {
                this._groupOf[g[j]] = i;
            }
        }
        for (let j = this._ranks.length - 1; j >= 0; j--) {
            this._index[this._ranks[j]] = j;
        }
    }

    first() {
        return this._ranks[0];
    }
    list() {
        return this._ranks;
    }

    isValid(rank: RankString): boolean {
        return this._index[rank] >= 0;
    }

    isNC(rank: RankString): boolean {
        return rank === "NC";
    }

    next(rank: RankString): RankString {
        const i = this._index[rank];
        return this._ranks[i + 1];
    }

    previous(rank: RankString): RankString {
        const i = this._index[rank];
        return this._ranks[i - 1];
    }

    compare(rank1: RankString, rank2: RankString): number {
        const i = this._index[rank1],
            j = this._index[rank2];
        return i - j;
    }

    within(rank: RankString, rank1: RankString, rank2: RankString): boolean {
        return (!rank1 || this.compare(rank1, rank) <= 0)
            && (!rank2 || this.compare(rank, rank2) <= 0);
    }

    groups(): RankGroupString[] {
        return this._groups;
    }

    groupOf(rank: RankString): RankGroupString {
        return this._groupOf[rank];
    }
}