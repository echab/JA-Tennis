import { autoinject,bindable } from 'aurelia-framework';

import { DrawDraw } from './draw-draw';
import { Main } from '../main';

@autoinject
export class DrawBox {

    //drawBox: string;

    @bindable box: Box;
    isMatch: boolean;
    error: IError;

    @bindable dd: DrawDraw;
    private main: Main;

    isPlayed(): boolean {
        return this.isMatch && !!(<Match>this.box).score;
    }

    // constructor() {
    // }

    created(owningView /*: View*/, myView /*: View*/) {
        //this.main = Main.getAncestorViewModel( myView.container, Main);
    }

    bind(bindingContext: Object, overrideContext: Object) {
        this.main = this.dd.main;
        this.boxChanged(this.box, undefined);
    }

    boxChanged(box:Box, oldValue:Box) {
        this.isMatch = isMatch(box);
        //this.error = validation.getErrorBox(box);
    }
}

// function drawBoxDirective(validation: Validation): ng.IDirective {
//     return {
//         restrict: 'EA',
//         scope: true,
//         templateUrl: 'views/draw/drawBox.html',
//         controller: boxCtrl,
//         controllerAs: 'ctrlBox',
//         link: (scope: ng.IScope, element: JQuery, attrs: BoxAttributes, ctrlBox: boxCtrl) => {

//             bindingEngine.propertyObserver( attrs, 'drawBox').subscribe( (box: Box) => {
//             //scope.$watch(attrs.drawBox, (box: Box) => {
//                 ctrlBox.box = box;
//                 ctrlBox.isMatch = isMatch(box);
//                 ctrlBox.error = validation.getErrorBox(box);
//             });
//         }
//     };
// }

function isMatch(box: Box): boolean {
    return box && ('score' in box);
}