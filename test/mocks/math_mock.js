define(["require", "exports"], function (require, exports) {
    "use strict";
    var count = 0;
    var returns;
    var mathMock = (function () {
        function mathMock() {
        }
        mathMock.randomReturns = function (values) {
            count = 0;
            returns = values;
        };
        mathMock.random = function () {
            if (!returns || !returns.length) {
                //throw 'Mock Math.random no return value specified, should call math.randomReturn()';
                return oldRandow();
            }
            if (count >= returns.length) {
                throw 'Mock Math.random no enough values';
            }
            return returns[count++];
        };
        return mathMock;
    }());
    exports.mathMock = mathMock;
    var oldRandow = Math.random;
    Math.random = mathMock.random; //overwrite standard random method
});
