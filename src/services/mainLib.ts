import { TournamentLib as tournamentLib } from './tournamentLib';
import { DrawLib as drawLib } from './draw/drawLib';
import { validation } from './types';
import { Services } from './services';
import { Selection,ModelType } from './util/selection';
import { Find } from './util/find';
import { Guid } from './util/guid';
import { Undo } from './util/undo';
import { copy } from '../utils/tool';
import {HttpClient} from 'aurelia-http-client';

export class MainLib {

    private selection = new Selection();
    private undo = new Undo();

    constructor() {
    }

    newTournament(): Tournament {
        var tournament: Tournament = {
            id: Guid.create('T'),
            info: {
                name: ''
            },
            players: [],
            events: []
        };
        this.selection.select(tournament, ModelType.Tournament);
        return tournament;
    }

    /** This function load tournament data from an url. */
    loadTournament(file_url?: File|string): Promise<Tournament> {
        var deferred = this.$q.defer();
        if (!file_url) {
            var data = window.localStorage['tournament'];
            if (data) {
                var tournament: Tournament = JSON.parse(data);
                tournamentLib.initTournament(tournament);
                this.selection.select(tournament, ModelType.Tournament);
                deferred.resolve(tournament);
            } else {
                deferred.reject('nothing in storage');
            }
        } else if (typeof file_url === 'string') {
            this.$http.get(file_url)
                .success((tournament: Tournament, status: number) => {
                    tournament._url = <string>file_url;
                    tournamentLib.initTournament(tournament);
                    this.selection.select(tournament, ModelType.Tournament);
                    deferred.resolve(tournament);
                })
                .error((data: any, status: number) => {
                    deferred.reject(data);
                });
        } else {
            var reader = new FileReader();
            reader.addEventListener('loadend', () => {
                try {
                    var tournament: Tournament = JSON.parse(reader.result);
                    tournament._url = (<File>file_url).name;    //TODO missing path
                    tournamentLib.initTournament(tournament);
                    this.selection.select(tournament, ModelType.Tournament);
                    deferred.resolve(tournament);
                } catch (ex) {
                    deferred.reject(ex.message);
                }
            });
            reader.addEventListener('onerror', () =>
                deferred.reject(reader.error.name));
            reader.addEventListener('onabort', () =>
                deferred.reject('aborted'));

            reader.readAsText(file_url);
        }
        return deferred.promise;
    }

    saveTournament(tournament: Tournament, url?: string): void {
        var data = {};
        copy(tournament, data);
        if (!url) {
            //this.$log.info(angular.toJson(data, true));
            window.localStorage['tournament'] = JSON.stringify(data);
            return;
        }
        this.$http.post(url || tournament._url, data)
            .success((data: any, status: number) => {
                //TODO
            })
            .error((data: any, status: number) => {
                //TODO
            });
    }

    //#region player
    addPlayer(tournament: Tournament, newPlayer: Player): void {
        var c = tournament.players;
        newPlayer.id = Guid.create('p');

        this.undo.insert(c, -1, newPlayer, "Add " + newPlayer.name, ModelType.Player); //c.push( newPlayer);
        this.selection.select(newPlayer, ModelType.Player);
    }

    editPlayer(editedPlayer: Player, player: Player): void {
        var isSelected = this.selection.player === player;
        var c = editedPlayer._tournament.players;
        var i = Find.indexOf(c, "id", editedPlayer.id, "Player to update not found");
        this.undo.update(c, i, editedPlayer, "Edit " + editedPlayer.name + " " + i, ModelType.Player); //c[i] = editedPlayer;
        if (isSelected) {
            this.selection.select(editedPlayer, ModelType.Player);
        }
    }

    removePlayer(player: Player): void {
        var c = player._tournament.players;
        var i = Find.indexOf(c, "id", player.id, "Player to remove not found");
        this.undo.remove(c, i, "Delete " + player.name + " " + i, ModelType.Player);   //c.splice( i, 1);
        if (this.selection.player === player) {
            this.selection.select(c[i] || c[i - 1], ModelType.Player); //select next or previous
        }
    }
    //#endregion player

    //#region event
    addEvent(tournament: Tournament, newEvent: TEvent, afterEvent?: TEvent): void {
        var c = tournament.events;
        var index = afterEvent ? Find.indexOf(c, 'id', afterEvent.id) + 1 : c.length;

        newEvent.id = Guid.create('e');
        this.undo.insert(c, index, newEvent, "Add " + newEvent.name, ModelType.TEvent);   //c.push( newEvent);
        this.selection.select(newEvent, ModelType.TEvent);
    }

    editEvent(editedEvent: TEvent, event: TEvent): void {
        var isSelected = this.selection.event === event;
        var c = editedEvent._tournament.events;
        var i = Find.indexOf(c, "id", editedEvent.id, "TEvent to edit not found");
        this.undo.update(c, i, editedEvent, "Edit " + editedEvent.name + " " + i, ModelType.TEvent);   //c[i] = editedEvent;
        if (isSelected) {
            this.selection.select(editedEvent, ModelType.TEvent);
        }
    }

    removeEvent(event: TEvent): void {
        var c = event._tournament.events;
        var i = Find.indexOf(c, "id", event.id, "TEvent to remove not found");
        this.undo.remove(c, i, "Delete " + c[i].name + " " + i, ModelType.TEvent); //c.splice( i, 1);
        if (this.selection.event === event) {
            this.selection.select(c[i] || c[i - 1], ModelType.TEvent);
        }
    }
    //#endregion event

