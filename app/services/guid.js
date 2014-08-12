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

        angular.module('jat.services.guid', []).service('guid', Guid);
    })(jat.service || (jat.service = {}));
    var service = jat.service;
})(jat || (jat = {}));
//# sourceMappingURL=guid.js.map
