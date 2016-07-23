import { autoinject } from 'aurelia-framework';
import { bindable } from 'aurelia-framework';
import { BindingEngine } from 'aurelia-framework'

import { EcPanelSet } from './ec-panel-set';
import { EcPanelBadge } from './ec-panel-badge';

@autoinject
export class EcPanel {
    //Empty controller so other directives can require being 'under' a panel

    //require: '^ecPanelset',

    @bindable isOpen: boolean;
    @bindable isDisabled: boolean;

    panelsetCtrl : EcPanelSet;
    badge: EcPanelBadge;
    marginLeft: number;

    constructor(
        private bindingEngine: BindingEngine    //$watch
    ) {
    }

    attached() {
        this.panelsetCtrl.addPanel(this);

        //scope.$watch('isOpen', (value) => {
        this.bindingEngine.propertyObserver( this, 'isOpen').subscribe( (value: boolean) => {
            this.panelsetCtrl.select(this, !!value)
        });
    }

    toggleOpen() {
        if (!this.isDisabled) {
            this.isOpen = !this.isOpen;
        }
    }

    getWidth() {
        return this.panelsetCtrl.selectCount ? (Math.floor(100 / this.panelsetCtrl.selectCount) + '%') : 'auto';
    }

    detached() {
        this.panelsetCtrl.removePanel(this);
    }
}

// //ecPanelDirective.$inject = ['$parse'];
// function ecPanelDirective(): ng.IDirective {   //$parse: ng.IParseService
//     return {
//         require: '^ecPanelset',
//         restrict: 'EA',
//         replace: true,
//         templateUrl: 'template/panels/panel.html',
//         transclude: true,
//         scope: {    //isolated scope
//             //heading: '@',
//             isOpen: '=?',
//             isDisabled: '=?'
//             //,onSelect: '&select', //This callback is called in contentHeadingTransclude
//             ////once it inserts the panel's content into the dom
//             //onDeselect: '&deselect'
//         },
//         controller: 'PanelController',  //Empty controller so other directives can require being 'under' a panel
//         link: function postLink(scope: Panel, elm: JQuery, attrs: any, panelsetCtrl: PanelsetController) {  //,transclude

//             //scope.isOpen = scope.isOpen == 'true';

//             panelsetCtrl.addPanel(scope);

//             bindingEngine.propertyObserver( this, 'isOpen').subscribe( (value: boolean) => {
//             //scope.$watch('isOpen', (value) => {
//                 panelsetCtrl.select(scope, !!value)
//             });

//             scope.toggleOpen = () => {
//                 if (!scope.isDisabled) {
//                     scope.isOpen = !scope.isOpen;
//                 }
//             };

//             scope.getWidth = () => {
//                 return panelsetCtrl.selectCount ? (Math.floor(100 / panelsetCtrl.selectCount) + '%') : 'auto';
//             };
//         }
//     };
// }
