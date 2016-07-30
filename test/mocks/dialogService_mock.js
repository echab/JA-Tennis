define(["require", "exports"], function (require, exports) {
    "use strict";
    var DialogServiceMock = (function () {
        function DialogServiceMock() {
            this.wasCancelled = false;
            this.controllers = [];
            this.hasActiveDialog = true;
        }
        DialogServiceMock.prototype.ok = function (result) {
            this.wasCancelled = false;
            this.result = result;
        };
        DialogServiceMock.prototype.cancel = function (result) {
            this.wasCancelled = true;
            this.result = result;
        };
        DialogServiceMock.prototype.open = function (settings) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                resolve({
                    wasCancelled: _this.wasCancelled,
                    output: _this.result
                });
            });
        };
        DialogServiceMock.prototype.openAndYieldController = function (settings) {
            return new Promise(function (resolve, reject) {
                //TODO
            });
        };
        return DialogServiceMock;
    }());
    exports.DialogServiceMock = DialogServiceMock;
});