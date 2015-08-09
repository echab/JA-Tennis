interface IValidation {
    validatePlayer(player: models.Player): boolean;
    validateDraw(draw: models.Draw): boolean;
    //validateDay(): boolean;   //VerifieJour
}

interface IError {
    message: string;
    player?: models.Player;
    position?: number;
    detail?: string;
}

module jat.service {

    export class Validation implements IValidation {

        _validLibs: IValidation[] = [];

        _errorsDraw: { [id: string]: IError[] } = {};
        _errorsPlayer: { [id: string]: IError[] } = {};

        constructor(private find: jat.service.Find) {
        }

        addValidator(validator: IValidation): void {
            this._validLibs.push(validator);
        }

        //Override
        validatePlayer(player: models.Player): boolean {
            var res = true;
            for (var i = 0; i < this._validLibs.length; i++) {
                res = res && this._validLibs[i].validatePlayer(player);
            }
            return res;
        }

        //Override
        validateDraw(draw: models.Draw): boolean {
            var res = true;
            for (var i = 0; i < this._validLibs.length; i++) {
                res = res && this._validLibs[i].validateDraw(draw);
            }
            return res;
        }

        errorPlayer(message: string, player: models.Player, detail?: string): void {
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

        errorDraw(message: string, draw: models.Draw, box?: models.Box, detail?: string) {
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

        hasErrorDraw(draw: models.Draw): boolean {
            var c = draw && this._errorsDraw[draw.id];
            return c && c.length > 0;
        }

        hasErrorBox(box: models.Box): boolean {
            var c = box && this._errorsDraw[box._draw.id];
            if (c) {
                var e = this.find.by(c, 'position', box.position);
            }
            return !!e;
        }

        getErrorDraw(draw: models.Draw): IError[] {
            return draw && this._errorsDraw[draw.id];
        }

        getErrorBox(box: models.Box): IError {
            var c = box && this._errorsDraw[box._draw.id];
            if (c) {
                return this.find.by(c, 'position', box.position);
            }
        }

        resetPlayer(player: models.Player): void {
            if (player) {
                delete this._errorsPlayer[player.id];
            } else {
                this._errorsPlayer = {};
            }
        }

        resetDraw(draw: models.Draw): void {
            if (draw) {
                delete this._errorsDraw[draw.id];
            } else {
                this._errorsDraw = {};
            }
        }
    }

    angular.module('jat.services.validation', ['jat.services.find'])
        .factory('validation', [
            'find',
            (find: jat.service.Find) => {
            return new Validation(find);
        }]);
}
