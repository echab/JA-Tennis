'use strict';
var jat;
(function (jat) {
    (function (_draw) {
        var drawCtrl = (function () {
            function drawCtrl(drawLib, knockout, roundrobin, find) {
                this.drawLib = drawLib;
                this.knockout = knockout;
                this.roundrobin = roundrobin;
                this.find = find;
                this.boxWidth = 150;
                this.boxHeight = 40;
                this.interBoxWidth = 10;
                this.interBoxHeight = 10;
                this.simple = false;
            }
            drawCtrl.prototype.computeCoordinates = function () {
                if (!this.draw) {
                    return;
                }
                var draw = this.draw;
                var size = this.drawLib.getSize(draw);
                this.width = size.width * this.boxWidth - this.interBoxWidth;
                this.height = size.height * this.boxHeight;

                draw._points = this.drawLib.computePositions(draw); //TODO to be moved into drawLib when draw changes
                this._refresh = new Date(); //to refresh lines

                if (!this.isKnockout) {
                    //for roundrobin, fill the list of rows/columns for the view
                    var n = draw.nbColumn;
                    this.rows = new Array(n);
                    for (var r = 0; r < n; r++) {
                        var cols = new Array(n + 1);

                        var b = (n + 1) * n - r - 1;
                        for (var c = 0; c <= n; c++) {
                            cols[c] = b;
                            b -= n;
                        }
                        this.rows[r] = cols;
                    }
                }
            };

            drawCtrl.prototype.drawLines = function (canvas) {
                canvas.attr('width', this.width).attr('height', this.height);
                var draw = this.draw;
                if (!draw || !draw.boxes || !draw.boxes.length || 2 <= draw.type) {
                    return;
                }

                //draw the lines...
                var ctx = canvas[0].getContext('2d');
                ctx.lineWidth = .5;
                ctx.translate(.5, .5);
                var boxHeight2 = this.boxHeight >> 1;

                for (var i = draw.boxes.length - 1; i >= 0; i--) {
                    var box = draw.boxes[i];
                    var x = box._x * this.boxWidth, y = box._y * this.boxHeight;

                    if (isMatch(box)) {
                        var opponent = positionOpponents(box.position);
                        var p1 = draw._points[opponent.pos1], p2 = draw._points[opponent.pos2];
                        if (p1 && p2) {
                            ctx.moveTo(x - this.interBoxWidth, p1.y * this.boxHeight + boxHeight2);
                            ctx.lineTo(x, y + boxHeight2);
                            ctx.lineTo(x - this.interBoxWidth, p2.y * this.boxHeight + boxHeight2);
                            ctx.stroke();
                        }
                    }
                    ctx.moveTo(x, y + boxHeight2);
                    ctx.lineTo(x + this.boxWidth - this.interBoxWidth, y + boxHeight2);
                    ctx.stroke();
                }
            };

            drawCtrl.prototype.getBox = function (position) {
                if (this.draw && this.draw.boxes) {
                    return this.find.by(this.draw.boxes, 'position', position);
                }
            };
            drawCtrl.prototype.isDiag = function (position) {
                if (this.draw) {
                    var n = this.draw.nbColumn;
                    return (position % n) * (n + 1) === position;
                }
            };
            drawCtrl.prototype.range = function (min, max, step) {
                step = step || 1;
                var a = [];
                for (var i = min; i <= max; i += step) {
                    a.push(i);
                }
                return a;
            };
            return drawCtrl;
        })();

        function isMatch(box) {
            return box && ('score' in box);
        }

        function positionOpponents(pos) {
            return {
                pos1: (pos << 1) + 2,
                pos2: (pos << 1) + 1
            };
        }

        function drawDirective() {
            return {
                restrict: 'EA',
                scope: true,
                templateUrl: 'draw/drawDraw.html',
                controller: ['drawLib', 'knockout', 'roundrobin', 'find', drawCtrl],
                controllerAs: 'ctrlDraw',
                link: function (scope, element, attrs, ctrlDraw) {
                    var doRefresh = function (draw, oldValue) {
                        ctrlDraw.draw = draw;
                        ctrlDraw.isKnockout = draw && draw.type < 2;
                        ctrlDraw.boxWidth = scope.$eval(attrs.boxWidth) || 150;
                        ctrlDraw.boxHeight = scope.$eval(attrs.boxHeight) || 40;
                        ctrlDraw.interBoxWidth = scope.$eval(attrs.interBoxWidth) || 10;
                        ctrlDraw.interBoxHeight = scope.$eval(attrs.interBoxHeight) || 10;
                        ctrlDraw.simple = scope.$eval(attrs.simple);

                        ctrlDraw.computeCoordinates();
                    };

                    scope.$watch(attrs.draw, doRefresh);

                    scope.$watch(attrs.draw + '._refresh', function (refesh, oldRefresh) {
                        if (refesh !== oldRefresh) {
                            doRefresh(ctrlDraw.draw);
                        }
                    });
                }
            };
        }

        function drawLinesDirective() {
            return {
                restrict: 'A',
                require: '^draw',
                link: function (scope, element, attrs, ctrlDraw) {
                    scope.$watch(attrs.drawLines, function () {
                        ctrlDraw.drawLines(element);
                    });
                }
            };
        }

        angular.module('jat.draw.list', ['jat.services.drawLib', 'jat.services.knockout', 'jat.services.roundrobin', 'jat.services.find']).directive('draw', drawDirective).directive('drawLines', drawLinesDirective);
    })(jat.draw || (jat.draw = {}));
    var draw = jat.draw;
})(jat || (jat = {}));
//# sourceMappingURL=drawDraw.js.map
