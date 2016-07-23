import { Selection,ModelType} from '../../services/util/selection';
import { Services } from '../../services/services';
import { DrawLib } from '../../services/draw/drawLib';
import { TournamentLib } from '../../services/tournamentLib';
import { Find } from '../../services/util/find';
import { Undo } from '../../services/util/undo';

interface DrawAttributes extends ng.IAttributes {
    draw: string;
    boxWidth: string;
    boxHeight: string;
    interBoxWidth: string;
    interBoxHeight: string;
    simple: string;
}

class DrawDraw implements ISize {

    draw: Draw;
    isKnockout: boolean;
    players: Player[];
    qualifsIn: Match[];
    qualifsOut: number[];
    _refresh: Date;
    width: number;
    height: number;
    rows: number[][];

    boxWidth: number = 150;
    boxHeight: number = 40;
    interBoxWidth: number = 10;
    interBoxHeight: number = 10;
    simple: boolean = false;

    _drawLib: IDrawLib;

    static $inject = [
        'services',
        'drawLib',
    //'knockout',
    //'roundrobin',
        'tournamentLib',
        'find',
        'undo',
        'selection'];
    constructor(
        private services: Services,
        private drawLib: DrawLib,
        //private knockout: Knockout, //for dependencies
        //private roundrobin: Roundrobin, //for dependencies
        private tournamentLib: TournamentLib,
        private find: Find,
        private undo: Undo,
        private selection: Selection
        ) {
    }

    init() {
        if (!this.draw || this.simple) {
            return;
        }
        this._drawLib = Services.drawLibFor(this.draw);

        this.players = TournamentLib.GetJoueursInscrit(this.draw);

        //qualifs in
        var prev = DrawLib.previousGroup(this.draw);
        this.qualifsIn = prev ? DrawLib.findAllPlayerOutBox(prev) : undefined;

        //qualifs out
        this.qualifsOut = [];
        for (var i = 1; i <= this.draw.nbOut; i++) {
            this.qualifsOut.push(i);
        }
    }

