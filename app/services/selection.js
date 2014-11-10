'use strict';
var jat;
(function (jat) {
    // Selection service
    (function (service) {
        var Selection = (function () {
            function Selection() {
            }
            return Selection;
        })();
        service.Selection = Selection;

        angular.module('jat.services.selection', []).service('selection', Selection);
    })(jat.service || (jat.service = {}));
    var service = jat.service;
})(jat || (jat = {}));
//# sourceMappingURL=selection.js.map
