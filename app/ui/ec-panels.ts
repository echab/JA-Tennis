'use strict';
module ec.ui {
    /**
     * @ngdoc overview
     * @name ec.panels
     *
     * @description
     * AngularJS version of the panels directive.
     */
    /*
    <style type="text/css">
    html, body {
        width:100%;
        height: 100%;
        margin: 0;
        overflow: hidden;
        }
    .panels {
        width: 100%;
        height: 100%;
        white-space: nowrap;
    }
    .panel {
        display: inline-block;
        height: 100%;
        background-color: #bbb;
        transition: width .5s;
    }

    .panel .header {
        display: block;
        margin-left: 3em;
        height: 3em;
        background-color: #f8f8f8;
        border-color: #e7e7e7;
        transition: margin-left .5s;
    }
    .panelbadge {
        position: absolute;
        display: inline-block;
        width: 1em;
        height: 1em;
        color: #555;
        background-color: #bbb;
        padding: 1em;
        text-align:center;
        z-index: 2;
        -moz-user-select: none; -webkit-user-select: none; -ms-user-select:none; user-select:none;
        transition: all .5s;
    }
    .panel .header .title {
        display: inline-block;
        right: 0em;
        height: 3em;
        color: #333;
    }

    .panelbadge:not(.active) {
        background-color: lightsteelblue;
        color: black;
    }
    </style>
    */

    interface Panel extends ng.IScope {
        isOpen: boolean;
        isDisabled: boolean;
        marginLeft: number;
        badge: Badge;
        toggleOpen: Function;
        getWidth: Function;
        //onSelect: Function;
        //onDeselect: Function;
    }
    interface Badge extends ng.IScope {
        panel: Panel;
    }
    interface Header extends ng.IScope {
        panel: Panel;
    }

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
    class PanelsetController {
        panels: Panel[] = [];
        badges: Badge[] = [];
        selectCount: number;

        //static $inject = [];
        constructor() {
        }

        public select(panel: Panel, select: boolean): void {

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

        public addBadge(badge: Badge): void {
            this.badges.push(badge);
            badge.$on('$destroy', () =>
                this.removeBadge(badge)
                );
        }

        public addPanel(panel: Panel): void {
            var badge = this.badges[this.panels.length];
            badge.panel = panel;
            panel.badge = badge;
            panel.marginLeft = 0;
            this.panels.push(panel);
            if (panel.isOpen) {
                this.selectCount++;
            }
            panel.$on('$destroy', () =>
                this.removePanel(panel)
                );
        }

        public removePanel(panel: Panel): void {
            var index = this.panels.indexOf(panel);
            if (panel.isOpen) {
                this.selectCount--;
            }
            if (panel.badge) {
                delete panel.badge.panel;
            }
            this.panels.splice(index, 1);
        }

        public removeBadge(badge: Badge): void {
            var index = this.badges.indexOf(badge);
            if (badge.panel) {
                delete badge.panel.badge;
            }
            this.badges.splice(index, 1);
        }
    }

    class PanelController {
        //Empty controller so other directives can require being 'under' a panel

        scope: Panel;

        static $inject = [
            '$scope'
        ];
        constructor($scope: Panel) {
            this.scope = $scope;
        }
    }

    function ecPanelsetDirective() {
        return {
            restrict: 'EA',
            transclude: true,
            replace: true,
            scope: {},
            controller: 'PanelsetController',
            templateUrl: 'template/panels/panelset.html'
            //,link: (scope, element, attrs) => {
            //    scope.vertical = angular.isDefined(attrs.vertical) ? scope.$parent.$eval(attrs.vertical) : false;
            //}
        };
    }

    //ecPanelDirective.$inject = ['$parse'];
    function ecPanelDirective() {   //$parse: ng.IParseService
        return {
            require: '^ecPanelset',
            restrict: 'EA',
            replace: true,
            templateUrl: 'template/panels/panel.html',
            transclude: true,
            scope: {    //isolated scope
                //heading: '@',
                isOpen: '=?',
                isDisabled: '=?'
                //,onSelect: '&select', //This callback is called in contentHeadingTransclude
                ////once it inserts the panel's content into the dom
                //onDeselect: '&deselect'
            },
            controller: 'PanelController',  //Empty controller so other directives can require being 'under' a panel
            link: function postLink(scope: Panel, elm: JQuery, attrs: any, panelsetCtrl: PanelsetController) {  //,transclude

                //scope.isOpen = scope.isOpen == 'true';

                panelsetCtrl.addPanel(scope);

                scope.$watch('isOpen', (value) =>
                    panelsetCtrl.select(scope, !!value)
                    );

                scope.toggleOpen = () => {
                    if (!scope.isDisabled) {
                        scope.isOpen = !scope.isOpen;
                    }
                };

                scope.getWidth = () => {
                    return Math.floor(100 / panelsetCtrl.selectCount) + '%';
                };
            }
        };
    }

    function ecBadgeDirective() {
        return {
            require: '^ecPanelset',
            restrict: 'EA',
            replace: true,
            templateUrl: 'template/panels/badge.html',
            transclude: true,
            scope: {},  //isolated scope
            link: function postLink(scope: Badge, elm: JQuery, attrs: any, panelsetCtrl: PanelsetController) {

                scope.panel = null;

                panelsetCtrl.addBadge(scope);
            }
        };
    }

    function ecHeaderDirective() {
        return {
            require: '^ecPanel',
            restrict: 'EA',
            replace: true,
            templateUrl: 'template/panels/header.html',
            transclude: true    //implies a new scope
            //,scope: true
            //scope: {},
            , link: function postLink(scope: Header, elm: JQuery, attrs: any, panelCtrl: PanelController) {
                scope.panel = panelCtrl.scope;
            }
        };
    }

    function templateCache($templateCache: ng.ITemplateCacheService) {
        $templateCache.put("template/panels/panelset.html",
            "<div class='panels'"
            + " ng-transclude>"
            + "</div>");

        $templateCache.put("template/panels/badge.html",
            "<div class='panelbadge' ng-class='{active: panel.isOpen, disabled: panel.isDisabled}'"
            + " ng-style=\"{'margin-left': (panel.marginLeft) * 3 +'em'}\""
            + " ng-click='panel.toggleOpen()' ng-dblclick='panel.toggleOpen(true)'"
            + " ng-transclude>"
            + "</div>");

        $templateCache.put("template/panels/panel.html",
            "<div class='panel' ng-class='{active: isOpen, disabled: isDisabled}'"
            + " ng-style=\"{'width': isOpen ? getWidth() : 0}\""
            + " ng-transclude>"
            + "</div>");

        $templateCache.put("template/panels/header.html",
            "<div class='header'"
            + " ng-style=\"{'margin-left': (1 + panel.marginLeft) * 3 +'em'}\""
            + " ng-transclude>"
            + "</div>");
    }

    angular.module('ec.panels', [])
        .controller('PanelsetController', PanelsetController)
        .controller('PanelController', PanelController)
        .directive('ecPanelset', ecPanelsetDirective)
        .directive('ecPanel', ecPanelDirective)
        .directive('ecBadge', ecBadgeDirective)
        .directive('ecHeader', ecHeaderDirective)
        .run(["$templateCache", templateCache])
    ;
}