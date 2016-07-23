import { TournamentLib as tournamentLib } from './tournamentLib';
import { DrawLib as drawLib } from './draw/drawLib';
import { validation } from './types';
import { Services } from './services';
import { Selection,ModelType } from './util/selection';
import { Find } from './util/find';
import { Guid } from './util/guid';
import { Undo } from './util/undo';
import { copy } from '../utils/tool';

import {autoinject} from 'aurelia-framework';
//import { HttpClient } from 'aurelia-fetch-client';
import { HttpClient } from 'aurelia-http-client';

// import { selection } from '../app';   //TODO use DI
// import { undo } from '../app';   //TODO use DI

@autoinject
export class MainLib {

    constructor( private selection:Selection, private undo:Undo) {
    }

    static newTournament(): Tournament {
        var tournament: Tournament = {
            id: Guid.create('T'),
            info: {
                name: ''
            },
            players: [],
            events: []
        };
        //selection.select(tournament, ModelType.Tournament);
        return tournament;
    }

    /** This function load tournament data from an url. */
    static loadTournament(file_url?: Blob|string): Promise<Tournament> {
        if (!file_url) {
            return new Promise((resolve, reject) => {
                var data = window.localStorage['tournament'];
                if (data) {
                    var tournament: Tournament = JSON.parse(data);
                    tournamentLib.initTournament(tournament);
                    //selection.select(tournament, ModelType.Tournament);
                    resolve(tournament);
                } else {
                    reject('nothing in storage');
                }
            });
        } else if (typeof file_url === 'string') {
            let client = new HttpClient();
            return client.get(file_url).then(data => {
                let tournament : Tournament = JSON.parse( data.response); 
                tournament._url = <string>file_url;
                tournamentLib.initTournament(tournament);
                //selection.select(tournament, ModelType.Tournament);
                return tournament;
            //}).catch( reason => {                
            });
        } else { //if (file_url instanceof Blob) {
            return new Promise((resolve, reject) => {
                var reader = new FileReader();
                reader.addEventListener('loadend', () => {
                    try {
                        var tournament: Tournament = JSON.parse(reader.result);
                        tournament._url = (<File>file_url).name;    //TODO missing path
                        tournamentLib.initTournament(tournament);
                        //selection.select(tournament, ModelType.Tournament);
                        resolve(tournament);
                    } catch (ex) {
                        reject(ex.message);
                    }
                });
                reader.addEventListener('error', () => reject(reader.error.name));
                reader.addEventListener('abort', () => reject('aborted'));
                reader.readAsText(<Blob>file_url);  //TODO remove cast
            });
        }
    }

    static saveTournament(tournament: Tournament, url?: string): Promise<void> {
        var data = {};
        copy(tournament, data);
        if (!url) {
            //this.$log.info(JSON.stringify(data));
            window.localStorage['tournament'] = JSON.stringify(data);
            return;
        }
        let client = new HttpClient();
        return client.post(url || tournament._url, data)
            .then(data => {
                //TODO
            })
            .catch(reason => {
                //TODO
            });
    }

    //#region player
    static addPlayer(tournament: Tournament, newPlayer: Player): void {
        var c = tournament.players;
        newPlayer.id = Guid.create('p');

        undo.insert(c, -1, newPlayer, "Add " + newPlayer.name, ModelType.Player); //c.push( newPlayer);
        selection.select(newPlayer, ModelType.Player);
    }

    static editPlayer(editedPlayer: Player, player: Player): void {
        var isSelected = selection.player === player;
        var c = editedPlayer._tournament.players;
        var i = Find.indexOf(c, "id", editedPlayer.id, "Player to update not found");
        undo.update(c, i, editedPlayer, "Edit " + editedPlayer.name + " " + i, ModelType.Player); //c[i] = editedPlayer;
        if (isSelected) {
            selection.select(editedPlayer, ModelType.Player);
        }
    }

    static removePlayer(player: Player): void {
        var c = player._tournament.players;
        var i = Find.indexOf(c, "id", player.id, "Player to remove not found");
        undo.remove(c, i, "Delete " + player.name + " " + i, ModelType.Player);   //c.splice( i, 1);
        if (selection.player === player) {
            selection.select(c[i] || c[i - 1], ModelType.Player); //select next or previous
        }
    }
    //#endregion player

    //#region event
    static addEvent(tournament: Tournament, newEvent: TEvent, afterEvent?: TEvent): void {
        var c = tournament.events;
        var index = afterEvent ? Find.indexOf(c, 'id', afterEvent.id) + 1 : c.length;

        newEvent.id = Guid.create('e');
        undo.insert(c, index, newEvent, "Add " + newEvent.name, ModelType.TEvent);   //c.push( newEvent);
        selection.select(newEvent, ModelType.TEvent);
    }

    static editEvent(editedEvent: TEvent, event: TEvent): void {
        var isSelected = selection.event === event;
        var c = editedEvent._tournament.events;
        var i = Find.indexOf(c, "id", editedEvent.id, "TEvent to edit not found");
        undo.update(c, i, editedEvent, "Edit " + editedEvent.name + " " + i, ModelType.TEvent);   //c[i] = editedEvent;
        if (isSelected) {
            selection.select(editedEvent, ModelType.TEvent);
        }
    }

    static removeEvent(event: TEvent): void {
        var c = event._tournament.events;
        var i = Find.indexOf(c, "id", event.id, "TEvent to remove not found");
        undo.remove(c, i, "Delete " + c[i].name + " " + i, ModelType.TEvent); //c.splice( i, 1);
        if (selection.event === event) {
            selection.select(c[i] || c[i - 1], ModelType.TEvent);
        }
    }
    //#endregion event

