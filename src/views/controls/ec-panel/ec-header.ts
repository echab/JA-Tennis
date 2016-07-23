import { EcPanel } from './ec-panel';

export class EcHeader {
    panel:EcPanel;

    bind( bindingContext: EcPanel, overrideContext: Object) {
        //scope.panel = panelCtrl.scope;
        this.panel = bindingContext;
    }
}