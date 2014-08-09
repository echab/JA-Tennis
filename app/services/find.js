'use strict';
var jat;
(function (jat) {
    // Find service
    (function (service) {
        var Find = (function () {
            function Find() {
            }
            Find._reindex = function (array, member) {
                var idx = {
                    _length: array.length
                };
                for (var i = 0; i < array.length; i++) {
                    var a = array[i];
                    idx[a[member]] = i;
                }
                array["_FindBy" + member] = idx;
            };

            /**
            * Returns the index of an object in the array. Or -1 if not found.
            */
            Find.prototype.indexOf = function (array, member, value, error) {
                var i, a;

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
            };

            /**
            * Returns an object in the array by member. Or undefined if not found.
            */
            Find.prototype.by = function (array, member, value, error) {
                var i = this.indexOf(array, member, value, error);
                return array[i];
            };

            Find.prototype.byId = function (array, value, error) {
                var i = this.indexOf(array, "id", value, error);
                return array[i];
            };
            return Find;
        })();
        service.Find = Find;

        angular.module('jat.services.find', []).service('find', Find);
    })(jat.service || (jat.service = {}));
    var service = jat.service;
})(jat || (jat = {}));
//# sourceMappingURL=find.js.map
