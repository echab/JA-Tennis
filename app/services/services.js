var jat;
(function (jat) {
    var service;
    (function (service) {
        var Services = (function () {
            function Services() {
                this._drawLibs = [];
            }
            Services.prototype.registerDrawlib = function (drawLib) {
                this._drawLibs.push(drawLib);
            };
            Services.prototype.drawLibFor = function (draw) {
                for (var i = this._drawLibs.length - 1; i >= 0; i--) {
                    var drawLib = this._drawLibs[i];
                    if (drawLib.manage(draw)) {
                        return drawLib;
                    }
                }
                return;
            };
            return Services;
        })();
        service.Services = Services;
        angular.module('jat.services.services', [])
            .service('services', Services);
    })(service = jat.service || (jat.service = {}));
})(jat || (jat = {}));
