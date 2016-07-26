import { autoinject,bindable } from 'aurelia-framework';

import { DrawDraw } from './draw-draw';
import { Main } from '../main';

@autoinject
export class DrawBox {

    @bindable box: Box;

    isMatch: boolean;
    error: IError;

    private main: Main;

    bind(bindingContext: Object, overrideContext: Object) {
        this.main = (<DrawDraw>bindingContext).main;
        this.boxChanged(this.box, undefined);
    }

    boxChanged(box:Box, oldValue:Box) {
        this.isMatch = isMatch(box);
        //this.error = validation.getErrorBox(box);
    }

    isPlayed(): boolean {
        return this.isMatch && !!(<Match>this.box).score;
    }
}

function isMatch(box: Box): boolean {
    return box && ('score' in box);
}