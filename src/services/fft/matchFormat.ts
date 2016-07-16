import { MatchFormats} from '../../models/types';

export class MatchFormatFFT implements MatchFormats {

    private _matchFormats: { [code: string]: MatchFormat } = {
        "A": { code:'A', name: "A: traditionnel (3 sets à 6 jeux)" },
        "B": { code:'B', name: "B: traditionnel (3 sets à 6 jeux) - point décisif" },
        "C": { code:'C', name: "C: 3 sets à 4 jeux - jeu décisif à 4/4" },
        "D": { code:'D', name: "D: 3 sets à 4 jeux - jeu décisif à 4/4 - point décisif" },
        "E": { code:'E', name: "E: 3 sets à 3 jeux - jeu décisif à 2/2" },
        "F": { code:'F', name: "F: 3 sets à 3 jeux - jeu décisif à 2/2 - point décisif" },
        "G": { code:'G', name: "G: 3 jeux décisif" },
        "H": { code:'H', name: "H: 3 sets à 4 jeux - jeu décisif à 3/3 - point décisif" },
        "I": { code:'I', name: "I: 3 sets à 5 jeux - jeu décisif à 4/4 - point décisif" }
    };

    list(): { [code: string]: MatchFormat } {
        return this._matchFormats;
    }
}

// angular.module('jat.services.fft.matchFormat', [])
//     .service('matchFormat', MatchFormatFFT);