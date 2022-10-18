import { isArray, isDate, isObject} from '../services/util/object';

export function copy(source: any, destination?: any) {
    if (!destination) {
        destination = source;
        if (source) {
            if (isArray(source)) {
                destination = copy(source, []);
            } else if (isDate(source)) {
                destination = new Date(source.getTime());
            } else if (isObject(source)) {
                destination = copy(source, {});
            }
        }
    } else {
        if (source === destination) throw Error("Can't copy equivalent objects or arrays");
        if (isArray(source)) {
            destination.length = 0;
            for (var i = 0; i < source.length; i++) {
                destination.push(copy(source[i]));
            }
        } else {
            for (var key in source) {
                if (source.hasOwnProperty(key) && "_$".indexOf(key.charAt(0)) == -1) {  //ignore prefixes _ and $
                    destination[key] = copy(source[key]);
                }
            }
        }
    }
    return destination;
}

export function shuffle<T>(array: T[], from = 0, toExlusive = array.length): T[] {
    var n = toExlusive - from;
    if (n == 2) {
        //if only two elements, swap them
        [array[0],array[1]] = [array[1],array[0]];
        // var tmp = array[0];
        // array[0] = array[1];
        // array[1] = tmp;
    } else {
        for (var i = toExlusive - 1; i > from; i--) {
            var t = from + Math.floor(n * Math.random());
            [array[t],array[i]] = [array[i],array[t]];
            // var tmp = array[t];
            // array[t] = array[i];
            // array[i] = tmp;
        }
    }
    return array;
}

export function filledArray(size: number, value=0): number[] {
    return Array(size).fill(value);
}

export function hashById<T extends { id: string }>(array: T[]): { [id: string]: T } {
    if (!array) {
        return {};
    }
    var a: { [id: string]: T } = {};
    for (var i = array.length - 1; i >= 0; i--) {
        var elem = array[i];
        if (elem.id) {
            a[<string>elem.id] = elem;
        }
    }
    return a;
}