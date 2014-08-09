'use strict';
module jat.event {

    interface ListEventsScope extends ng.IScope {
        list: listEventsCtrl;
    }

    function listEventsDirective() {
        var dir = {
            templateUrl: 'event/listEvents.html',
            controller: 'listEventsCtrl',
            controllerAs: 'list',
            restrict: 'EA',
            scope: true,
            link: (scope: ListEventsScope, element: JQuery, attrs: any, controller: any) => {
                scope.$watch(attrs.listEvents, (newValue: models.Event[], oldValue: models.Event[], scope: ListEventsScope) => {
                    scope.list.events = newValue;
                });
            }
        };
        return dir;
    }

    class listEventsCtrl {
        events: models.Event[];
        constructor(selection: jat.service.Selection) {
            //console.log("Events controller: cntr");
        }
    }

    angular.module('jat.event.list', [])
        .directive('listEvents', listEventsDirective)
        .controller('listEventsCtrl', listEventsCtrl)
    ;
}