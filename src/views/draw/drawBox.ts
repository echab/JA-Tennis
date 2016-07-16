'use strict';
module jat.draw {

    interface BoxAttributes extends ng.IAttributes {
        drawBox: string;
    }

    class boxCtrl {

        box: Box;
        isMatch: boolean;
        error: IError;

        isPlayed(): boolean {
            return this.isMatch && !!(<Match>this.box).score;
        }

        //constructor() {
        //}
    }

    function drawBoxDirective(validation: jat.service.Validation): ng.IDirective {
        return {
            restrict: 'EA',
            scope: true,
            templateUrl: 'views/draw/drawBox.html',
            controller: boxCtrl,
            controllerAs: 'ctrlBox',
            link: (scope: ng.IScope, element: JQuery, attrs: BoxAttributes, ctrlBox: boxCtrl) => {

                scope.$watch(attrs.drawBox, (box: Box) => {
                    ctrlBox.box = box;
                    ctrlBox.isMatch = isMatch(box);
                    ctrlBox.error = validation.getErrorBox(box);
                });
            }
        };
    }

    function isMatch(box: Box): boolean {
        return box && ('score' in box);
    }

    angular.module('jat.draw.box', ['jat.services.find'])
        .directive('drawBox', ['validation',drawBoxDirective]);
} 