import {autoinject,bindable} from 'aurelia-framework';
import {DialogService,DialogResult} from 'aurelia-dialog';
//import { HttpClient } from 'aurelia-fetch-client';
import { HttpClient } from 'aurelia-http-client';

import {DialogInfo} from '../views/tournament/dialog-info';
import { EventEditor } from './eventEditor';
import { PlayerEditor } from './playerEditor';

import { Selection,ModelType } from './selection';
import { Guid } from './util/guid';
import { Undo } from './util/undo';
import { copy } from '../utils/tool';
import { isObject,extend } from './util/object'
import { shuffle } from '../utils/tool';
import { rank } from './types';

const MINUTES = 60000,
    DAYS = 24 * 60 * MINUTES;

@autoinject
export class TournamentEditor {

    constructor(
        private dialogService: DialogService,
        public selection:Selection, 
        private undo:Undo
    ) {}

    create(): Promise<Tournament> {
        //TODO confirmation
        //TODO undo

        return this.edit().then( tournament => {
            if( tournament) {
                //save current tournament
                this.save();

                //reset undo and select the new tournament
                this.undo.reset();
                return this.selection.select(tournament, ModelType.Tournament);
            }
        });
    }

    edit(tournament?: Tournament): Promise<Tournament> {

        const title = tournament ? "Edit info" : "New tournament";

        if( !tournament) {
            tournament = {
                id: Guid.create('T'),
                info: {
                    name: ''
                },
                players: [],
                events: []
            };
        }

        var editedInfo = TournamentEditor._newInfo(tournament.info);

        return this.dialogService.open({
            viewModel: DialogInfo, 
            model: {
                title: title,
                info: editedInfo
            }
        }).then((result: DialogResult) => {
            if ('Ok' === result.output) {
                this.undo.updateProperties(tournament.info, editedInfo, title); //tournament.info.* = editedInfo.*;
                return tournament;
            }
        });
    }

    /** This function load tournament data from an url. */
    load(file_url?: Blob|string): Promise<Tournament> {
        if (!file_url) {
            return new Promise((resolve, reject) => {
                var data = window.localStorage['tournament'];
                if (data) {
                    var tournament: Tournament = JSON.parse(data);
                    TournamentEditor.init(tournament);
                    //this.selection.select(tournament, ModelType.Tournament);
                    resolve(tournament);
                } else {
                    reject('nothing in storage');
                }
            });
        } else if (typeof file_url === 'string') {
            let client = new HttpClient();
            return client.get(file_url).then(data => {
                data.response = data.response.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/g, ''); //remove comments
                let tournament : Tournament = JSON.parse( data.response); 
                tournament._url = <string>file_url;
                TournamentEditor.init(tournament);
                //this.selection.select(tournament, ModelType.Tournament);
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
                        TournamentEditor.init(tournament);
                        //this.selection.select(tournament, ModelType.Tournament);
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

    save(tournament?: Tournament, url?: string): Promise<void> {

        if( !tournament) {
            tournament = this.selection.tournament;
        }

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

    // =====

    static newTournament(source?: Tournament): Tournament {
        var tournament: Tournament = <any>{};
        if (isObject(source)) {
            extend(tournament, source);
        }
        this.init(tournament);
        return tournament;
    }

    private static _newInfo(source?: TournamentInfo): TournamentInfo {
        var info: TournamentInfo = <any>{};
        if (isObject(source)) {
            extend(info, source);
        }
        return info;
    }

    static init(tournament: Tournament): void {
        if (tournament.players) {
            for (var i = tournament.players.length - 1; i >= 0; i--) {
                //tournament.players[i] = new Player(tournament, tournament.players[i]);
                PlayerEditor.init(tournament.players[i], tournament);
            }
        }
        if (tournament.events) {
            for (var i = tournament.events.length - 1; i >= 0; i--) {
                //tournament.events[i] = new TEvent(tournament, tournament.events[i]);
                EventEditor.init(tournament.events[i], tournament);
            }
        }

        tournament.info = tournament.info || { name: '' };
        tournament.info.slotLength = tournament.info.slotLength || 90 * MINUTES;
        if (tournament.info.start && tournament.info.end) {
            tournament._dayCount = Math.floor((tournament.info.end.getTime() - tournament.info.start.getTime()) / DAYS + 1);
        }
    }


    static isRegistred(event: TEvent, player: Player): boolean {
        return player.registration && player.registration.indexOf(event.id) !== -1;
    }

    static getRegistred(event: TEvent): Player[] {
        var a: Player[] = [];
        var c = event._tournament.players;
        for (var i = 0, n = c.length; i < n; i++) {
            var player = c[i];
            if (this.isRegistred(event, player)) {
                a.push(player);
            }
        }
        return a;
    }

    static getRegisteredPlayers(draw: Draw): Player[] { //GetJoueursInscrit

        //Récupère les joueurs inscrits
        var players = draw._event._tournament.players,
            ppJoueur: Player[] = [], //new short[nPlayer],
            nPlayer = 0;
        for (var i = 0; i < players.length; i++) {
            var pJ = players[i];
            if (this.isRegistred(draw._event, pJ)) {
                if (!pJ.rank
                    || rank.within(pJ.rank, draw.minRank, draw.maxRank)) {
                    ppJoueur.push(pJ);	//no du joueur
                }
            }
        }

        return ppJoueur;
    }

    static sortPlayers(players: Array<Player|number>): void {

        //Tri les joueurs par classement
        var comparePlayersByRank = (p1: Player|number, p2: Player|number): number => {
            //if numbers, p1 or p2 are PlayerIn
            var isNumber1 = 'number' === typeof p1,
                isNumber2 = 'number' === typeof p2;
            if (isNumber1 && isNumber2) {
                return 0;
            }
            if (isNumber1) {
                return -1;
            }
            if (isNumber2) {
                return 1;
            }
            return rank.compare((<Player>p1).rank, (<Player>p2).rank);
        };
        players.sort(comparePlayersByRank);

        //Mélange les joueurs de même classement
        for (var r0 = 0, r1 = 1; r0 < players.length; r1++) {
            if (r1 === players.length || comparePlayersByRank(players[r0], players[r1])) {
                //nouvelle plage de classement

                //r0: premier joueur de l'intervalle
                //r1: premier joueur de l'intervalle suivant
                shuffle(players, r0, r1);

                r0 = r1;
            }
        }
    }

    static isSexeCompatible(event: TEvent, sexe: string): boolean {
        return event.sexe === sexe	//sexe épreuve = sexe joueur
        || (event.sexe === 'M' && !event.typeDouble);	//ou simple mixte
    }
    
}