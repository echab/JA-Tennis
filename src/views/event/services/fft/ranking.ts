import { ScoreFFT,ScoreDeltaFFT} from './score';

export class RankingFFT implements Ranking {

    private _serviceScore: ScoreFFT;

    constructor(
        score: Score) {
        this._serviceScore = <ScoreFFT> score;
    }

    private _champs = [
        "Points:",
        "Différence de Sets:",
        "Différence de Jeux:"
    ];

    private Points: number = 0;
    private dPoint: number;
    private dSet2: number;
    private dJeu: number;

    //- le nombre de sets des matchs (3 ou 5)
    //art52               |  Points  |   Sets   |   Jeux   |
    //- Vainqueur         |    +2    |Différence|Différence|
    //- Battu             |    +1    |Différence|Différence|
    //- Vainqueur abandon |    +2    |          |          |
    //- Battu abandon     |    +1    |          |          |
    //- Vainqueur WO      |    +2    |   +1,5   |    +5    |
    //- Battu WO          |     0    |   -1,5   |    -5    |
    //- Match nul         |     0    |          |          |
    public Empty(): void {
        this.Points = 0;
    }

    public isVide(): boolean {
        return this.Points === 0;
    }

    public NomChamp(iChamp: number): string {
        return this._champs[iChamp];
    }

    public ValeurChamp(iChamp: number): string {
        switch (iChamp) {
            case 0: return this.dPoint.toString();
            case 1: return Math.floor(this.dSet2 / 2).toString();
            case 2: return this.dJeu.toString();
        }
    }

    public AddResultat(bVictoire: number, score: string, fm: string): boolean {	//-1=défaite, 0=nul, 1=victoire
        //bVictoire: -1=défaite, 0=nul, 1=victoire

        var sc = new ScoreDeltaFFT(score, fm);

        //Compte la différence de Set
        this.dPoint += sc.deltaPoint(bVictoire > 0);	//TODO bEquipe ???
        this.dSet2 += sc.deltaSet(bVictoire > 0);	//TODO bEquipe ???
        this.dJeu += sc.deltaJeu(bVictoire > 0);	//TODO bEquipe ???

        return true;
    }

    public Ordre(): number {
        return ((this.dPoint + 0x80) << 24) + ((this.dSet2 + 0x80) << 16) + (this.dJeu + 0x8000);
    }
}