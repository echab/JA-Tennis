'use strict';
var jat;
(function (jat) {
    // Selection service
    (function (service) {
        var Selection = (function () {
            function Selection() {
            }
            Selection.prototype.select = function (r, type) {
                if (r) {
                    if (type === 6 /* Box */ || ('_player' in r && r._draw)) {
                        this.tournament = r._draw._event._tournament;
                        this.event = r._draw._event;
                        this.draw = r._draw;
                        this.box = r;
                    } else if (type === 4 /* Draw */ || r._event) {
                        this.tournament = r._event._tournament;
                        this.event = r._event;
                        this.draw = r;
                        this.box = undefined;
                    } else if (type === 3 /* Event */ || (r.draws && r._tournament)) {
                        this.tournament = r._tournament;
                        this.event = r;
                        this.draw = r.draws ? r.draws[0] : undefined;
                        this.box = undefined;
                    } else if (type === 2 /* Player */ || (r.name && r._tournament)) {
                        this.tournament = r._tournament;
                        this.player = r;
                    } else if (type === 1 /* Tournament */ || (r.players && r.events)) {
                        this.tournament = r;
                        if (this.tournament.events[0]) {
                            this.event = this.tournament.events[0];
                            this.draw = this.event && this.event.draws ? this.event.draws[this.event.draws.length - 1] : undefined;
                        } else {
                            this.event = undefined;
                            this.draw = undefined;
                        }
                        this.box = undefined;
                        if (this.player && this.player._tournament !== this.tournament) {
                            this.player = undefined;
                        }
                    }
                } else if (type) {
                    switch (type) {
                        case 1 /* Tournament */:
                            this.tournament = undefined;
                            this.player = undefined;
                        case 3 /* Event */:
                            this.event = undefined;
                        case 4 /* Draw */:
                            this.draw = undefined;
                        case 6 /* Box */:
                            this.box = undefined;
                            break;
                        case 2 /* Player */:
                            this.player = undefined;
                    }
                }
            };
            return Selection;
        })();
        service.Selection = Selection;

        angular.module('jat.services.selection', []).service('selection', Selection);
    })(jat.service || (jat.service = {}));
    var service = jat.service;
})(jat || (jat = {}));
//# sourceMappingURL=selection.js.map
