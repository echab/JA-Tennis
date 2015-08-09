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