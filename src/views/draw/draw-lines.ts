import {autoinject} from 'aurelia-framework';

import {DrawDraw} from './draw-draw';

@autoinject
export class DrawLinesCustomAttribute {

	private canvas:HTMLCanvasElement;

    private drawDraw: DrawDraw;

	constructor(private element: Element){
		if( element.tagName !== 'CANVAS') {
			throw "Bad element";
		}
		this.canvas = <HTMLCanvasElement>element;

        //this.drawDraw = findClosestDrawDraw( element, DrawDraw);
	}

    bind() {
        let value = (<any>this).value;
        this.drawDraw = value;
        this.valueChanged(value, undefined);
    }

    valueChanged(drawDraw, oldValue) {
        if( !this.drawDraw) {
            return;
        }
        this.drawDraw.drawLines( this.canvas);
    }
	
}

function findClosestDrawDraw( element:Element, clazz:Function): DrawDraw {
    for( let e = element; e; e=e.parentElement) {
        let au = (<any>e).au;
        if( au && au.viewModel instanceof clazz) {
            return au.viewModel;
        }
    }
}


// function drawLinesDirective(): ng.IDirective {
//     return {
//         restrict: 'A',
//         require: '^draw',
//         link: (scope: ng.IScope, element: JQuery, attrs: any, ctrlDraw: DrawDraw) => {
//             //attrs.$observe( 'drawLines', () => {
//             //bindingEngine.propertyObserver( draw, 'drawLines').subscribe( (drawLines: string) => {
//             scope.$watch(attrs.drawLines, () => {
//                 ctrlDraw.drawLines(element);
//             });
//         }
//     };
// }