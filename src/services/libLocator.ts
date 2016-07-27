
export class LibLocator {

	private static _drawLibs: {[t:number]:IDrawLib} = {};

	static registerDrawlib(drawLib: IDrawLib, type:DrawType): void {
		this._drawLibs[type] = drawLib;
	}

	static drawLibFor(draw: Draw | DrawType): IDrawLib {
		let drawType : DrawType = 'number' === typeof draw ? draw : (<Draw>draw).type;
		return this._drawLibs[drawType];
	}

}