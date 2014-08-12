'use strict';
var mock;
(function (mock) {
    var GuidMock = (function () {
        function GuidMock() {
            this.count = 0;
        }
        /** Create an unique identifier */
        GuidMock.prototype.create = function (prefix) {
            return (prefix || '') + (this.count++);
        };
        return GuidMock;
    })();
    mock.GuidMock = GuidMock;

    angular.module('jat.services.guid.mock', []).service('guid', GuidMock);
})(mock || (mock = {}));
//# sourceMappingURL=guid-mock.js.map
