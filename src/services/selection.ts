import {Find} from './util/find'; 

export const enum ModelType { None, Tournament, Player, TEvent, Draw, Match, Box }

export class Selection {
    tournament: Tournament;
    event: TEvent;
    draw: Draw;
    box: Box;
    player: Player;

    modelTypeNone = ModelType.None;
    modelTypeTournament = ModelType.Tournament;
    modelTypePlayer = ModelType.Player;
    modelTypeEvent = ModelType.TEvent;
    modelTypeDraw = ModelType.Draw;
    modelTypeMatch = ModelType.Match;
    modelTypeBox = ModelType.Box;

    // constructor() {
    // }

    select2(item: Box | Draw | TEvent | Player | Tournament | string, type?: ModelType): void {
        if (item && type) {
            //first unselect any item to close the actions dropdown
            this.unselect(type);
            //then select the new box
            setTimeout(() => this.select(item, type), 0);
            return;
        }
        this.select(item, type);
    }

    select(item: Box | Draw | TEvent | Player | Tournament | string, type?: ModelType): Box | Draw | TEvent | Player | Tournament {

        if (!item) {
            this.unselect(type);
            return;
        }

        //if (type === ModelType.Box || ('_player' in item && (<Box>item)._draw)) { //box
        if (type === ModelType.Box || (item['_player'] && (<Box>item)._draw)) { //box
            var b = <Box>item;
            this.tournament = b._draw._event._tournament;
            this.event = b._draw._event;
            this.draw = b._draw;
            this.box = b;
            return b;
        } 
        if (type === ModelType.Draw && 'string' === typeof item) { //draw id
            let id = <string>item;
            var d = this.event.draws.find( (draw:Draw) => draw.id === id);
            // this.tournament = d._event._tournament;
            // this.event = d._event;
            this.draw = d;
            this.box = undefined;
            return d;
        }
        if (type === ModelType.Draw || (<Draw>item)._event) { //draw
            var d = <Draw>item;
            this.tournament = d._event._tournament;
            this.event = d._event;
            this.draw = d;
            this.box = undefined;
            return d;
        }
        if (type === ModelType.TEvent && 'string' === typeof item) { //event id
            let id = <string>item;
            var e = this.tournament.events.find( (evt:TEvent) => evt.id === id);
            // this.tournament = e._tournament;
            this.event = e;
            this.draw = e.draws ? e.draws[0] : undefined;
            this.box = undefined;
            return e;
        }
        if (type === ModelType.TEvent || ((<TEvent>item).draws && (<TEvent>item)._tournament)) { //event
            var e = <TEvent>item;
            this.tournament = e._tournament;
            this.event = e;
            this.draw = e.draws ? e.draws[0] : undefined;
            this.box = undefined;
            return e;
        }
        if (type === ModelType.Player || ((<Player>item).name && (<Player>item)._tournament)) {   //player id
            let id = <string>item;
            var p = this.tournament.players.find( (player:Player) => player.id === id);
            // this.tournament = p._tournament;
            this.player = p;
            return p;
        }
        if (type === ModelType.Player || ((<Player>item).name && (<Player>item)._tournament)) {   //player
            var p = <Player>item;
            this.tournament = p._tournament;
            this.player = p;
            return p;
        }
        if (type === ModelType.Tournament || ((<Tournament>item).players && (<Tournament>item).events)) { //tournament
            this.tournament = <Tournament>item;
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
            return this.tournament;
        }
    }

    selectByError(draw: Draw, error: IError): Box | Draw | TEvent | Player | Tournament {
        if (error.position) {
            var box = Find.by(draw.boxes, 'position', error.position);
            return this.select(box, ModelType.Box);
        } else if( error.player) {
            return this.select(error.player, ModelType.Player);
        } else {
            return this.select(draw, ModelType.Draw);
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

    get isMatch(): boolean {
        // return this.box && ('score' in this.box);
        return this.box && ('undefined' !== typeof (<Match>this.box).score);
    }

    get hasScore():boolean {
        var match:Match = <Match>this.box; 
        return match && (!!match.score || match.wo && match.canceled && match.vainqDef);
    }
}