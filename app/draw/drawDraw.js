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
                var size = this.drawLib.getSize(this.draw, this);
                this.width = size.width;
                this.height = size.height;

                this.positions = this.drawLib.computePositions(this.draw, this);

                if (!this.isKnockout) {
                    //for roundrobin, fill the list of rows/columns for the view
                    var n = this.draw.nbColumn;
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
                var ctx = (canvas[0]).getContext('2d');
                ctx.lineWidth = .5;
                ctx.translate(.5, .5);
                var boxHeight2 = this.boxHeight >> 1;

                for (var i = draw.boxes.length - 1; i >= 0; i--) {
                    var b = draw.boxes[i];
                    var pt = this.positions[b.position];
                    if (!pt) {
                        continue;
                    }
                    var x = pt.x, y = pt.y;

                    if (isMatch(b)) {
                        ctx.moveTo(x - this.interBoxWidth, this.positions[positionOpponent1(b.position)].y + boxHeight2);
                        ctx.lineTo(x, y + boxHeight2);
                        ctx.lineTo(x - this.interBoxWidth, this.positions[positionOpponent2(b.position)].y + boxHeight2);
                        ctx.stroke();
                    }
                    ctx.moveTo(x, y + boxHeight2);
                    ctx.lineTo(x + this.boxWidth, y + boxHeight2);
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

        function positionOpponent1(pos) {
            return (pos << 1) + 2;
        }

        function positionOpponent2(pos) {
            return (pos << 1) + 1;
        }

        function drawDirective() {
            return {
                restrict: 'EA',
                scope: true,
                templateUrl: 'draw/drawDraw.html',
                controller: drawCtrl,
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
