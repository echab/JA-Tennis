
export class Services {

	private static _drawLibs: {[t:number]:IDrawLib} = {};

	static registerDrawlib(drawLib: IDrawLib, type:DrawType): void {
		this._drawLibs[type] = drawLib;
	}

	static drawLibFor(draw: Draw): IDrawLib {
		return this._drawLibs[ draw.type];
	}

}