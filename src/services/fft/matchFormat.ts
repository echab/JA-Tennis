import { MatchFormats, MatchFormat } from "../../domain/types";

export class MatchFormatsFFT implements MatchFormats {

    private _matchFormats: MatchFormat[] = [
        { code:'A', name: "A: traditionnel (3 sets à 6 jeux)" },
        { code:'B', name: "B: traditionnel (3 sets à 6 jeux) - point décisif" },
        { code:'C', name: "C: 3 sets à 4 jeux - jeu décisif à 4/4" },
        { code:'D', name: "D: 3 sets à 4 jeux - jeu décisif à 4/4 - point décisif" },
        { code:'E', name: "E: 3 sets à 3 jeux - jeu décisif à 2/2" },
        { code:'F', name: "F: 3 sets à 3 jeux - jeu décisif à 2/2 - point décisif" },
        { code:'G', name: "G: 3 jeux décisif" },
        { code:'H', name: "H: 3 sets à 4 jeux - jeu décisif à 3/3 - point décisif" },
        { code:'I', name: "I: 3 sets à 5 jeux - jeu décisif à 4/4 - point décisif" }
    ];

    list(): MatchFormat[] {
        return this._matchFormats;
    }
}