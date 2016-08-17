import { autoinject, bindable } from 'aurelia-framework';

import { Selection } from '../../services/selection';

@autoinject
export class DrawBox {

    @bindable box: Box;

    isMatch: boolean;
    isPlayed: boolean;
    error: IError;

    constructor(
        private selection: Selection
    ) {
    }

    boxChanged(box: Box, oldValue: Box) {
        this.isMatch = isMatch(box);
        this.isPlayed = this.isMatch && !!(<Match>this.box).score;
        //this.error = validation.getErrorBox(box);
    }

    // //TODO @computedFrom('box.score')    //path are not allowed
    // isPlayed(): boolean {
    //     return this.isMatch && !!(<Match>this.box).score;
    // }

    //for debug
    get dump():string {
        return JSON.stringify(this.box, (key,value) =>
            key[0] !== '_' ? value : undefined 
        );
    }
}

function isMatch(box: Box): boolean {
    return box && ('undefined' !== typeof (<Match>box).score);
}