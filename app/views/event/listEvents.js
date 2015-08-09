'use strict';
var jat;
(function (jat) {
    var event;
    (function (event) {
        function listEventsDirective() {
            var dir = {
                templateUrl: 'views/event/listEvents.html',
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
        angular.module('jat.event.list', [])
            .directive('listEvents', listEventsDirective)
            .controller('listEventsCtrl', listEventsCtrl);
    })(event = jat.event || (jat.event = {}));
})(jat || (jat = {}));
