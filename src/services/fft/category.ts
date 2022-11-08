import { Category, CategoryString } from "../../domain/types";

export class CategoryFFT implements Category {

    // http://www.fft.fr/sites/default/files/pdf/153-231_rs_nov2011.pdf

    private _category: { [name: string]: { ageMax?: number; ageMin?: number } } = {
        "-8ans": { ageMax: 8 },   //010
        "-9ans": { ageMax: 9 },   //017
        "-10ans": { ageMax: 10 }, //024
        "-11ans": { ageMax: 11 }, //030
        "-12ans": { ageMax: 12 }, //050
        "-13ans": { ageMax: 13 }, //060
        "-14ans": { ageMax: 14 }, //064
        "-15ans": { ageMax: 15 }, //070
        "-16ans": { ageMax: 16 }, //080
        "-17ans": { ageMax: 17 }, //090
        "-18ans": { ageMax: 18 }, //100
        "Senior": { ageMin: 18, ageMax: 34 }, // 110
        "+35ans": { ageMin: 35 }, //120
        "+40ans": { ageMin: 40 }, //125
        "+45ans": { ageMin: 45 }, //130
        "+50ans": { ageMin: 50 }, //140
        "+55ans": { ageMin: 55 }, //150
        "+60ans": { ageMin: 60 }, //160
        "+65ans": { ageMin: 65 }, //170
        "+70ans": { ageMin: 70 }, //180
        "+75ans": { ageMin: 75 }  //190
    };
    //private _beginOfTime = new Date(0);
    currentYear: number; //for Spec

    //    this.refDate = function( date) {
    //        refDate = date;
    //    }

    private _categories: string[] = [];
    private _index: { [category: string]: number } = {};

    constructor() {

        const now = new Date();
        const refDate = new Date(now.getFullYear(), 9, 1);    //1er Octobre
        this.currentYear = now.getFullYear() + (now > refDate ? 1 : 0);

        for (const c of Object.keys(this._category)) {
            this._categories.push(c);
        }
        for (let i = this._categories.length - 1; i >= 0; i--) {
            this._index[this._categories[i]] = i;
        }
    }

    list(): CategoryString[] {
        return this._categories;
    }

    isValid(category: string): boolean {
        return this._index[category] >= 0;
    }

    compare(category1: string, category2: string): number {
        const i = this._index[category1],
            j = this._index[category2];
        return i - j;
    }

    getAge(date: Date): number {
        //const age = (new Date(refDate - date)).getFullYear() - _beginOfTime.getFullYear() -1;
        const age = this.currentYear - date.getFullYear();
        return age;
    }

    ofDate(date: Date): string {
        const age = this.getAge(date);
        let prev = '';
        for (const i of Object.keys(this._category)) {
            const categ = this._category[i];

            if (categ.ageMax && categ.ageMax < age) {
                continue;   //too old
            }
            if (categ.ageMin) {
                if (categ.ageMin <= age) {
                    prev = i;
                    continue;
                } else {
                    return prev;
                }
            }
            return i;
        }
        return ''; // never
    }

    isCompatible(eventCategory: number | CategoryString | undefined, playerCategory: number | CategoryString | undefined): boolean {

        if (playerCategory === undefined || eventCategory === undefined) {
            return true;
        }

        if (typeof eventCategory === 'number') {
            eventCategory = this._categories[eventCategory];
        }
        if (typeof playerCategory === 'number') {
            playerCategory = this._categories[playerCategory];
        }

        //TODO,2006/12/31: comparer l'age du joueur au 31 septembre avec la date de début de l'épreuve.

        const idxSenior = this._index.Senior;
        const idxEvent = this._index[eventCategory];

        //Epreuve senior
        if (idxEvent === idxSenior) {
            return true;
        }

        const catEvent = this._category[eventCategory];
        const catPlayer = this._category[playerCategory];

        if (idxEvent < idxSenior) {
            //Epreuve jeunes
            if (catPlayer.ageMax
                && catEvent.ageMax
                && catPlayer.ageMax <= catEvent.ageMax) {
                return true;
            }
        } else {
            //Epreuve vétérans
            if (catEvent.ageMin
                && catPlayer.ageMin
                && catEvent.ageMin <= catPlayer.ageMin) {
                return true;
            }
        }

        return false;

        //TODO? 2006/08/28	AgeMin() < playerCategory.AgeMin()	//vétéran

        //	return playerCategory.isVide() || isVide()
        //		(playerCategory.AgeMin() <= AgeMax()
        //		&& AgeMin() <= playerCategory.AgeMax() );
    }
}