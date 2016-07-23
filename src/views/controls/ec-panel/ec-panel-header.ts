import { EcPanel } from './ec-panel';

export class EcPanelHeader {
    panel:EcPanel;
}

// function ecHeaderDirective(): ng.IDirective {
//     return {
//         require: '^ecPanel',
//         restrict: 'EA',
//         replace: true,
//         templateUrl: 'template/panels/header.html',
//         transclude: true    //implies a new scope
//         //,scope: true
//         //scope: {},
//         , link: function postLink(scope: Header, elm: JQuery, attrs: any, panelCtrl: PanelController) {
//             scope.panel = panelCtrl.scope;
//         }
//     };
// }
