import { autoinject, bindable } from 'aurelia-framework';

import { EventEditor } from '../../services/eventEditor';
import { DrawEditor } from '../../services/drawEditor';
import { Selection } from '../../services/util/selection';

@autoinject
export class ListEvents {
    
    @bindable events: TEvent[];

    constructor(
        private eventEditor: EventEditor,
        private drawEditor: DrawEditor,
        private selection: Selection
        ) {
    }
}