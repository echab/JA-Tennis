'use strict';
var jat;
(function (jat) {
    (function (event) {
        function listEventsDirective() {
            var dir = {
                templateUrl: 'event/listEvents.html',
                controller: 'listEventsCtrl',
                controllerAs: 'list',
                restrict: 'EA',
                scope: true,
                link: function (scope, element, attrs, controller) {
                    scope.$watch(attrs.listEvents, function (newValue, oldValue, scope) {
                        controller.events = newValue;
                    });
                }
            };
            return dir;
        }

        var listEventsCtrl = (function () {
            function listEventsCtrl() {
            }
            return listEventsCtrl;
        })();

        angular.module('jat.event.list', []).directive('listEvents', listEventsDirective).controller('listEventsCtrl', listEventsCtrl);
    })(jat.event || (jat.event = {}));
    var event = jat.event;
})(jat || (jat = {}));
//# sourceMappingURL=listEvents.js.map
