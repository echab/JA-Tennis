'use strict';
var jat;
(function (jat) {
    var service;
    (function (service) {
        var Selection = (function () {
            function Selection(find) {
                this.find = find;
            }
            Selection.prototype.select = function (r, type) {
                if (!r) {
                    this.unselect(type);
                    return;
                }
                if (type === models.ModelType.Box || ('_player' in r && r._draw)) {
                    var b = r;
                    this.tournament = b._draw._event._tournament;
                    this.event = b._draw._event;
                    this.draw = b._draw;
                    this.box = b;
                }
                else if (type === models.ModelType.Draw || r._event) {
                    var d = r;
                    this.tournament = d._event._tournament;
                    this.event = d._event;
                    this.draw = d;
                    this.box = undefined;
                }
                else if (type === models.ModelType.Event || (r.draws && r._tournament)) {
                    var e = r;
                    this.tournament = e._tournament;
                    this.event = e;
                    this.draw = e.draws ? e.draws[0] : undefined;
                    this.box = undefined;
                }
                else if (type === models.ModelType.Player || (r.name && r._tournament)) {
                    var p = r;
                    this.tournament = p._tournament;
                    this.player = p;
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
            };
            Selection.prototype.unselect = function (type) {
                //if (type) {
                //cases cascade, without breaks.
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
                //}
            };
            Selection.prototype.selectByError = function (draw, error) {
                if (error.position) {
                    var box = this.find.by(draw.boxes, 'position', error.position);
                    this.select(box, models.ModelType.Box);
                }
                else if (error.player) {
                    this.select(error.player, models.ModelType.Player);
                }
                else {
                    this.select(draw, models.ModelType.Draw);
                }
            };
            return Selection;
        })();
        service.Selection = Selection;
        angular.module('jat.services.selection', ['jat.services.find'])
            .factory('selection', [
            'find',
            function (find) {
                return new Selection(find);
            }
        ]);
    })(service = jat.service || (jat.service = {}));
})(jat || (jat = {}));
