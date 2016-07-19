
export class Services {

	private static _drawLibs: {[t:number]:IDrawLib} = {};

	static registerDrawlib(drawLib: IDrawLib, type:DrawType): void {
		this._drawLibs[type] = drawLib;
	}

	static drawLibFor(draw: Draw | DrawType): IDrawLib {
		//TODO remove cast?
		return this._drawLibs[ <number> ( (<Draw>draw).type ? (<Draw>draw).type : draw)];
	}

}