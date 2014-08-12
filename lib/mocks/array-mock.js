angular.module('array.sort.mock', []).factory('array', function () {
    'use strict';

    var compareDefault = function (left, right) {
        if (left == right) {
            return 0;
        }
        return left < right ? -1 : 1;
    };

    var arrayMock = {
        sort: function (compare) {

            //console.log('Merge sort: ' + this.reduce(function(prev, cur) { return prev + ',' + cur; }));

            var length = this.length,
                middle = Math.floor(length / 2);

            if (!compare) {
                compare = compareDefault;
            }

            if (length < 2) {
                return this;
            }

            var result = merge(
                this.slice(0, middle).sort(compare),
                this.slice(middle, length).sort(compare),
                compare
            );

            //sort in place and return
            result.unshift(0, this.length);
            this.splice.apply(this, result);
            return this;
        }
    };

    function merge(left, right, compare) {

        var result = [];

        while (left.length > 0 || right.length > 0) {
            if (left.length > 0 && right.length > 0) {
                if (compare(left[0], right[0]) <= 0) {
                    result.push(left[0]);
                    left = left.slice(1);
                } else {
                    result.push(right[0]);
                    right = right.slice(1);
                }
            } else if (left.length > 0) {
                result.push(left[0]);
                left = left.slice(1);
            } else if (right.length > 0) {
                result.push(right[0]);
                right = right.slice(1);
            }
        }
        return result;
    }

    Array.prototype.sort = arrayMock.sort; //overwrite standard sort method

    return arrayMock;
});
