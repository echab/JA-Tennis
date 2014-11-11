'use strict';
var jat;
(function (jat) {
    (function (_draw) {
        var drawCtrl = (function () {
            function drawCtrl(drawLib, //private knockout: jat.service.Knockout, //for dependencies
            //private roundrobin: jat.service.Roundrobin, //for dependencies
            tournamentLib, find, undo, selection) {
                this.drawLib = drawLib;
                this.tournamentLib = tournamentLib;
                this.find = find;
                this.undo = undo;
                this.selection = selection;
                this.boxWidth = 150;
                this.boxHeight = 40;
                this.interBoxWidth = 10;
                this.interBoxHeight = 10;
                this.simple = false;
            }
            drawCtrl.prototype.init = function () {
                if (!this.draw || this.simple) {
                    return;
                }

                this.players = this.tournamentLib.GetJoueursInscrit(this.draw);

                //qualifs in
                var prev = this.drawLib.previousGroup(this.draw);
                this.qualifsIn = prev ? this.drawLib.FindAllQualifieSortantBox(prev) : undefined;

                //qualifs out
                this.qualifsOut = [];
                for (var i = 1; i <= this.draw.nbOut; i++) {
                    this.qualifsOut.push(i);
                }
            };

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
                var _canvas = canvas[0];
                var ctx = useVML ? new vmlContext(canvas, this.width, this.height) : _canvas.getContext('2d');
                ctx.lineWidth = .5;
                ctx.translate(.5, .5);
                var boxHeight2 = this.boxHeight >> 1;

                for (var i = draw.boxes.length - 1; i >= 0; i--) {
                    var box = draw.boxes[i];
                    var x = box._x * this.boxWidth, y = box._y * this.boxHeight;

                    if (this.isMatch(box)) {
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
                if (ctx.done) {
                    ctx.done(); //VML
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
            drawCtrl.prototype.getQualifsIn = function () {
                return this.qualifsIn;
            };
            drawCtrl.prototype.getQualifsOut = function () {
                return this.qualifsOut;
            };
            drawCtrl.prototype.getPlayers = function () {
                return this.players;
            };
            drawCtrl.prototype.findQualifIn = function (qualifIn) {
                return this.draw && !!this.find.by(this.draw.boxes, 'qualifIn', qualifIn);
            };
            drawCtrl.prototype.findPlayer = function (playerId) {
                return this.draw && playerId && !!this.find.by(this.draw.boxes, 'playerId', playerId);
            };

            drawCtrl.prototype.setPlayer = function (box, player, qualifIn) {
                var _this = this;
                var prevPlayer = box._player;
                var prevQualif = box.qualifIn;
                this.undo.action(function (bUndo) {
                    if (prevQualif || qualifIn) {
                        _this.drawLib.SetQualifieEntrant(box, bUndo ? prevQualif : qualifIn, bUndo ? prevPlayer : player);
                    } else {
                        box.playerId = bUndo ? (prevPlayer ? prevPlayer.id : undefined) : (player ? player.id : undefined);
                        _this.drawLib.initBox(box, box._draw);
                    }
                    _this.selection.select(box, 6 /* Box */);
                }, player ? 'Set player' : 'Erase player');
            };
            drawCtrl.prototype.swapPlayer = function (box) {
                //TODO
            };
            drawCtrl.prototype.eraseScore = function (match) {
                var _this = this;
                this.undo.newGroup("Erase score", function () {
                    _this.undo.update(match, 'score', ''); //box.score = '';
                    return true;
                }, match);
            };

            drawCtrl.prototype.isMatch = function (box) {
                return box && ('score' in box);
            };
            drawCtrl.$inject = [
                'drawLib',
                'tournamentLib',
                'find',
                'undo',
                'selection'];
            return drawCtrl;
        })();

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

                        ctrlDraw.init();
                        ctrlDraw.computeCoordinates();

                        //IE8 patch
                        if (ctrlDraw.isKnockout && useVML) {
                            ctrlDraw.drawLines(element);
                        }
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

        //IE8 patch to use VML instead of canvas
        var useVML = !window.HTMLCanvasElement;
        var vmlContext;
        function initVml() {
            if (!useVML) {
                return;
            }

            // create xmlns and stylesheet
            document.namespaces.add('v', 'urn:schemas-microsoft-com:vml', '#default#VML');
            document.createStyleSheet().cssText = 'v\\:shape{behavior:url(#default#VML)}';

            //emulate canvas context using VML
            vmlContext = function (element, width, height) {
                this._element = element;
                this._width = width;
                this._height = height;
                this.beginPath();
                this._element.find('shape').remove();
            };
            vmlContext.prototype = {
                _path: [], _tx: 0, _ty: 0,
                translate: function (tx, ty) {
                    //this._tx = tx;
                    //this._ty = ty;
                },
                beginPath: function () {
                    this._path.length = 0;
                    this.lineWidth = 1;
                    this.strokeStyle = 'black';
                },
                moveTo: function (x, y) {
                    this._path.push('m', (this._tx + x), ',', (this._ty + y));
                },
                lineTo: function (x, y) {
                    this._path.push('l', (this._tx + x), ',', (this._ty + y));
                },
                stroke: function () {
                    this._path.push('e');
                },
                done: function () {
                    var shape = angular.element('<v:shape' + ' coordsize="' + this._width + ' ' + this._height + '"' + ' style="position:absolute; left:0px; top:0px; width:' + this._width + 'px; height:' + this._height + 'px;"' + ' filled="0" stroked="1" strokecolor="' + this.strokeStyle + '" strokeweight="' + this.lineWidth + 'px"' + ' path="' + this._path.join('') + '" />');
                    this._element.append(shape);
                }
            };
        }

        function drawLinesDirective() {
            return {
                restrict: 'A',
                require: '^draw',
                link: function (scope, element, attrs, ctrlDraw) {
                    //attrs.$observe( 'drawLines', () => {
                    scope.$watch(attrs.drawLines, function () {
                        ctrlDraw.drawLines(element);
                    });
                }
            };
        }

        angular.module('jat.draw.list', [
            'jat.services.drawLib',
            'jat.services.knockout',
            'jat.services.roundrobin',
            'jat.services.tournamentLib',
            'jat.services.find',
            'jat.services.undo',
            'jat.services.selection']).directive('draw', drawDirective).directive('drawLines', drawLinesDirective).run(initVml);
    })(jat.draw || (jat.draw = {}));
    var draw = jat.draw;
})(jat || (jat = {}));
//# sourceMappingURL=drawDraw.js.map
