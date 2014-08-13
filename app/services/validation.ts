interface IValidation {
    validatePlayer(player: models.Player): boolean;
    validateDraw(draw: models.Draw): boolean;
    //validateDay(): boolean;   //VerifieJour
}

module jat.service {

    export class Validation implements IValidation {

        _validLibs: IValidation[] = [];

        addValidator(validator: IValidation): void {
            this._validLibs.push(validator);
        }

        validatePlayer(player: models.Player): boolean {
            var res = true;
            for (var i = 0; i < this._validLibs.length; i++) {
                res = res && this._validLibs[i].validatePlayer(player);
            }
            return res;
        }

        validateDraw(draw: models.Draw): boolean {
            var res = true;
            for (var i = 0; i < this._validLibs.length; i++) {
                res = res && this._validLibs[i].validateDraw(draw);
            }
            return res;
        }

        error(message: string, player:models.Player): void;
        error(message: string, draw: models.Draw, box?: models.Box, detail?: string): void;
        error(message: string, player_draw: any, box?: models.Box, detail?:string): void {
            var a: string[];
            a.push('Validation error on', player_draw.name);
            if (box && box._player) {
                a.push('for', box._player.name);
            }
            if (detail) {
                a.push('(' + detail + ')');
            }
            a.push(':', message);
            console.warn(a.join(' '));
        }
    }

    angular.module('jat.services.validation', [])
        .factory('validation', () => {
            return new Validation();
        });
}
