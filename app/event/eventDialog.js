/// <reference path="../../lib/typescript/angular/angular.d.ts" />
/// <reference path="../../lib/declarations.d.ts" />
/// <reference path="../../services/selection.ts" />
/// <reference path="../../services/fft.ts" />
/// <reference path="../../models/event.ts" />
'use strict';
angular.module('jat.views.dialogs.eventDialog', []).directive('event', function () {
    var dir = {
        templateUrl: 'views/event.html',
        replace: true,
        restrict: //transclude: false,
        'E',
        scope: {
            show: "=",
            title: "@",
            event: "=",
            ok: "&",
            removeEvent: "&"
        },
        link: function postLink(scope, element, attrs, ctrl) {
            //console.info("event directive: link");
            scope.close = function () {
                scope.show = false;
            };
        }
    };
    return dir;
});
//@ sourceMappingURL=eventDialog.js.map
