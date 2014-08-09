'use strict';

// Selection service

module jat.service {

    export class Selection {
        public tournament: models.Tournament;
        public event: models.Event;
        public draw: models.Draw;
        public match: models.Match;
        public player: models.Player;
    }

    angular.module('jat.services.selection', [])
        .service('selection', Selection);
}