    //#region draw
    static addDraw(draw: Draw, generate?: GenerateType, afterDraw?: Draw): void {

        var c = draw._event.draws;
        var afterIndex = afterDraw ? Find.indexOf(c, 'id', afterDraw.id) : c.length - 1;

        if (generate) {
            var lib = Services.drawLibFor(draw);
            var draws = lib.generateDraw(draw, generate, afterIndex);
            if (!draws || !draws.length) {
                return;
            }
            undo.splice(c, afterIndex + 1, 0, draws, "Add " + draw.name, ModelType.Draw); //c.splice( i, 1, draws);

            for (var i = 0; i < draws.length; i++) {
                var lib = Services.drawLibFor(draws[i]);
                drawLib.initDraw(draws[i], draw._event);
            }
            selection.select(draws[0], ModelType.Draw);

        } else {
            draw.id = Guid.create('d');
            undo.insert(c, afterIndex + 1, draw, "Add " + draw.name, ModelType.Draw); //c.push( draw);
            selection.select(draw, ModelType.Draw);
        }
    }

    static updateDraw(draw: Draw, oldDraw?: Draw, generate?: GenerateType): void {
        var isSelected = selection.draw === oldDraw;
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
            undo.splice(c, i, group.length, draws, "Generate " + GenerateType[generate] + ' ' + draw.name, ModelType.Draw);

            for (var i = 0; i < draws.length; i++) {
                drawLib.initDraw(draws[i], draw._event);
            }
            draw = draws[0];
        } else {    //edit draw
            var i = Find.indexOf(c, "id", draw.id, "Draw to edit not found");
            undo.update(c, i, draw, "Edit " + draw.name + " " + i, ModelType.Draw); //c[i] = draw;
        }
        if (isSelected || generate) {
            selection.select(draw, ModelType.Draw);
            drawLib.refresh(draw);  //force refresh
        }
    }

    static updateQualif(draw: Draw): void {
        undo.newGroup('Update qualified', () => {
            drawLib.updateQualif(draw);
            return true;
        }, draw);
    }

    static removeDraw(draw: Draw): void {
        var c = draw._event.draws;
        var i = Find.indexOf(c, "id", draw.id, "Draw to remove not found");
        undo.remove(c, i, "Delete " + draw.name + " " + i, ModelType.Draw); //c.splice( i, 1);
        if (selection.draw === draw) {
            selection.select(c[i] || c[i - 1], ModelType.Draw);   //select next or previous
        }
    }

    static validateDraw(draw: Draw): void {
        validation.resetDraw(draw);
        validation.validateDraw(draw);
        if (selection.draw === draw) {
            drawLib.refresh(draw);  //force refresh
        }
    }
    //#endregion draw

    //#region match
    static editMatch(editedMatch: Match, match: Match): void {
        drawLib.initBox(editedMatch, editedMatch._draw);
        var c = match._draw.boxes;
        var i = Find.indexOf(c, "position", editedMatch.position, "Match to edit not found");
        undo.newGroup("Edit match", () => {
            undo.update(c, i, editedMatch, "Edit " + editedMatch.position + " " + i, ModelType.Match); //c[i] = editedMatch;
            if (editedMatch.qualifOut) {
                //report qualified player to next draw
                var nextGroup = drawLib.nextGroup(editedMatch._draw);
                if (nextGroup) {
                    var boxIn = drawLib.groupFindPlayerIn(nextGroup, editedMatch.qualifOut);
                    if (boxIn) {
                        //undo.update(boxIn, 'playerId', editedMatch.playerId, 'Set player');  //boxIn.playerId = editedMatch.playerId;
                        //undo.update(boxIn, '_player', editedMatch._player, 'Set player');  //boxIn._player = editedMatch._player;
                        undo.update(boxIn, 'playerId', editedMatch.playerId, 'Set player',
                            () => drawLib.initBox(boxIn, boxIn._draw));  //boxIn.playerId = editedMatch.playerId;
                    }
                }
            }
            return true;
        });
    }
    //static erasePlayer(box: Box): void {
    //    //undo.newGroup("Erase player", () => {
    //    //    undo.update(box, 'playerId', null);  //box.playerId = undefined;
    //    //    undo.update(box, '_player', null);  //box._player = undefined;
    //    //    return true;
    //    //}, box);

    //    //undo.update(box, 'playerId', null, "Erase player",     //box.playerId = undefined;
    //    //    () => drawLib.initBox(box, box._draw)
    //    //    );  

    //    var prev = box.playerId;
    //    undo.action((bUndo: boolean) => {
    //        box.playerId = bUndo ? prev : undefined;
    //        drawLib.initBox(box, box._draw)
    //        selection.select(box, ModelType.Box);
    //    }, "Erase player");
    //}
    //static eraseScore(match: Match): void {
    //    undo.newGroup("Erase score", () => {
    //        undo.update(match, 'score', '');  //box.score = '';
    //        return true;
    //    }, match);
    //}
    static erasePlanning(match: Match): void {
        undo.newGroup("Erase player", () => {
            undo.update(match, 'place', null); //match.place = undefined;
            undo.update(match, 'date', null);  //match.date = undefined;
            return true;
        }, match);
    }
    //#endregion match

    //public select(r: any, type?: ModelType): void {
    //    selection.select(r, type);
    //}
}