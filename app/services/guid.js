'use strict';
var jat;
(function (jat) {
    (function (service) {
        var Guid = (function () {
            function Guid() {
            }
            /** Create an unique identifier */
            Guid.prototype.create = function (prefix) {
                return (prefix || '') + Math.round(Math.random() * 999);
            };
            return Guid;
        })();
        service.Guid = Guid;
    })(jat.service || (jat.service = {}));
    var service = jat.service;
})(jat || (jat = {}));
//# sourceMappingURL=guid.js.map
