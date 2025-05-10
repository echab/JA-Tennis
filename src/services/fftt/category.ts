import type { Category, CategoryId } from "../../domain/types";

type Categ = { id: CategoryId, name: string, ageMax?: number; ageMin?: number };

const SENIOR: CategoryId = 110;

const _category: Categ[] = [
    { id: 10, name: "Poussin", ageMax: 8 },
    { id: 17, name: "Benjamin 1", ageMax: 9 },
    { id: 24, name: "Benjamin 2", ageMax: 10 },
    { id: 30, name: "Minime 1", ageMax: 11 },
    { id: 50, name: "Minime 2", ageMax: 12 },
    { id: 60, name: "Cadet 1", ageMax: 13 },
    { id: 64, name: "Cadet 2", ageMax: 14 },
    { id: 70, name: "Junior 1", ageMax: 15 },
    { id: 80, name: "Junior 2", ageMax: 16 },
    { id: 90, name: "Junior 3", ageMax: 17 },
    { id: 100, name: "Junior 4", ageMax: 18 },
    { id: SENIOR, name: "Senior", ageMin: 8, ageMax: 39 },
    { id: 125, name: "+40ans", ageMin: 40 },
    { id: 130, name: "+45ans", ageMin: 45 },
    { id: 140, name: "+50ans", ageMin: 50 },
    { id: 150, name: "+55ans", ageMin: 55 },
    { id: 160, name: "+60ans", ageMin: 60 },
    { id: 170, name: "+65ans", ageMin: 65 },
    { id: 180, name: "+70ans", ageMin: 70 },
    { id: 180, name: "+75ans", ageMin: 75 },
    { id: 190, name: "+80ans", ageMin: 80 },
    { id: 190, name: "+85ans", ageMin: 85 },
    { id: 190, name: "+90ans", ageMin: 90 }
];
const _categoryById = new Map(_category.map((c) => [c.id, c]));

export class CategoryFFTT implements Category {

    // http://www.fft.fr/sites/default/files/pdf/153-231_rs_nov2011.pdf

    //private _beginOfTime = new Date(0);
    currentYear: number; //for Spec

    //    this.refDate = function( date) {
    //        refDate = date;
    //    }

    constructor() {
        const now = new Date();
        const refDate = new Date(now.getFullYear(), 9, 1);    //1er Octobre
        this.currentYear = now.getFullYear() + (now > refDate ? 1 : 0);
    }

    name(category: CategoryId): string {
        return _categoryById.get(category)?.name ?? '';
    }

    list(): Array<{ id: number, name: string }> {
        return _category;
    }

    isValid(category: CategoryId): boolean {
        return _categoryById.has(category);
    }

    compare(category1: CategoryId, category2: CategoryId): number {
        return category1 - category2;
    }

    /** Date or year */
    getAge(date: Date | number): number {
        //const age = (new Date(refDate - date)).getFullYear() - _beginOfTime.getFullYear() -1;
        const age = this.currentYear - (typeof date === "number" ? date : date.getFullYear());
        return age;
    }

    ofDate(date: Date | number): { id: CategoryId, name: string } {
        const age = this.getAge(date);
        let prev = { id: -1, name: '' };
        for (const categ of _category) {
            if (categ.ageMax && categ.ageMax < age) {
                continue;   //too old
            }
            if (categ.ageMin) {
                if (categ.ageMin <= age) {
                    prev = categ;
                    continue;
                } else {
                    return prev;
                }
            }
            return categ;
        }
        return prev; // never
    }

    isCompatible(eventCategory: CategoryId, playerCategory: CategoryId): boolean {

        //TODO,2006/12/31: comparer l'age du joueur au 31 septembre avec la date de début de l'épreuve.

        //Epreuve senior
        if (eventCategory === SENIOR) {
            return true;
        }

        const catEvent = _categoryById.get(eventCategory);
        const catPlayer = _categoryById.get(playerCategory);

        if (!catEvent || !catPlayer) {
            return false;
        }

        if (eventCategory < SENIOR) {
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