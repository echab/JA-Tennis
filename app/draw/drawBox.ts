﻿'use strict';
module jat.draw {

    interface BoxAttributes extends ng.IAttributes {
        drawBox: string;
        pos: string;
    }

    class boxCtrl {

        box: models.Box;
        pos: IPosition;
        isMatch: boolean;

        isPlayed(): boolean {
            return this.isMatch && !!(<models.Match>this.box).score;
        }

        //constructor() {
        //}
    }

    function drawBoxDirective() {
        return {
            restrict: 'EA',
            scope: true,
            templateUrl: 'draw/drawBox.html',
            controller: boxCtrl,
            controllerAs: 'ctrlBox',
            link: (scope: ng.IScope, element: JQuery, attrs: BoxAttributes, ctrlBox: boxCtrl) => {

                scope.$watch(attrs.drawBox, (box: models.Box) => {
                    ctrlBox.box = box;
                    ctrlBox.isMatch = isMatch(box);
                });

                scope.$watch(attrs.pos, (pos: IPosition) => {
                    ctrlBox.pos = pos;
                });
            }
        };
    }

    function isMatch(box: models.Box): boolean {
        return box && ('score' in box);
    }

    angular.module('jat.draw.box', ['jat.services.find'])
        .directive('drawBox', drawBoxDirective);
} 