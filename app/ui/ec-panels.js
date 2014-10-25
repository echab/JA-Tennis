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
angular.module('ec.panels', [])

.controller('PanelsetController', ['$scope', function PanelsetCtrl($scope) {
    var ctrl = this,
        panels = ctrl.panels = $scope.panels = [],
        badges = ctrl.badges = $scope.badges = [];

    ctrl.selectCount = 0;

    ctrl.select = function (panel, select) {

        //if (panel.isOpen) {
        //    panel.onSelect();
        //} else {
        //    panel.onDeselect();
        //}

        //compute margins
        ctrl.selectCount = 0;
        for (var i = 0; i < panels.length; i++) {
            panels[i].marginLeft = i;
            if (panels[i].isOpen) {
                ctrl.selectCount++;
                break;
            }
        }
        var firstActive = i;
        var n = 0;
        for (i = panels.length - 1; i > firstActive; i--) {
            if (panels[i].isOpen) {
                ctrl.selectCount++;
                n = 0;
            } else {
                n--;
            }
            panels[i].marginLeft = n;
        }

    };

    ctrl.addBadge = function addBadge(badge) {
        badges.push(badge);
        badge.$on('$destroy', function () {
            ctrl.removeBadge(badge);
        });
    };

    ctrl.addPanel = function addPanel(panel) {
        var badge = badges[panels.length];
        badge.panel = panel;
        panel.badge = badge;
        panel.marginLeft = 0;
        panels.push(panel);
        if (panel.isOpen) {
            ctrl.selectCount++;
        }
        panel.$on('$destroy', function () {
            ctrl.removePanel(panel);
        });
    };

    ctrl.removePanel = function removePanel(panel) {
        var index = panels.indexOf(panel);
        if (panel.isOpen) {
            ctrl.selectCount--;
        }
        if (panel.badge) {
            delete panel.badge.panel;
        }
        panels.splice(index, 1);
    };

    ctrl.removeBadge = function removeBadge(badge) {
        var index = badges.indexOf(badge);
        if (badge.panel) {
            delete badge.panel.badge;
        }
        badge.splice(index, 1);
    }
}])

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
.directive('ecPanelset', function () {
    return {
        restrict: 'EA',
        transclude: true,
        replace: true,
        scope: {},
        controller: 'PanelsetController',
        templateUrl: 'template/panels/panelset.html'
        //,link: function (scope, element, attrs) {
        //    scope.vertical = angular.isDefined(attrs.vertical) ? scope.$parent.$eval(attrs.vertical) : false;
        //}
    };
})

.directive('ecPanel', ['$parse', function ($parse) {
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
        controller: ['$scope', function PanelCtrl($scope) {
            //Empty controller so other directives can require being 'under' a panel
            var ctrl = this;
            ctrl.scope = $scope;
        }],
        link: function postLink(scope, elm, attrs, panelsetCtrl, transclude) {

            //scope.isOpen = scope.isOpen == 'true';

            panelsetCtrl.addPanel(scope);

            scope.$watch('isOpen', function (value) {
                panelsetCtrl.select(scope, !!value);
            });

            scope.toggleOpen = function () {
                if (!scope.isDisabled) {
                    scope.isOpen = !scope.isOpen;
                }
            };

            scope.getWidth = function () {
                return Math.floor(100 / panelsetCtrl.selectCount) + '%';
            };
        }
    };
}])

.directive('ecBadge', [function () {
    return {
        require: '^ecPanelset',
        restrict: 'EA',
        replace: true,
        templateUrl: 'template/panels/badge.html',
        transclude: true,
        scope: {},  //isolated scope
        link: function postLink(scope, elm, attrs, panelsetCtrl) {

            scope.panel = null;

            panelsetCtrl.addBadge(scope);
        }
    };
}])

.directive('ecHeader', [function () {
    return {
        require: '^ecPanel',
        restrict: 'EA',
        replace: true,
        templateUrl: 'template/panels/header.html',
        transclude: true    //implies a new scope
        //,scope: true
        //scope: {},
        , link: function postLink(scope, elm, attrs, panelCtrl) {
            scope.panel = panelCtrl.scope;
        }
    };
}])

//// Use in the accordion-group template to indicate where you want the heading to be transcluded
//// You must provide the property on the accordion-group controller that will hold the transcluded element
//// <div class="accordion-group">
////   <div class="accordion-heading" ><a ... accordion-transclude="heading">...</a></div>
////   ...
//// </div>
//.directive('accordionTransclude', function () {
//    return {
//        require: '^accordionGroup',
//        link: function (scope, element, attr, controller) {
//            scope.$watch(function () { return controller[attr.accordionTransclude]; }, function (heading) {
//                if (heading) {
//                    element.html('');
//                    element.append(heading);
//                }
//            });
//        }
//    };
//})

.run(["$templateCache", function ($templateCache) {
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
}])

;
