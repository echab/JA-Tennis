'use strict';
var jat;
(function (jat) {
    var draw;
    (function (draw) {
        var boxCtrl = (function () {
            function boxCtrl() {
            }
            boxCtrl.prototype.isPlayed = function () {
                return this.isMatch && !!this.box.score;
            };
            return boxCtrl;
        })();
        function drawBoxDirective(validation) {
            return {
                restrict: 'EA',
                scope: true,
                templateUrl: 'views/draw/drawBox.html',
                controller: boxCtrl,
                controllerAs: 'ctrlBox',
                link: function (scope, element, attrs, ctrlBox) {
                    scope.$watch(attrs.drawBox, function (box) {
                        ctrlBox.box = box;
                        ctrlBox.isMatch = isMatch(box);
                        ctrlBox.error = validation.getErrorBox(box);
                    });
                }
            };
        }
        function isMatch(box) {
            return box && ('score' in box);
        }
        angular.module('jat.draw.box', ['jat.services.find'])
            .directive('drawBox', ['validation', drawBoxDirective]);
    })(draw = jat.draw || (jat.draw = {}));
})(jat || (jat = {}));
