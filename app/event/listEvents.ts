'use strict';
module jat.event {

    function listEventsDirective() {
        var dir = {
            templateUrl: 'event/listEvents.html',
            controller: 'listEventsCtrl',
            controllerAs: 'list',
            restrict: 'EA',
            scope: true,
            link: (scope: ng.IScope, element: JQuery, attrs: any, controller: listEventsCtrl) => {
                scope.$watch(attrs.listEvents, (newValue: models.Event[], oldValue: models.Event[], scope: ng.IScope) => {
                    controller.events = newValue;
                });
            }
        };
        return dir;
    }

    class listEventsCtrl {
        events: models.Event[];

        //static $inject = ['selection'];
        //constructor(selection: jat.service.Selection) {
        //}
    }

    angular.module('jat.event.list', [])
        .directive('listEvents', listEventsDirective)
        .controller('listEventsCtrl', listEventsCtrl)
    ;
}