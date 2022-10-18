import { autoinject,bindable,BindingEngine, computedFrom } from 'aurelia-framework';

import { EcPanelset } from './ec-panelset';
import { EcBadge } from './ec-badge';

@autoinject
export class EcPanel {
    //Empty controller so other directives can require being 'under' a panel

    //require: '^ecPanelset',

    @bindable isOpen: boolean;
    @bindable isDisabled: boolean;

    panelset : EcPanelset;
    badge: EcBadge;
    marginLeft: number;

    constructor(
        private bindingEngine: BindingEngine    //$watch
    ) {
        //console.info("panel ctr");
    }

    created(owningView /*: View*/, myView /*: View*/) {
        this.panelset = myView.container.parent.viewModel;
        this.panelset.addPanel(this);

        //scope.$watch('isOpen', (value) => {
        this.bindingEngine.propertyObserver( this, 'isOpen').subscribe( (value: boolean) => {
            this.panelset.select(this, !!value)
        });
    }

    // bind( bindingContext: EcPanelset, overrideContext: Object) {
    // }

    // attached() {
    // }

    addBadge(badge: EcBadge): void {
        this.badge = badge;
        this.panelset.addBadge(badge);
    }

    toggleOpen() {
        if (!this.isDisabled) {
            this.isOpen = !this.isOpen;
        }
    }

    @computedFrom('panelset.selectCount')
    get width() {
        return this.panelset && this.panelset.selectCount ? (Math.floor(100 / this.panelset.selectCount) + '%') : 'auto';
    }

    // detached() {
    // }

    unbind() {
        //console.info("panel unbind");
        this.panelset.removePanel(this);
    }
}