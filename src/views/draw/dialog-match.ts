import {autoinject} from 'aurelia-framework';
import {bindable} from 'aurelia-framework';

import { Services } from '../../services/services';
import { Find } from '../../services/util/find';
import { matchFormat } from '../../services/types';

@autoinject
export class DialogMatch {
    player1: Player;
    player2: Player;
    places: string[];
    matchFormats: { [code: string]: MatchFormat };

    constructor(
        private title: string,
        private match: Match,
        ) {

        var tournament = match._draw._event._tournament;

        var drawLib = Services.drawLibFor(match._draw);
        
        var opponents = drawLib.boxesOpponents(match);
        this.player1 = Find.byId(tournament.players, opponents.box1.playerId);
        this.player2 = Find.byId(tournament.players, opponents.box2.playerId);

        this.places = tournament.places;
        this.matchFormats = matchFormat.list();
    }
}