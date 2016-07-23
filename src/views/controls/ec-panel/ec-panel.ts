import { autoinject } from 'aurelia-framework';
import { bindable } from 'aurelia-framework';
import { BindingEngine } from 'aurelia-framework'

import { EcPanelset } from './ec-panelset';
import { EcBadge } from './ec-badge';

@autoinject
export class EcPanel {
    //Empty controller so other directives can require being 'under' a panel

    //require: '^ecPanelset',

    @bindable isOpen: boolean;
    @bindable isDisabled: boolean;

    panelSet : EcPanelset;
    badge: EcBadge;
    marginLeft: number;

    constructor(
        private bindingEngine: BindingEngine    //$watch
    ) {
    }

    bind( bindingContext: EcPanelset, overrideContext: Object) {
        this.panelSet = bindingContext;

    }

    attached() {
        this.panelSet.addPanel(this);

        //scope.$watch('isOpen', (value) => {
        this.bindingEngine.propertyObserver( this, 'isOpen').subscribe( (value: boolean) => {
            this.panelSet.select(this, !!value)
        });
    }

    toggleOpen() {
        if (!this.isDisabled) {
            this.isOpen = !this.isOpen;
        }
    }

    getWidth() {
        return this.panelSet.selectCount ? (Math.floor(100 / this.panelSet.selectCount) + '%') : 'auto';
    }

    detached() {
        this.panelSet.removePanel(this);
    }
}