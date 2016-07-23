import { DrawLib as drawLib } from './draw/drawLib';
import { Guid } from './util/guid';
import { isObject,extend } from './util/object'
import { shuffle } from '../utils/tool';
import { rank } from './types';

var MINUTES = 60000,
    DAYS = 24 * 60 * MINUTES;

export class TournamentLib {

    public static newTournament(source?: Tournament): Tournament {
        var tournament: Tournament = <any>{};
        if (isObject(source)) {
            extend(tournament, source);
        }
        this.initTournament(tournament);
        return tournament;
    }

    public static newInfo(source?: TournamentInfo): TournamentInfo {
        var info: TournamentInfo = <any>{};
        if (isObject(source)) {
            extend(info, source);
        }
        return info;
    }

    public static initTournament(tournament: Tournament): void {
        if (tournament.players) {
            for (var i = tournament.players.length - 1; i >= 0; i--) {
                //tournament.players[i] = new Player(tournament, tournament.players[i]);
                this.initPlayer(tournament.players[i], tournament);
            }
        }
        if (tournament.events) {
            for (var i = tournament.events.length - 1; i >= 0; i--) {
                //tournament.events[i] = new TEvent(tournament, tournament.events[i]);
                this.initEvent(tournament.events[i], tournament);
            }
        }

        tournament.info = tournament.info || { name: '' };
        tournament.info.slotLength = tournament.info.slotLength || 90 * MINUTES;
        if (tournament.info.start && tournament.info.end) {
            tournament._dayCount = Math.floor((tournament.info.end.getTime() - tournament.info.start.getTime()) / DAYS + 1);
        }
    }


    public static newPlayer(parent: Tournament, source?: Player): Player {
        var player: Player = <any>{};
        if (isObject(source)) {
            extend(player, source);
        }
        player.id = player.id || Guid.create('p');
        delete (<any>player).$$hashKey;   //TODO remove angular id

        this.initPlayer(player, parent);
        return player;
    }

    public static initPlayer(player: Player, parent: Tournament) {
        player._tournament = parent;
        //player.toString = function () {
        //    return this.name + ' ' + this.rank;
        //};
    }


    public static newEvent(parent: Tournament, source?: TEvent): TEvent {
        var event: TEvent = <any>{};
        if (isObject(source)) {
            extend(event, source);
        }
        event.id = event.id || Guid.create('e');
        delete (<any>event).$$hashKey;   //TODO remove angular id

        this.initEvent(event, parent);
        return event;
    }

    public static initEvent(event: TEvent, parent: Tournament): void {
        event._tournament = parent;

        var c = event.draws = event.draws || [];
        if (c) {
            for (var i = c.length - 1; i >= 0; i--) {
                var draw = c[i];
                drawLib.initDraw(draw, event);

                //init draws linked list
                draw._previous = c[i - 1];
                draw._next = c[i + 1];
            }
        }
    }

    public static isRegistred(event: TEvent, player: Player): boolean {
        return player.registration && player.registration.indexOf(event.id) !== -1;
    }

    public static getRegistred(event: TEvent): Player[] {
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

    public static TriJoueurs(players: Array<Player|number>): void {

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

    public static GetJoueursInscrit(draw: Draw): Player[] {

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

    public static isSexeCompatible(event: TEvent, sexe: string): boolean {
        return event.sexe === sexe	//sexe épreuve = sexe joueur
        || (event.sexe === 'M' && !event.typeDouble);	//ou simple mixte
    }
}