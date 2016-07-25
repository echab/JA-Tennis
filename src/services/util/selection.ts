import {Find} from './find'; 

export enum ModelType { None, Tournament, Player, TEvent, Draw, Match, Box }

export class Selection {
    public tournament: Tournament;
    public event: TEvent;
    public draw: Draw;
    public box: Box;
    public player: Player;

    constructor() {
    }

    select(r: Box | Draw | TEvent | Player | Tournament, type?: ModelType): void {

        if (!r) {
            this.unselect(type);
            return;
        }

        //if (type === ModelType.Box || ('_player' in r && (<Box>r)._draw)) { //box
        if (type === ModelType.Box || (r['_player'] && (<Box>r)._draw)) { //box
            var b = <Box>r;
            this.tournament = b._draw._event._tournament;
            this.event = b._draw._event;
            this.draw = b._draw;
            this.box = b;

        } else if (type === ModelType.Draw || (<Draw>r)._event) { //draw
            var d = <Draw>r;
            this.tournament = d._event._tournament;
            this.event = d._event;
            this.draw = d;
            this.box = undefined;

        } else if (type === ModelType.TEvent || ((<TEvent>r).draws && (<TEvent>r)._tournament)) { //event
            var e = <TEvent>r;
            this.tournament = e._tournament;
            this.event = e;
            this.draw = e.draws ? e.draws[0] : undefined;
            this.box = undefined;

        } else if (type === ModelType.Player || ((<Player>r).name && (<Player>r)._tournament)) {   //player
            var p = <Player>r;
            this.tournament = p._tournament;
            this.player = p;

        } else if (type === ModelType.Tournament || ((<Tournament>r).players && (<Tournament>r).events)) { //tournament
            this.tournament = <Tournament>r;
            if (this.tournament.events && this.tournament.events[0]) {
                this.event = this.tournament.events[0];
                this.draw = this.event && this.event.draws ? this.event.draws[this.event.draws.length - 1] : undefined;
            } else {
                this.event = undefined;
                this.draw = undefined;
            }
            this.box = undefined;
            if (this.player && this.player._tournament !== this.tournament) {
                this.player = undefined;
            }
        }
    }

    unselect(type: ModelType): void {
        //if (type) {
        //cases cascade, without breaks.
        switch (type) {
            case ModelType.Tournament:
                this.tournament = undefined;
                this.player = undefined;
            case ModelType.TEvent:
                this.event = undefined;
            case ModelType.Draw:
                this.draw = undefined;
            case ModelType.Box:
                this.box = undefined;
                break;
            case ModelType.Player:
                this.player = undefined;
        }
        //}
    }

    selectByError(draw: Draw, error: IError) {
        if (error.position) {
            var box = Find.by(draw.boxes, 'position', error.position);
            this.select(box, ModelType.Box);
        } else if( error.player) {
            this.select(error.player, ModelType.Player);
        } else {
            this.select(draw, ModelType.Draw);
        }
    }

}