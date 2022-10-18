//import { View } from 'aurelia-templating';
import { EcPanelset } from './ec-panelset';
import { EcPanel } from './ec-panel';

export class EcBadge {

    panel : EcPanel;

    constructor() {
        //console.info('badge ctr');
    }

    created(owningView /*: View*/, myView /*: View*/) {
        //console.info('badge created');
        this.panel = myView.container.parent.viewModel;
        this.panel.addBadge( this);
    }

    // bind( bindingContext: Object /*Main*/, overrideContext: Object) {
    // }

    // attached() {
    // }

    // detached() {
    // }

    unbind() {
        this.panel.panelset.removeBadge(this);
    }

}