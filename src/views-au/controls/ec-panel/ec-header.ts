import { EcPanel } from './ec-panel';

export class EcHeader {
    panel:EcPanel;

    created(owningView /*: View*/, myView /*: View*/) {
        this.panel = myView.container.parent.viewModel;
    }
}