'use strict';
// Selection service
var jat;
(function (jat) {
    var service;
    (function (service) {
        var Selection = (function () {
            function Selection() {
            }
            Selection.prototype.select = function (r, type) {
                if (r) {
                    if (type === models.ModelType.Box || ('_player' in r && r._draw)) {
                        this.tournament = r._draw._event._tournament;
                        this.event = r._draw._event;
                        this.draw = r._draw;
                        this.box = r;
                    }
                    else if (type === models.ModelType.Draw || r._event) {
                        this.tournament = r._event._tournament;
                        this.event = r._event;
                        this.draw = r;
                        this.box = undefined;
                    }
                    else if (type === models.ModelType.Event || (r.draws && r._tournament)) {
                        this.tournament = r._tournament;
                        this.event = r;
                        this.draw = r.draws ? r.draws[0] : undefined;
                        this.box = undefined;
                    }
                    else if (type === models.ModelType.Player || (r.name && r._tournament)) {
                        this.tournament = r._tournament;
                        this.player = r;
                    }
                    else if (type === models.ModelType.Tournament || (r.players && r.events)) {
                        this.tournament = r;
                        if (this.tournament.events[0]) {
                            this.event = this.tournament.events[0];
                            this.draw = this.event && this.event.draws ? this.event.draws[this.event.draws.length - 1] : undefined;
                        }
                        else {
                            this.event = undefined;
                            this.draw = undefined;
                        }
                        this.box = undefined;
                        if (this.player && this.player._tournament !== this.tournament) {
                            this.player = undefined;
                        }
                    }
                }
                else if (type) {
                    switch (type) {
                        case models.ModelType.Tournament:
                            this.tournament = undefined;
                            this.player = undefined;
                        case models.ModelType.Event:
                            this.event = undefined;
                        case models.ModelType.Draw:
                            this.draw = undefined;
                        case models.ModelType.Box:
                            this.box = undefined;
                            break;
                        case models.ModelType.Player:
                            this.player = undefined;
                    }
                }
            };
            return Selection;
        })();
        service.Selection = Selection;
        angular.module('jat.services.selection', [])
            .service('selection', Selection);
    })(service = jat.service || (jat.service = {}));
})(jat || (jat = {}));
