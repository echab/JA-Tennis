define(["require", "exports"], function (require, exports) {
    "use strict";
    var GuidMock = (function () {
        function GuidMock() {
            this.count = 0;
        }
        /** Create an unique identifier */
        GuidMock.prototype.create = function (prefix) {
            return (prefix || '') + (this.count++);
        };
        return GuidMock;
    }());
    exports.GuidMock = GuidMock;
});