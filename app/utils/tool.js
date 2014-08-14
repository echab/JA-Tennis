var tool;
(function (tool) {
    function shuffle(array, from, toExlusive) {
        from = from || 0;
        if (arguments.length < 3) {
            toExlusive = array.length;
        }

        var n = toExlusive - from;
        if (n == 2) {
            //if only two elements, swap them
            var tmp = array[0];
            array[0] = array[1];
            array[1] = tmp;
        } else {
            for (var i = toExlusive - 1; i > from; i--) {
                var t = from + Math.floor(n * Math.random());
                var tmp = array[t];
                array[t] = array[i];
                array[i] = tmp;
            }
        }
        return array;
    }
    tool.shuffle = shuffle;

    function filledArray(size, value) {
        var a = new Array(size);
        for (var i = size - 1; i >= 0; i--) {
            a[i] = 0;
        }
        return a;
    }
    tool.filledArray = filledArray;

    function hashById(array) {
        if (!array) {
            return;
        }
        var a = {};
        for (var i = array.length - 1; i >= 0; i--) {
            var elem = array[i];
            if (elem.id) {
                a[elem.id] = elem;
            }
        }
        return a;
    }
    tool.hashById = hashById;
})(tool || (tool = {}));
//# sourceMappingURL=tool.js.map
