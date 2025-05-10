import type { Rank, RankString, RankGroupString } from "../../domain/types";

/*
http://www.fftt.com/administratif/reglements_2010/2010_Reglements_administratifs.pdf#page=45

Classement	Points			Points
			Messieurs		Dames
	N1		~3500-			~3500 -
	...
	N300				...		  -~1550
	...							 ///
	N1000		 -~2059			 ///
	20		2000 - *		 	 ///
	19		1900 - 1999			 ///
	18		1800 - 1899			 ///
	17		1700 - 1799			 ///
	16		1600 - 1699			 ///
	15		1500 - 1599		 1500 - **
	14		1400 - 1499		 1400 - 1499
	13		1300 - 1399		 1300 - 1399
	12		1200 - 1299		 1200 - 1299
	11		1100 - 1199		 1100 - 1199
	10		1000 - 1099		 1000 - 1099
	09		 900 -  999		  900 -  999
	08		 800 -  899		  800 -  899
	07		 700 -  799		  700 -  799
	06		 600 -  699		  600 -  699
	05		 500 -  599		  500 -  599

	* - Points du 1001e joueur
	** - Points de la 301e joueuse
*/

export class RankFFTT implements Rank {

    private _group: { [groupName: string]: string } = {
        "group2": "NC,05,06,07,08,09,10,11,12,13,14,15,16,17,18,19,20",
        "1e série": "1000,999,998",
    };

    private _groups: string[] = [];
    private _groupOf: { [rank: string]: string } = {};
    private _ranks: string[] = [];
    private _index: { [rank: string]: number } = {};

    constructor() {
        for (const i of Object.keys(this._group)) {
            this._groups.push(i);
            const g = this._group[i].split(",");
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