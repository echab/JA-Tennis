module jat.service {

	export class Services {

		private _drawLibs: IDrawLib[] = [];

		registerDrawlib(drawLib: IDrawLib): void {
			this._drawLibs.push(drawLib);
		}

		drawLibFor(draw: models.Draw): IDrawLib {
			for (var i = this._drawLibs.length - 1; i >= 0; i--) {
				var drawLib = this._drawLibs[i];
				if (drawLib.manage(draw)) {
					return drawLib;
				}
			}
			return;
		}

	}

    angular.module('jat.services.services', [])
        .service('services', Services);
}