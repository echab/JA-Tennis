import { autoinject } from 'aurelia-framework';
import { bindable } from 'aurelia-framework';
import { BindingEngine } from 'aurelia-framework'

import { Selection,ModelType} from '../../services/selection';
import { LibLocator } from '../../services/libLocator';
import { DrawLib } from '../../services/draw/drawLib';
import { TournamentLib } from '../../services/tournamentLib';
import { Find } from '../../services/util/find';
import { Undo } from '../../services/util/undo';
import { DrawEditor } from '../../services/drawEditor';

@autoinject
export class DrawDraw implements ISize {

    @bindable draw: Draw;
    @bindable boxWidth: number = 150;
    @bindable boxHeight: number = 40;
    @bindable interBoxWidth: number = 10;
    @bindable interBoxHeight: number = 10;
    @bindable simple: boolean = false;

    isKnockout: boolean;
    players: Player[];
    qualifsIn: Match[];
    qualifsOut: number[];
    _refresh: Date;
    width: number;
    height: number;
    rows: number[][];
    _drawLib: IDrawLib;

    constructor(
        private drawEditor: DrawEditor,
        private undo: Undo,
        private selection: Selection,
        private bindingEngine: BindingEngine
        ) {
    }

    bind(bindingContext: Object, overrideContext: Object) {
        // the databinding framework will not invoke the changed handlers for the view-model's 
        // bindable properties until the "next" time those properties are updated.
        if( this.simple) {
            this.drawChanged(this.draw);
        }
    }

    drawChanged(draw: Draw, oldValue?: Draw) {
        this.draw = draw;
        this.isKnockout = draw && draw.type < 2;
        if (!draw) {
            return;
        }

        this._drawLib = LibLocator.drawLibFor(this.draw);
        console.assert( !!this._drawLib);
        if(!this._drawLib) {
            return; //TODO
        }

        if( !this.simple) {
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

        this.computeCoordinates();
    }
 
    //TODO to be moved into knockout and roundrobin drawLib
    computeCoordinates(): void {
        let draw = this.draw;
        if (!draw) {
            return;
        }
        // if (!this._drawLib) {
        //     this._drawLib = Services.drawLibFor(draw);
        // }
        var size = this._drawLib.getSize(draw);
        this.width = size.width * this.boxWidth - this.interBoxWidth;
        this.height = size.height * this.boxHeight;

        draw._points = this._drawLib.computePositions(draw);    //TODO to be moved into drawLib when draw changes
        this._refresh = new Date(); //to refresh lines

        if (!this.isKnockout) {
            //for roundrobin, fill the list of rows/columns for the view
            let n = draw.nbColumn;
            this.rows = new Array(n);
            for (let r = 0; r < n; r++) {
                let cols: number[] = new Array(n + 1);

                let b = (n + 1) * n - r - 1;
                for (let c = 0; c <= n; c++) {
                    cols[c] = b;
                    b -= n;
                }
                this.rows[r] = cols;
            }
        }
    }

    drawLines(canvas: HTMLCanvasElement): void {
        canvas.setAttribute('width', <any>this.width);
        canvas.setAttribute('height', <any>this.height);
        var draw = this.draw;
        if (!draw || !draw.boxes || !draw.boxes.length || 2 <= draw.type) {
            return;
        }

        //draw the lines...
        var ctx = canvas.getContext('2d');
        ctx.lineWidth = .5;
        ctx.translate(.5, .5);
        var boxHeight2 = this.boxHeight >> 1;
        this.boxWidth = +this.boxWidth; //convert string to number

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

@autoinject
export class DrawLinesCustomAttribute {

	private canvas:HTMLCanvasElement;
    private drawDraw: DrawDraw;

	constructor(private element: Element){
        console.assert(element.tagName === 'CANVAS', "Bad element");
		this.canvas = <HTMLCanvasElement>element;
	}

    bind(bindingContext: Object, overrideContext?: Object) {
        this.drawDraw = <DrawDraw>bindingContext;
        this.valueChanged();
    }

    valueChanged(draw?: Draw, oldValue?: Draw) {
        this.drawDraw.drawLines( this.canvas);
    }
}