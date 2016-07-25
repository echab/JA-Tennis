import { autoinject,bindable } from 'aurelia-framework';
import { DialogController } from 'aurelia-dialog';

interface InfoModel {
    title: string;
    info: TournamentInfo;
};

@autoinject
export class DialogInfo {

    title: string;
    info: TournamentInfo;

    constructor(private controller: DialogController) { }

    activate(model: InfoModel) {
        this.title = model.title;
        this.info = model.info;
    }
}