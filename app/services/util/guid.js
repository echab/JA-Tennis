'use strict';
var jat;
(function (jat) {
    var service;
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
        angular.module('jat.services.guid', [])
            .service('guid', Guid);
    })(service = jat.service || (jat.service = {}));
})(jat || (jat = {}));
