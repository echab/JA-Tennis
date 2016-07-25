import { autoinject, bindable } from 'aurelia-framework';

import { Main } from '../main';

export class ListEvents {
    @bindable events: TEvent[];

    private main: Main;

    //constructor(selection: Selection) {
    //}

    created(owningView /*: View*/, myView /*: View*/) {
        this.main = Main.getAncestorViewModel( myView.container, Main);
    }
    
}