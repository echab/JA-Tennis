'use strict';
var ec;
(function (ec) {
    var ui;
    (function (ui) {
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
        var PanelsetController = (function () {
            //static $inject = [];
            function PanelsetController() {
                this.panels = [];
                this.badges = [];
                this.selectCount = 0;
            }
            PanelsetController.prototype.select = function (panel, select) {
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
                    }
                    else {
                        n--;
                    }
                    this.panels[i].marginLeft = n;
                }
            };
            PanelsetController.prototype.addBadge = function (badge) {
                var _this = this;
                this.badges.push(badge);
                badge.$on('$destroy', function () {
                    return _this.removeBadge(badge);
                });
            };
            PanelsetController.prototype.addPanel = function (panel) {
                var _this = this;
                var badge = this.badges[this.panels.length];
                badge.panel = panel;
                panel.badge = badge;
                panel.marginLeft = 0;
                this.panels.push(panel);
                if (panel.isOpen) {
                    this.selectCount++;
                }
                panel.$on('$destroy', function () {
                    return _this.removePanel(panel);
                });
            };
            PanelsetController.prototype.removePanel = function (panel) {
                var index = this.panels.indexOf(panel);
                if (panel.isOpen) {
                    this.selectCount--;
                }
                if (panel.badge) {
                    delete panel.badge.panel;
                }
                this.panels.splice(index, 1);
            };
            PanelsetController.prototype.removeBadge = function (badge) {
                var index = this.badges.indexOf(badge);
                if (badge.panel) {
                    delete badge.panel.badge;
                }
                this.badges.splice(index, 1);
            };
            return PanelsetController;
        })();
        var PanelController = (function () {
            function PanelController($scope) {
                this.scope = $scope;
            }
            PanelController.$inject = [
                '$scope'
            ];
            return PanelController;
        })();
        function ecPanelsetDirective() {
            return {
                restrict: 'EA',
                transclude: true,
                replace: true,
                scope: {},
                controller: 'PanelsetController',
                templateUrl: 'template/panels/panelset.html'
            };
        }
        //ecPanelDirective.$inject = ['$parse'];
        function ecPanelDirective() {
            return {
                require: '^ecPanelset',
                restrict: 'EA',
                replace: true,
                templateUrl: 'template/panels/panel.html',
                transclude: true,
                scope: {
                    //heading: '@',
                    isOpen: '=?',
                    isDisabled: '=?'
                },
                controller: 'PanelController',
                link: function postLink(scope, elm, attrs, panelsetCtrl) {
                    //scope.isOpen = scope.isOpen == 'true';
                    panelsetCtrl.addPanel(scope);
                    scope.$watch('isOpen', function (value) {
                        return panelsetCtrl.select(scope, !!value);
                    });
                    scope.toggleOpen = function () {
                        if (!scope.isDisabled) {
                            scope.isOpen = !scope.isOpen;
                        }
                    };
                    scope.getWidth = function () {
                        return panelsetCtrl.selectCount ? (Math.floor(100 / panelsetCtrl.selectCount) + '%') : 'auto';
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
                scope: {},
                link: function postLink(scope, elm, attrs, panelsetCtrl) {
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
                transclude: true //implies a new scope
                ,
                link: function postLink(scope, elm, attrs, panelCtrl) {
                    scope.panel = panelCtrl.scope;
                }
            };
        }
        function templateCache($templateCache) {
            $templateCache.put("template/panels/panelset.html", "<div class='panels'"
                + " ng-transclude>"
                + "</div>");
            $templateCache.put("template/panels/badge.html", "<div class='panelbadge' ng-class='{active: panel.isOpen, disabled: panel.isDisabled}'"
                + " ng-style=\"{'margin-left': (panel.marginLeft) * 3 +'em'}\""
                + " ng-click='panel.toggleOpen()' ng-dblclick='panel.toggleOpen(true)'"
                + " ng-transclude>"
                + "</div>");
            $templateCache.put("template/panels/panel.html", "<div class='panel' ng-class='{active: isOpen, disabled: isDisabled}'"
                + " ng-style=\"{'width': isOpen ? getWidth() : 0}\""
                + " ng-transclude>"
                + "</div>");
            $templateCache.put("template/panels/header.html", "<div class='header'"
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
            .run(["$templateCache", templateCache]);
    })(ui = ec.ui || (ec.ui = {}));
})(ec || (ec = {}));
