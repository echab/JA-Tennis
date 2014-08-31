var jat;
(function (jat) {
    (function (service) {
        var Validation = (function () {
            function Validation(find) {
                this.find = find;
                this._validLibs = [];
                this._errorsDraw = {};
                this._errorsPlayer = {};
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

            Validation.prototype.errorPlayer = function (message, player, detail) {
                var a = [];
                a.push('Validation error on', player.name);
                if (detail) {
                    a.push('(' + detail + ')');
                }
                a.push(':', message);
                console.warn(a.join(' '));

                var c = this._errorsPlayer[player.id];
                if (!c) {
                    c = this._errorsPlayer[player.id] = [];
                }
                c.push({ message: message, player: player, detail: detail });
            };

            Validation.prototype.errorDraw = function (message, draw, box, detail) {
                var a = [];
                a.push('Validation error on', draw.name);
                if (box && box._player) {
                    a.push('for', box._player.name);
                }
                if (detail) {
                    a.push('(' + detail + ')');
                }
                a.push(':', message);
                console.warn(a.join(' '));

                var c = this._errorsDraw[draw.id];
                if (!c) {
                    c = this._errorsDraw[draw.id] = [];
                }
                c.push({ message: message, player: box ? box._player : undefined, position: box ? box.position : undefined, detail: detail });
            };

            Validation.prototype.hasErrorDraw = function (draw) {
                var c = draw && this._errorsDraw[draw.id];
                return c && c.length > 0;
            };

            Validation.prototype.hasErrorBox = function (box) {
                var c = box && this._errorsDraw[box._draw.id];
                if (c) {
                    var e = this.find.by(c, 'position', box.position);
                }
                return !!e;
            };

            Validation.prototype.getErrorDraw = function (draw) {
                return draw && this._errorsDraw[draw.id];
            };

            Validation.prototype.getErrorBox = function (box) {
                var c = box && this._errorsDraw[box._draw.id];
                if (c) {
                    return this.find.by(c, 'position', box.position);
                }
            };

            Validation.prototype.resetPlayer = function (player) {
                if (player) {
                    delete this._errorsPlayer[player.id];
                } else {
                    this._errorsPlayer = {};
                }
            };

            Validation.prototype.resetDraw = function (draw) {
                if (draw) {
                    delete this._errorsDraw[draw.id];
                } else {
                    this._errorsDraw = {};
                }
            };
            return Validation;
        })();
        service.Validation = Validation;

        angular.module('jat.services.validation', ['jat.services.find']).factory('validation', function (find) {
            return new Validation(find);
        });
    })(jat.service || (jat.service = {}));
    var service = jat.service;
})(jat || (jat = {}));
//# sourceMappingURL=validation.js.map
