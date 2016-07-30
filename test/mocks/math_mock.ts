var count = 0;
var returns;

export class mathMock {
    static randomReturns(values) {
        count = 0;
        returns = values;
    }

    static random() {
        if (!returns || !returns.length) {
            //throw 'Mock Math.random no return value specified, should call math.randomReturn()';
            return oldRandow();
        }
        if (count >= returns.length) {
            throw 'Mock Math.random no enough values';
        }
        return returns[count++];
    }
}

var oldRandow = Math.random;
Math.random = mathMock.random; //overwrite standard random method