import { autoinject,bindable } from 'aurelia-framework';

import { Selection } from '../../services/util/selection';

@autoinject
export class DrawBox {

    @bindable box: Box;

    isMatch: boolean;
    error: IError;

    constructor(
        private selection:Selection
    ) {
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