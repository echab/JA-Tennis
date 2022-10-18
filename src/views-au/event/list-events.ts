import { autoinject, bindable } from 'aurelia-framework';

import { Selection } from '../../services/selection';

@autoinject
export class ListEvents {
    
    @bindable events: TEvent[];

    constructor(
        private selection: Selection
        ) {
    }
}