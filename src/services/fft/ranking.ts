import { Ranking, Score } from '../../domain/types';
import { ScoreDeltaFFT} from './score';

export class RankingFFT implements Ranking {

    // private _serviceScore: ScoreFFT;

    constructor(
        score: Score) {
        // this._serviceScore = score as ScoreFFT;
    }

    private _champs = [
        "Points:",
        "Différence de Sets:",
        "Différence de Jeux:"
    ];

    private Points = 0;
    private dPoint = 0;
    private dSet2 = 0;
    private dJeu = 0;

    //- le nombre de sets des matchs (3 ou 5)
    //art52               |  Points  |   Sets   |   Jeux   |
    //- Vainqueur         |    +2    |Différence|Différence|
    //- Battu             |    +1    |Différence|Différence|
    //- Vainqueur abandon |    +2    |          |          |
    //- Battu abandon     |    +1    |          |          |
    //- Vainqueur WO      |    +2    |   +1,5   |    +5    |
    //- Battu WO          |     0    |   -1,5   |    -5    |
    //- Match nul         |     0    |          |          |
    Empty(): void {
        this.Points = 0;
    }

    isVide(): boolean {
        return this.Points === 0;
    }

    NomChamp(iChamp: number): string {
        return this._champs[iChamp];
    }

    ValeurChamp(iChamp: number): string {
        switch (iChamp) {
            case 0: return this.dPoint.toString();
            case 1: return Math.floor(this.dSet2 / 2).toString();
            case 2: return this.dJeu.toString();
            default: return '';
        }
    }

    AddResultat(bVictoire: number, score: string, fm: string): boolean {	//-1=défaite, 0=nul, 1=victoire
        //bVictoire: -1=défaite, 0=nul, 1=victoire

        const sc = new ScoreDeltaFFT(score, fm);

        //Compte la différence de Set
        this.dPoint += sc.deltaPoint(bVictoire > 0);	//TODO bEquipe ???
        this.dSet2 += sc.deltaSet(bVictoire > 0);	//TODO bEquipe ???
        this.dJeu += sc.deltaJeu(bVictoire > 0);	//TODO bEquipe ???

        return true;
    }

    Ordre(): number {
        // eslint-disable-next-line no-bitwise
        return ((this.dPoint + 0x80) << 24) + ((this.dSet2 + 0x80) << 16) + (this.dJeu + 0x8000);
    }
}