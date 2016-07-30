import { DrawLibBase } from './draw/drawLibBase';
import { DrawEditor } from './drawEditor';
import { KnockoutLib } from './draw/knockoutLib';
import { TournamentEditor } from './tournamentEditor';
import {Find} from './util/find';
import {Guid} from './util/guid';
import { isObject,isArray,extend } from './util/object'
import { shuffle,filledArray } from '../utils/tool';
import { LibLocator } from './libLocator';

export class Validation implements IValidation {

    _validLibs: IValidation[] = [];

    _errorsDraw: { [id: string]: IError[] } = {};
    _errorsPlayer: { [id: string]: IError[] } = {};

    constructor() {
    }

    addValidator(validator: IValidation): void {
        this._validLibs.push(validator);
    }

    //Override
    validatePlayer(player: Player): boolean {
        var res = true;
        for (var i = 0; i < this._validLibs.length; i++) {
            res = res && this._validLibs[i].validatePlayer(player);
        }
        return res;
    }

    //Override
    validateDraw(draw: Draw): boolean {
        var res = true;
        for (var i = 0; i < this._validLibs.length; i++) {
            res = res && this._validLibs[i].validateDraw(draw);
        }
        return res;
    }

    errorPlayer(message: string, player: Player, detail?: string): void {
        var a: string[] = [];
        a.push('Validation error on', player.name);
        if (detail) {
            a.push('(' + detail + ')');
        }
        a.push(':', message);
        console.warn(a.join(' '));

        var c = this._errorsPlayer[player.id];
        if (!c) {
            c = this._errorsPlayer[player.id] = [];
        }
        c.push({ message: message, player: player, detail: detail });
    }

    errorDraw(message: string, draw: Draw, box?: Box, detail?: string) {
        var a: string[] = [];
        a.push('Validation error on', draw.name);
        if (box && box._player) {
            a.push('for', box._player.name);
        }
        if (detail) {
            a.push('(' + detail + ')');
        }
        a.push(':', message);
        console.warn(a.join(' '));

        var c = this._errorsDraw[draw.id];
        if (!c) {
            c = this._errorsDraw[draw.id] = [];
        }
        c.push({ message: message, player: box ? box._player : undefined, position: box ? box.position : undefined, detail: detail });
    }

    hasErrorDraw(draw: Draw): boolean {
        var c = draw && this._errorsDraw[draw.id];
        return c && c.length > 0;
    }

    hasErrorBox(box: Box): boolean {
        var c = box && this._errorsDraw[box._draw.id];
        if (c) {
            var e = Find.by(c, 'position', box.position);
        }
        return !!e;
    }

    getErrorDraw(draw: Draw): IError[] {
        return draw && this._errorsDraw[draw.id];
    }

    getErrorBox(box: Box): IError {
        var c = box && this._errorsDraw[box._draw.id];
        if (c) {
            return Find.by(c, 'position', box.position);
        }
    }

    resetPlayer(player: Player): void {
        if (player) {
            delete this._errorsPlayer[player.id];
        } else {
            this._errorsPlayer = {};
        }
    }

    resetDraw(draw: Draw): void {
        if (draw) {
            delete this._errorsDraw[draw.id];
        } else {
            this._errorsDraw = {};
        }
    }
}