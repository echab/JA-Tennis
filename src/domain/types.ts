export type CategoryId = number;

export interface Category {
    //currentYear: number;    //public for Spec
    list(): Array<{id: number, name: string}>;
    name(category: CategoryId): string;
    isValid(category: CategoryId): boolean;
    isCompatible(eventCategory: CategoryId, playerCategory: CategoryId): boolean

    /** @param date or year */
    ofDate(date: Date | number): {id: CategoryId, name: string};

    /** @param date or year */
    getAge(date: Date | number): number;

    compare(category1: CategoryId, category2: CategoryId): number;
}

export interface Licence {
    isValid(licence: string): boolean;
    getKey(licence: string): string | undefined;
}

export type RankString = string;

export type RankGroupString = string;

export interface Rank {
    first(): RankString;
    list(): RankString[];
    isValid(rank: RankString): boolean;
    next(rank: RankString): RankString;
    previous(rank: RankString): RankString;
    compare(rank1: RankString, rank2: RankString): number;
    within(rank: RankString, rank1: RankString, rank2: RankString): boolean;
    groups(): RankGroupString[];
    groupOf(rank: RankString): RankGroupString;
    isNC(rank: RankString): boolean;
}

export interface Ranking {
    //TODO factory
    AddResultat(bVictoire: number, score: string, fm: string): boolean;	//-1=défaite, 0=nul, 1=victoire
    Empty(): void;
    NomChamp(iChamp: number): string;
    ValeurChamp(iChamp: number): string;
    Ordre(): number;
    isVide(): boolean;
}

export interface MatchFormat {
    code: string;
    name: string;
    duration?: number;
}

export interface MatchFormats {
    list(): MatchFormat[];
}

export type ScoreString = string;

export interface Score {
    isValid(score: ScoreString): boolean;
}