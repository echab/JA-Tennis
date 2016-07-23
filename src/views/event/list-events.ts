// function listEventsDirective(): ng.IDirective {
//     var dir = {
//         templateUrl: 'views/event/listEvents.html',
//         controller: 'listEventsCtrl',
//         controllerAs: 'list',
//         restrict: 'EA',
//         scope: true,
//         link: (scope: ng.IScope, element: JQuery, attrs: any, controller: listEventsCtrl) => {
//             scope.$watch(attrs.listEvents, (newValue: TEvent[], oldValue: TEvent[], scope: ng.IScope) => {
//                 controller.events = newValue;
//             });
//         }
//     };
//     return dir;
// }

export class ListEvents {
    events: TEvent[];

    //static $inject = ['selection'];
    //constructor(selection: Selection) {
    //}
}