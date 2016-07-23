/**
 * @ngdoc directive
 * @name ec.panels.directive:panelset
 * @restrict EA
 *
 * @description
 * Panelset is the outer container for the panels directive
 *
 * @param {boolean=} vertical Whether or not to use vertical styling for the panels.
 *
 * @example
<example module="ec">
    <file name="index.html">
    <ec-panelset>
        <ec-badge>A</ec-badge><panel heading="Vertical Panel 1"><b>First</b> Content!</panel>
        <panel heading="Vertical Panel 2"><i>Second</i> Content!</panel>
    </panelset>
    <hr />
    <panelset vertical="true">
        <panel heading="Vertical Panel 1"><b>First</b> Vertical Content!</panel>
        <panel heading="Vertical Panel 2"><i>Second</i> Vertical Content!</panel>
    </panelset>
    </file>
</example>
    */

import { EcPanel } from './ec-panel';    
import { EcPanelBadge } from './ec-panel-badge';    

export class EcPanelSet {

    panels: EcPanel[] = [];
    badges: EcPanelBadge[] = [];

    selectCount: number = 0;

    constructor() {
    }

    public select(panel: EcPanel, select: boolean): void {

        //if (panel.isOpen) {
        //    panel.onSelect();
        //} else {
        //    panel.onDeselect();
        //}

        //compute margins
        this.selectCount = 0;
        for (var i = 0; i < this.panels.length; i++) {
            this.panels[i].marginLeft = i;
            if (this.panels[i].isOpen) {
                this.selectCount++;
                break;
            }
        }
        var firstActive = i;
        var n = 0;
        for (i = this.panels.length - 1; i > firstActive; i--) {
            if (this.panels[i].isOpen) {
                this.selectCount++;
                n = 0;
            } else {
                n--;
            }
            this.panels[i].marginLeft = n;
        }

    }

    public addBadge(badge: EcPanelBadge): void {
        this.badges.push(badge);
        badge.$on('$destroy', () =>
            this.removeBadge(badge)
            );
    }

    public addPanel(panel: EcPanel): void {
        var badge = this.badges[this.panels.length];
        badge.panel = panel;
        panel.badge = badge;
        panel.marginLeft = 0;
        this.panels.push(panel);
        if (panel.isOpen) {
            this.selectCount++;
        }
        // panel.$on('$destroy', () =>
        //     this.removePanel(panel)
        // );
    }

    public removePanel(panel: EcPanel): void {
        var index = this.panels.indexOf(panel);
        if (panel.isOpen) {
            this.selectCount--;
        }
        if (panel.badge) {
            delete panel.badge.panel;
        }
        this.panels.splice(index, 1);
    }

    public removeBadge(badge: EcPanelBadge): void {
        var index = this.badges.indexOf(badge);
        if (badge.panel) {
            delete badge.panel.badge;
        }
        this.badges.splice(index, 1);
    }
}
// function ecPanelsetDirective(): ng.IDirective {
//     return {
//         restrict: 'EA',
//         transclude: true,
//         replace: true,
//         scope: {},
//         controller: 'PanelsetController',
//         templateUrl: 'template/panels/panelset.html'
//         //,link: (scope, element, attrs) => {
//         //    scope.vertical = angular.isDefined(attrs.vertical) ? scope.$parent.$eval(attrs.vertical) : false;
//         //}
//     };
// }