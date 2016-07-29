import { autoinject, bindable } from 'aurelia-framework';
import { DialogController } from 'aurelia-dialog';

import { LibLocator } from '../../services/libLocator';
import { Find } from '../../services/util/find';
import { matchFormat } from '../../services/types';

interface MatchModel {
    title: string;
    match: Match;
};

@autoinject
export class DialogMatch {

    private title: string;
    private match: Match;

    player1: Player;
    player2: Player;
    places: string[];
    matchFormats: { [code: string]: MatchFormat };

    constructor(private controller: DialogController) {
        this.matchFormats = matchFormat.list();
    }

    activate(model: MatchModel) {
        this.title = model.title;
        this.match = model.match;

        var tournament = model.match._draw._event._tournament;

        var lib = LibLocator.drawLibFor(model.match._draw);

        var opponents = lib.boxesOpponents(model.match);
        this.player1 = Find.byId(tournament.players, opponents.box1.playerId);
        this.player2 = Find.byId(tournament.players, opponents.box2.playerId);

        this.places = tournament.places;
    }
}