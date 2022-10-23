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
            for (let i = 0; i < source.length; i++) {
                destination.push(copy(source[i]));
            }
        } else {
            for (let key in source) {
                if (source.hasOwnProperty(key) && "_$".indexOf(key.charAt(0)) == -1) {  //ignore prefixes _ and $
                    destination[key] = copy(source[key]);
                }
            }
        }
    }
    return destination;
}

export function shuffle<T>(array: T[], from = 0, toExlusive = array.length): T[] {
    const n = toExlusive - from;
    if (n == 2) {
        //if only two elements, swap them
        [array[0],array[1]] = [array[1],array[0]];
        // const tmp = array[0];
        // array[0] = array[1];
        // array[1] = tmp;
    } else {
        for (let i = toExlusive - 1; i > from; i--) {
            const t = from + Math.floor(n * Math.random());
            [array[t],array[i]] = [array[i],array[t]];
            // const tmp = array[t];
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
    const a: { [id: string]: T } = {};
    for (let i = array.length - 1; i >= 0; i--) {
        const elem = array[i];
        if (elem.id) {
            a[elem.id] = elem;
        }
    }
    return a;
}