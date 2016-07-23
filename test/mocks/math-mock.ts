var count = 0;
var returns;

export var mathMock = {
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
        return returns[count++];
    }
}

Math.random = mathMock.random; //overwrite standard random method
