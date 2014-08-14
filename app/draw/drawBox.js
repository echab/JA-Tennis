'use strict';
var jat;
(function (jat) {
    (function (draw) {
        var boxCtrl = (function () {
            function boxCtrl() {
            }
            boxCtrl.prototype.isPlayed = function () {
                return this.isMatch && !!this.box.score;
            };
            return boxCtrl;
        })();

        function drawBoxDirective() {
            return {
                restrict: 'EA',
                scope: true,
                templateUrl: 'draw/drawBox.html',
                controller: boxCtrl,
                controllerAs: 'ctrlBox',
                link: function (scope, element, attrs, ctrlBox) {
                    scope.$watch(attrs.drawBox, function (box) {
                        ctrlBox.box = box;
                        ctrlBox.isMatch = isMatch(box);
                    });

                    scope.$watch(attrs.pos, function (pos) {
                        ctrlBox.pos = pos;
                    });
                }
            };
        }

        function isMatch(box) {
            return box && ('score' in box);
        }

        angular.module('jat.draw.box', ['jat.services.find']).directive('drawBox', drawBoxDirective);
    })(jat.draw || (jat.draw = {}));
    var draw = jat.draw;
})(jat || (jat = {}));
//# sourceMappingURL=drawBox.js.map
