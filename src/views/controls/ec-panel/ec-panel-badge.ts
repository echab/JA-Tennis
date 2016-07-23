import { EcPanel } from './ec-panel';

export class EcPanelBadge {

    panel : EcPanel;

    attached() {
        this.panel.panelsetCtrl.addBadge(this);
    }

    detached() {
        this.panel.panelsetCtrl.removeBadge(this);
    }

}

// function ecBadgeDirective(): ng.IDirective {
//     return {
//         require: '^ecPanelset',
//         restrict: 'EA',
//         replace: true,
//         templateUrl: 'template/panels/badge.html',
//         transclude: true,
//         scope: {},  //isolated scope
//         link: function postLink(scope: Badge, elm: JQuery, attrs: any, panelsetCtrl: PanelsetController) {

//             scope.panel = null;

//             panelsetCtrl.addBadge(scope);
//         }
//     };
// }

