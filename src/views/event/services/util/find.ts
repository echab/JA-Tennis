// Find service
interface IIndex {
    [key: string]: number;
    _length: number
}

export class Find {

    private static _reindex<T>(array: T[], member: string): void {

        var idx: IIndex = {
            _length: array.length
        };
        for (var i = 0; i < array.length; i++) {
            var a = array[i], j = a[member];
            if (j !== undefined) {
                idx[j] = i;
            }
        }
        array["_FindBy" + member] = idx;
    }

    /**
         * Returns the index of an object in the array. Or -1 if not found.
        */
    public static indexOf<T>(array: T[], member: string, value: any, error?: string): number {

        var i: number, a: T;

        if (null == value) {
            return null;
        }

        var idxName = "_FindBy" + member;
        if (!(idxName in array)) {
            Find._reindex(array, member);
        }

        var idx = array[idxName];

        if (!(value in idx) || idx._length !== array.length) {
            Find._reindex(array, member);
            a = array[idxName];
            i = a[value];
        } else {
            i = idx[value];
            a = array[i];
            if (a[member] !== value) {
                Find._reindex(array, member);
                a = array[idxName];
                i = a[value];
            }
        }

        if (error && i === undefined) {
            throw error;
        }

        return i !== undefined ? i : -1;
    }

    /**
         * Returns an object in the array by member. Or undefined if not found.
        */
    public static by<T>(array: T[], member: string, value: any, error?: string): T {
        var i = this.indexOf(array, member, value, error);
        return array[i];
    }

    public static byId<T>(array: T[], value: any, error?: string): T {
        var i = this.indexOf(array, "id", value, error);
        return array[i];
    }
}