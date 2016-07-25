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
    </ec-panelset>
    <hr />
    <panelset vertical="true">
        <panel heading="Vertical Panel 1"><b>First</b> Vertical Content!</panel>
        <panel heading="Vertical Panel 2"><i>Second</i> Vertical Content!</panel>
    </panelset>
    </file>
</example>
    */

import { autoinject } from 'aurelia-framework';
import { bindable } from 'aurelia-framework';

import { EcPanel } from './ec-panel';    
import { EcBadge } from './ec-badge';    

@autoinject
export class EcPanelset {

    @bindable vertical:boolean;

    panels: EcPanel[] = [];
    badges: EcBadge[] = [];

    selectCount: number = 0;

    constructor() {
        //console.info("panelset ctr");
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

    public addPanel(panel: EcPanel): void {
        // var badge = this.badges[this.panels.length];
        // badge.panel = panel;
        // panel.badge = badge;
        panel.marginLeft = 0;
        this.panels.push(panel);
        if (panel.isOpen) {
            this.selectCount++;
        }
    }

    public addBadge(badge: EcBadge): void {
        this.badges.push(badge);
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

    public removeBadge(badge: EcBadge): void {
        var index = this.badges.indexOf(badge);
        if (badge.panel) {
            delete badge.panel.badge;
        }
        this.badges.splice(index, 1);
    }
}