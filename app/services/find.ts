'use strict';

// Find service

module jat.service {

    interface IIndex {
        [key: string]: number;
        _length: number
    }

    export class Find {

        private static _reindex<T>(array: any, member: string): void {

            var idx: IIndex = {
                _length: array.length
            };
            for (var i = 0; i < array.length; i++) {
                var a: any = array[i];
                if (a !== undefined) {
                    idx[a[member]] = i;
                }
            }
            array["_FindBy" + member] = idx;
        }

        /**
          * Returns the index of an object in the array. Or -1 if not found.
          */
        public indexOf<T>(array: T[], member: string, value: any, error?: string): number {

            var i: number, a: any;

            if (null == value) {
                return null;
            }

            var idxName: string = "_FindBy" + member;
            if (!(idxName in <any>array)) {
                Find._reindex(array, member);
            }

            var idx: any = array[<any>idxName];

            if (!(value in idx) || idx._length !== array.length) {
                Find._reindex(array, member);
                a = array[<any>idxName];
                i = a[value];
            } else {
                i = idx[value];
                a = array[i];
                if (a[<any>member] !== value) {
                    Find._reindex(array, member);
                    a = array[<any>idxName];
                    i = a[<any>value];
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
        public by<T>(array: T[], member: string, value: any, error?: string): T {
            var i = this.indexOf(array, member, value, error);
            return array[i];
        }

        public byId<T>(array: T[], value: any, error?: string): T {
            var i = this.indexOf(array, "id", value, error);
            return array[i];
        }
    }

    angular.module('jat.services.find', [])
        .service('find', Find);
}