    //TODO to be moved into knockout and roundrobin drawLib
    computeCoordinates(): void {
        if (!this.draw) {
            return;
        }
        var draw = this.draw;
        if (!this._drawLib) {
            this._drawLib = Services.drawLibFor(draw);
        }
        var size = this._drawLib.getSize(draw);
        this.width = size.width * this.boxWidth - this.interBoxWidth;
        this.height = size.height * this.boxHeight;

        draw._points = this._drawLib.computePositions(draw);    //TODO to be moved into drawLib when draw changes
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

    drawLines(canvas: HTMLCanvasElement): void {
        canvas.attr('width', this.width).attr('height', this.height);
        var draw = this.draw;
        if (!draw || !draw.boxes || !draw.boxes.length || 2 <= draw.type) {
            return;
        }

        //draw the lines...
        var _canvas = <HTMLCanvasElement> canvas[0];
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
        if ((<any>ctx).done) {
            (<any>ctx).done();  //VML
        }
    }

    getBox(position: number): Box {
        if (this.draw && this.draw.boxes) {
            return Find.by(this.draw.boxes, 'position', position);
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
    getQualifsIn(): Match[] {
        return this.qualifsIn;
    }
    getQualifsOut(): number[] {
        return this.qualifsOut;
    }
    getPlayers(): Player[] {
        return this.players;
    }
    findQualifIn(qualifIn: number): boolean {
        return this.draw && !!Find.by(this.draw.boxes, 'qualifIn', qualifIn);
    }
    findPlayer(playerId: string): boolean {
        return this.draw && playerId && !!Find.by(this.draw.boxes, 'playerId', playerId);
    }

    setPlayer(box: PlayerIn, player?: Player, qualifIn?: number) {
        var prevPlayer = box._player;
        var prevQualif = box.qualifIn;
        this.undo.action((bUndo: boolean) => {
            if (prevQualif || qualifIn) {
                this._drawLib.setPlayerIn(box, bUndo ? prevQualif : qualifIn, bUndo ? prevPlayer : player);
            } else {
                box.playerId = bUndo ? (prevPlayer ? prevPlayer.id : undefined) : (player ? player.id : undefined);
                DrawLib.initBox(box, box._draw);
            }
            this.selection.select(box, ModelType.Box);
        }, player ? 'Set player' : 'Erase player');
    }
    swapPlayer(box: PlayerIn): void {
        //TODO
    }
    eraseScore(match: Match): void {
        this.undo.newGroup("Erase score", () => {
            this.undo.update(match, 'score', '');  //box.score = '';
            return true;
        }, match);
    }

    isMatch(box: Box): boolean {
        return box && ('score' in box);
    }
}

function positionOpponents(pos: number): { pos1: number; pos2: number } { //ADVERSAIRE1, ADVERSAIRE2
    return {
        pos1: (pos << 1) + 2,
        pos2: (pos << 1) + 1
    };
}


function drawDirective(): ng.IDirective {   //$compile:ng.ICompileService
    return {
        restrict: 'EA',
        scope: true,
        templateUrl: 'views/draw/drawDraw.html',
        controller: DrawDraw,   //controller: ['drawLib', 'knockout', 'roundrobin', 'tournamentLib', 'find', drawCtrl],
        controllerAs: 'ctrlDraw',
        link: (scope: ng.IScope, element: Element, attrs: DrawAttributes, ctrlDraw: DrawDraw) => {

            var doRefresh = (draw: Draw, oldValue?: Draw) => {
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

            //bindingEngine.propertyObserver( draw, 'minRank').subscribe( (minRank: string) => {
            scope.$watch(attrs.draw, doRefresh);

            //bindingEngine.propertyObserver( draw, 'minRank').subscribe( (minRank: string) => {
            scope.$watch(attrs.draw + '._refresh', (refesh: Date, oldRefresh: Date) => {
                if (refesh !== oldRefresh) {
                    doRefresh(ctrlDraw.draw);
                }
            });
        }
    };
}

//IE8 patch to use VML instead of canvas
var useVML: boolean = !(<any>window).HTMLCanvasElement;
var vmlContext: any;
function initVml(): void {
    if (!useVML) {
        return;
    }

    //emulate canvas context using VML
    vmlContext = function(element: Element, width: number, height: number) {
        this._width = width;
        this._height = height;
        this.beginPath();
        this._element = element;
        this._element.find('shape').remove();
        //this._element = element.find('shape');
        //this._element.css({ width: this._width + 'px', height: this._height + 'px' });
        debugger;
    };
    vmlContext.prototype = {
        _path: [], _tx: 0, _ty: 0,
        translate: function(tx: number, ty: number): void {
            //this._tx = tx;
            //this._ty = ty;
        },
        beginPath: function(): void {
            this._path.length = 0;
            this.lineWidth = 1;
            this.strokeStyle = 'black';
        },
        moveTo: function(x: number, y: number): void {
            this._path.push('m', (this._tx + x), ',', (this._ty + y));
        },
        lineTo: function(x: number, y: number): void {
            this._path.push('l', (this._tx + x), ',', (this._ty + y));
        },
        stroke: function(): void {
            //this._path.push('e');
        },
        done: function(): void {
            var shape = angular.element('<v:shape'
                + ' coordsize="' + this._width + ' ' + this._height + '"'
                + ' style="position:absolute; left:0px; top:0px; width:' + this._width + 'px; height:' + this._height + 'px;"'
                + ' filled="0" stroked="1" strokecolor="' + this.strokeStyle + '" strokeweight="' + this.lineWidth + 'px"'
                + ' path="' + this._path.join('') + '" />');
            this._element.append(shape);
            //this._element.attr('coordsize', this._width + ' ' + this._height)
            //    .attr('filled', 0)
            //    .attr('stroked', 1)
            //    .attr('strokecolor', this.strokeStyle)
            //    .attr('strokeweight', this.lineWidth + 'px')
            //    .attr('path', this._path.join(''));
        }
    };
}

function drawLinesDirective(): ng.IDirective {
    return {
        restrict: 'A',
        require: '^draw',
        link: (scope: ng.IScope, element: JQuery, attrs: any, ctrlDraw: drawCtrl) => {
            //attrs.$observe( 'drawLines', () => {
            //bindingEngine.propertyObserver( draw, 'minRank').subscribe( (minRank: string) => {
            scope.$watch(attrs.drawLines, () => {
                ctrlDraw.drawLines(element);
            });
        }
    };
}