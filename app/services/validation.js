var jat;
(function (jat) {
    (function (service) {
        var Validation = (function () {
            function Validation() {
                this._validLibs = [];
                this._errors = [];
            }
            Validation.prototype.addValidator = function (validator) {
                this._validLibs.push(validator);
            };

            Validation.prototype.validatePlayer = function (player) {
                var res = true;
                for (var i = 0; i < this._validLibs.length; i++) {
                    res = res && this._validLibs[i].validatePlayer(player);
                }
                return res;
            };

            Validation.prototype.validateDraw = function (draw) {
                var res = true;
                for (var i = 0; i < this._validLibs.length; i++) {
                    res = res && this._validLibs[i].validateDraw(draw);
                }
                return res;
            };

            Validation.prototype.error = function (message, player_draw, box, detail) {
                var a = [];
                a.push('Validation error on', player_draw.name);
                if (box && box._player) {
                    a.push('for', box._player.name);
                }
                if (detail) {
                    a.push('(' + detail + ')');
                }
                a.push(':', message);
                console.warn(a.join(' '));

                if ('boxes' in player_draw) {
                    this._errors.push({ message: message, player: box ? box._player : undefined, draw: box._draw, box: box, detail: detail });
                } else {
                    this._errors.push({ message: message, player: player_draw });
                }
            };

            Validation.prototype.reset = function () {
                this._errors.splice(0, this._errors.length);
            };
            return Validation;
        })();
        service.Validation = Validation;

        angular.module('jat.services.validation', []).factory('validation', function () {
            return new Validation();
        });
    })(jat.service || (jat.service = {}));
    var service = jat.service;
})(jat || (jat = {}));
//# sourceMappingURL=validation.js.map
