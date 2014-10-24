'use strict';

interface DrawAttributes extends ng.IAttributes {
    draw: string;
    boxWidth: string;
    boxHeight: string;
    interBoxWidth: string;
    interBoxHeight: string;
    simple: string;
}

module jat.draw {

    class drawCtrl implements ISize {

        draw: models.Draw;
        isKnockout: boolean;
        _refresh: Date;
        width: number;
        height: number;
        rows: number[][];

        boxWidth: number = 150;
        boxHeight: number = 40;
        interBoxWidth: number = 10;
        interBoxHeight: number = 10;
        simple: boolean = false;

        constructor(
            private drawLib: jat.service.DrawLib,
            private knockout: jat.service.Knockout, private roundrobin: jat.service.Roundrobin, //for dependencies
            private find: jat.service.Find
            ) {
        }

        computeCoordinates(): void {
            if (!this.draw) {
                return;
            }
            var draw = this.draw;
            var size = this.drawLib.getSize(draw);
            this.width = size.width * this.boxWidth - this.interBoxWidth;
            this.height = size.height * this.boxHeight;

            draw._points = this.drawLib.computePositions(draw);    //TODO to be moved into drawLib when draw changes
            this._refresh = new Date(); //to refresh lines

            if (!this.isKnockout) {
                //for roundrobin, fill the list of rows/columns for the view
                var n = draw.nbColumn;
                this.rows = new Array(n);
                for (var r = 0; r < n; r++) {
                    var cols: number[] = new Array(n + 1);

                    var b = (n + 1) * n - r - 1;
                    for (var c = 0; c <= n; c++) {
                        cols[c] = b;
                        b -= n;
                    }
                    this.rows[r] = cols;
                }
            }
        }

        drawLines(canvas: JQuery): void {
            canvas.attr('width', this.width).attr('height', this.height);
            var draw = this.draw;
            if (!draw || !draw.boxes || !draw.boxes.length || 2 <= draw.type) {
                return;
            }

            //draw the lines...
            var ctx = (<HTMLCanvasElement> canvas[0]).getContext('2d');
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
        }

        getBox(position: number): models.Box {
            if (this.draw && this.draw.boxes) {
                return this.find.by(this.draw.boxes, 'position', position);
            }
        }
        isDiag(position: number): boolean {
            if (this.draw) {
                var n = this.draw.nbColumn;
                return (position % n) * (n + 1) === position;
            }
        }
        range(min: number, max: number, step?: number): number[] {
            step = step || 1;
            var a: number[] = [];
            for (var i = min; i <= max; i += step) {
                a.push(i);
            }
            return a;
        }
    }

    function isMatch(box: models.Box): boolean {
        return box && ('score' in box);
    }

    function positionOpponents(pos: number): { pos1: number; pos2: number } { //ADVERSAIRE1, ADVERSAIRE2
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
            link: (scope: ng.IScope, element: JQuery, attrs: DrawAttributes, ctrlDraw: drawCtrl) => {

                var doRefresh = (draw: models.Draw, oldValue?: models.Draw) => {
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

                scope.$watch(attrs.draw + '._refresh', (refesh: Date, oldRefresh: Date) => {
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
            link: (scope: ng.IScope, element: JQuery, attrs: any, ctrlDraw: drawCtrl) => {
                scope.$watch(attrs.drawLines, () => {
                    ctrlDraw.drawLines(element);
                });
            }
        };
    }

    angular.module('jat.draw.list', ['jat.services.drawLib', 'jat.services.knockout', 'jat.services.roundrobin', 'jat.services.find'])
        .directive('draw', drawDirective)
        .directive('drawLines', drawLinesDirective);
}