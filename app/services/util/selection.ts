'use strict';

module jat.service {

    export class Selection {
        public tournament: models.Tournament;
        public event: models.Event;
        public draw: models.Draw;
        public box: models.Box;
        public player: models.Player;

        constructor(private find: jat.service.Find) {
        }

        select(r: models.Box | models.Draw | models.Event | models.Player | models.Tournament, type?: models.ModelType): void {

            if (!r) {
                this.unselect(type);
                return;
            }

            if (type === models.ModelType.Box || ('_player' in r && (<models.Box>r)._draw)) { //box
                var b = <models.Box>r;
                this.tournament = b._draw._event._tournament;
                this.event = b._draw._event;
                this.draw = b._draw;
                this.box = b;

            } else if (type === models.ModelType.Draw || (<models.Draw>r)._event) { //draw
                var d = <models.Draw>r;
                this.tournament = d._event._tournament;
                this.event = d._event;
                this.draw = d;
                this.box = undefined;

            } else if (type === models.ModelType.Event || ((<models.Event>r).draws && (<models.Event>r)._tournament)) { //event
                var e = <models.Event>r;
                this.tournament = e._tournament;
                this.event = e;
                this.draw = e.draws ? e.draws[0] : undefined;
                this.box = undefined;

            } else if (type === models.ModelType.Player || ((<models.Player>r).name && (<models.Player>r)._tournament)) {   //player
                var p = <models.Player>r;
                this.tournament = p._tournament;
                this.player = p;

            } else if (type === models.ModelType.Tournament || ((<models.Tournament>r).players && (<models.Tournament>r).events)) { //tournament
                this.tournament = <models.Tournament>r;
                if (this.tournament.events[0]) {
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

        unselect(type: models.ModelType): void {
            //if (type) {
            //cases cascade, without breaks.
            switch (type) {
                case models.ModelType.Tournament:
                    this.tournament = undefined;
                    this.player = undefined;
                case models.ModelType.Event:
                    this.event = undefined;
                case models.ModelType.Draw:
                    this.draw = undefined;
                case models.ModelType.Box:
                    this.box = undefined;
                    break;
                case models.ModelType.Player:
                    this.player = undefined;
            }
            //}
        }

        selectByError(draw: models.Draw, error: IError) {
            if (error.position) {
                var box = this.find.by(draw.boxes, 'position', error.position);
                this.select(box, models.ModelType.Box);
            } else if( error.player) {
                this.select(error.player, models.ModelType.Player);
            } else {
                this.select(draw, models.ModelType.Draw);
            }
        }

    }

    angular.module('jat.services.selection', ['jat.services.find'])
    //.service('selection', Selection);
        .factory('selection', [
            'find',
            (find: jat.service.Find) =>
                new Selection(find)
        ])
}