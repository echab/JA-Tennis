import { EcPanelset } from './ec-panelset';
import { EcPanel } from './ec-panel';

export class EcBadge {

    panelSet : EcPanelset;
    panel : EcPanel;

    bind( bindingContext: EcPanelset, overrideContext: Object) {
        this.panelSet = bindingContext;
    }

    attached() {
        this.panel.panelSet.addBadge(this);
    }

    detached() {
        this.panel.panelSet.removeBadge(this);
    }

}