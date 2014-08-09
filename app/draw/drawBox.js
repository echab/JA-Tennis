'use strict';
var jat;
(function (jat) {
    (function (draw) {
        var boxCtrl = (function () {
            function boxCtrl(find) {
                this.find = find;
            }
            boxCtrl.prototype.getPlayer = function (id) {
                if (this.box && this.box._draw) {
                    return this.find.byId(this.box._draw._event._tournament.players, id);
                }
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
                        ctrlBox.player = box ? ctrlBox.getPlayer(box.playerId) : undefined;
                        ctrlBox.isMatch = box && "score" in box; //isMatch();
                        ctrlBox.played = ctrlBox.isMatch && !!box.score;
                    });

                    scope.$watch(attrs.pos, function (pos) {
                        ctrlBox.pos = pos;
                    });
                }
            };
        }

        angular.module('jat.draw.box', ['jat.services.find']).directive('drawBox', drawBoxDirective);
    })(jat.draw || (jat.draw = {}));
    var draw = jat.draw;
})(jat || (jat = {}));
//# sourceMappingURL=drawBox.js.map
