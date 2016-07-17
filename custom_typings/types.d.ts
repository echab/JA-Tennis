interface CategoryString extends String { }

interface Category {
    //currentYear: number;    //public for Spec
    list(): CategoryString[];
    isValid(category: CategoryString): boolean;
    isCompatible(eventCategory: CategoryString, playerCategory: CategoryString): boolean
    ofDate(date: Date): CategoryString;
    getAge(date: Date): number;
    compare(category1: CategoryString, category2: CategoryString): number;
}

interface Licence {
    isValid(licence: string): boolean;
}

interface RankString extends String {
}

interface RankGroupString extends String {    
}

interface Rank {
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

interface Ranking {
    //TODO factory
    AddResultat(bVictoire: number, score: string, fm: string): boolean;	//-1=défaite, 0=nul, 1=victoire
    Empty(): void;
    NomChamp(iChamp: number): string;
    ValeurChamp(iChamp: number): string;
    Ordre(): number;
    isVide(): boolean;
}

interface MatchFormat {
    code: string;
    name: string;
    duration?: number;
}

interface MatchFormats {
    list(): { [code: string]: MatchFormat };
}

interface ScoreString extends String { }

interface Score {
    isValid(score: ScoreString): boolean;
}