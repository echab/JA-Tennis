module tool {

    export function shuffle<T>(array: T[], from?: number, toExlusive?: number): T[] {
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

    export function filledArray(size: number, value: number): number[] {
        var a = new Array(size);
        for (var i = size - 1; i >= 0; i--) {
            a[i] = 0;
        }
        return a;
    }

} 