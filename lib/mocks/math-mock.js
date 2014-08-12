angular.module('math.mock', []).factory('math', function () {   'use strict';

    var count = 0;
    var returns;

    var mathMock = {
        randomReturns: function (values) {
            count = 0;
            returns = values;
        },

        random: function () {
            if (!returns || !returns.length) {
                throw 'Mock Math.random no return value specified, should call math.randomReturn()';
            }
            if (count >= returns.length) {
                throw 'Mock Math.random no enough values';
            }
            //console.log('random: ' + returns[count]);
            return returns[count++];
        }
    }

    Math.random = mathMock.random; //overwrite standard random method

    return mathMock;
});
