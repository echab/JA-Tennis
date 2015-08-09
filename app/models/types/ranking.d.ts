interface Ranking {
    //TODO factory
    AddResultat(bVictoire: number, score: string, fm: string): boolean;	//-1=défaite, 0=nul, 1=victoire
    Empty(): void;
    NomChamp(iChamp: number): string;
    ValeurChamp(iChamp: number): string;
    Ordre(): number;
    isVide(): boolean;
}