    //#region draw
    addDraw(draw: Draw, generate?: GenerateType, afterDraw?: Draw): void {

        var c = draw._event.draws;
        var afterIndex = afterDraw ? Find.indexOf(c, 'id', afterDraw.id) : c.length - 1;

        if (generate) {
            var lib = Services.drawLibFor(draw);
            var draws = lib.generateDraw(draw, generate, afterIndex);
            if (!draws || !draws.length) {
                return;
            }
            this.undo.splice(c, afterIndex + 1, 0, draws, "Add " + draw.name, ModelType.Draw); //c.splice( i, 1, draws);

            for (var i = 0; i < draws.length; i++) {
                var lib = Services.drawLibFor(draws[i]);
                drawLib.initDraw(draws[i], draw._event);
            }
            this.selection.select(draws[0], ModelType.Draw);

        } else {
            draw.id = Guid.create('d');
            this.undo.insert(c, afterIndex + 1, draw, "Add " + draw.name, ModelType.Draw); //c.push( draw);
            this.selection.select(draw, ModelType.Draw);
        }
    }

    updateDraw(draw: Draw, oldDraw?: Draw, generate?: GenerateType): void {
        var isSelected = this.selection.draw === oldDraw;
        var lib = Services.drawLibFor(draw);
        var group = drawLib.group(oldDraw || draw);
        if (generate) {
            var draws = lib.generateDraw(draw, generate, -1);
            if (!draws || !draws.length) {
                return;
            }
        } else {
            lib.resize(draw, oldDraw);
        }
        var c = draw._event.draws;
        if (generate && draws && group && draws.length) {
            var i = Find.indexOf(c, "id", group[0].id, "Draw to edit not found");
            this.undo.splice(c, i, group.length, draws, "Generate " + GenerateType[generate] + ' ' + draw.name, ModelType.Draw);

            for (var i = 0; i < draws.length; i++) {
                drawLib.initDraw(draws[i], draw._event);
            }
            draw = draws[0];
        } else {    //edit draw
            var i = Find.indexOf(c, "id", draw.id, "Draw to edit not found");
            this.undo.update(c, i, draw, "Edit " + draw.name + " " + i, ModelType.Draw); //c[i] = draw;
        }
        if (isSelected || generate) {
            this.selection.select(draw, ModelType.Draw);
            drawLib.refresh(draw);  //force angular refresh
        }
    }

    updateQualif(draw: Draw): void {
        this.undo.newGroup('Update qualified', () => {
            drawLib.updateQualif(draw);
            return true;
        }, draw);
    }

    removeDraw(draw: Draw): void {
        var c = draw._event.draws;
        var i = Find.indexOf(c, "id", draw.id, "Draw to remove not found");
        this.undo.remove(c, i, "Delete " + draw.name + " " + i, ModelType.Draw); //c.splice( i, 1);
        if (this.selection.draw === draw) {
            this.selection.select(c[i] || c[i - 1], ModelType.Draw);   //select next or previous
        }
    }

    validateDraw(draw: Draw): void {
        validation.resetDraw(draw);
        validation.validateDraw(draw);
        if (this.selection.draw === draw) {
            drawLib.refresh(draw);  //force angular refresh
        }
    }
    //#endregion draw

    //#region match
    editMatch(editedMatch: Match, match: Match): void {
        drawLib.initBox(editedMatch, editedMatch._draw);
        var c = match._draw.boxes;
        var i = Find.indexOf(c, "position", editedMatch.position, "Match to edit not found");
        this.undo.newGroup("Edit match", () => {
            this.undo.update(c, i, editedMatch, "Edit " + editedMatch.position + " " + i, ModelType.Match); //c[i] = editedMatch;
            if (editedMatch.qualifOut) {
                //report qualified player to next draw
                var nextGroup = drawLib.nextGroup(editedMatch._draw);
                if (nextGroup) {
                    var boxIn = drawLib.groupFindPlayerIn(nextGroup, editedMatch.qualifOut);
                    if (boxIn) {
                        //this.undo.update(boxIn, 'playerId', editedMatch.playerId, 'Set player');  //boxIn.playerId = editedMatch.playerId;
                        //this.undo.update(boxIn, '_player', editedMatch._player, 'Set player');  //boxIn._player = editedMatch._player;
                        this.undo.update(boxIn, 'playerId', editedMatch.playerId, 'Set player',
                            () => drawLib.initBox(boxIn, boxIn._draw));  //boxIn.playerId = editedMatch.playerId;
                    }
                }
            }
            return true;
        });
    }
    //erasePlayer(box: Box): void {
    //    //this.undo.newGroup("Erase player", () => {
    //    //    this.undo.update(box, 'playerId', null);  //box.playerId = undefined;
    //    //    this.undo.update(box, '_player', null);  //box._player = undefined;
    //    //    return true;
    //    //}, box);

    //    //this.undo.update(box, 'playerId', null, "Erase player",     //box.playerId = undefined;
    //    //    () => drawLib.initBox(box, box._draw)
    //    //    );  

    //    var prev = box.playerId;
    //    this.undo.action((bUndo: boolean) => {
    //        box.playerId = bUndo ? prev : undefined;
    //        drawLib.initBox(box, box._draw)
    //        this.selection.select(box, ModelType.Box);
    //    }, "Erase player");
    //}
    //eraseScore(match: Match): void {
    //    this.undo.newGroup("Erase score", () => {
    //        this.undo.update(match, 'score', '');  //box.score = '';
    //        return true;
    //    }, match);
    //}
    erasePlanning(match: Match): void {
        this.undo.newGroup("Erase player", () => {
            this.undo.update(match, 'place', null); //match.place = undefined;
            this.undo.update(match, 'date', null);  //match.date = undefined;
            return true;
        }, match);
    }
    //#endregion match

    //public select(r: any, type?: ModelType): void {
    //    this.selection.select(r, type);
    //}
}