import {autoinject} from 'aurelia-framework';
import {bindable} from 'aurelia-framework';

@autoinject
export class DialogInfo {

    constructor(
        private title: string,
        private info: TournamentInfo
        ) {

    }
}