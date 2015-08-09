angular.module('jat.utils.checkList', [])
    .directive('checkList', function () {
    return {
        scope: {
            list: '=checkList',
            value: '@'
        },
        link: function (scope, elem, attrs) {
            scope.$watch('list', function (list) {
                if (list) {
                    var index = list.indexOf(scope.value);
                    elem.prop('checked', index != -1);
                }
            }, true);
            function changeHandler() {
                var checked = elem.prop('checked');
                if (!scope.list) {
                    scope.list = [];
                }
                var index = scope.list.indexOf(scope.value);
                if (checked && index == -1) {
                    scope.list.push(scope.value);
                }
                else if (!checked && index != -1) {
                    scope.list.splice(index, 1);
                }
            }
            elem.bind('change', function () {
                scope.$apply(changeHandler);
            });
        }
    };
});
/*
.directive('checkedArray', () => {
    return {
        restrict: 'A',
        require: '?ngModel', // get a hold of NgModelController
        scope: {
            array: '=checkedArray',
            value: '@'
        },
        link: (scope, element, attrs, ngModel) => {

            if (!ngModel) return; // do nothing if no ng-model

            // Specify how UI should be updated
            ngModel.$render = () => {
                //console.log("render:" + ngModel.$viewValue);
                var index = scope.array.indexOf( element.val());
                element.prop('checked', index !== -1);
            };

            // Listen for change events to enable binding
            element.bind('change', (event) => {
                console.log("change, event:" + event.target.checked);
                scope.$apply(read);
            });
            read(); // initialize
            //ngModel.$setViewValue(true);

            // Write data to the model
            function read() {
                //console.log("read:");
                //ngModel.$setViewValue(element.prop('checked'));
                var index = scope.array.indexOf( element.val());
                ngModel.$setViewValue( index !== -1);
            }
        }
    };
});
//*/ 
