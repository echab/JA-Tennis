import { autoinject } from 'aurelia-framework';

@autoinject
export class CheckListCustomAttribute {

    private list: string[];
    private input : HTMLInputElement;

    constructor(private element: Element) {
        if( element.tagName !== 'INPUT') {
            throw "Bad element";
        }
        this.input = <HTMLInputElement>element;

        this.input.addEventListener("change", this.changeHandler.bind(this));
    }

    bind() {
        this.list = (<any>this).value;
        this.valueChanged(this.list, undefined);
    }

    valueChanged(list, oldValue) {
        if (list) {
            var index = list.indexOf(this.input.value);
            this.input.checked = index !== -1;
        }
    }


    private changeHandler() {
        let input = this.input;
        var checked = input.checked;
        if (!this.list) {
            this.list = [];
        }
        var index = this.list.indexOf(input.value);

        if (checked && index == -1) {
            this.list.push(input.value);
        } else if (!checked && index != -1) {
            this.list.splice(index, 1);
        }
    }

}

/*TODO check-list

interface CheckListScope extends ng.IScope {
    list: string[];
    value: string;
}

angular.module('jat.utils.checkList', [])

    .directive('checkList', () => {
        return {
            scope: {
                list: '=checkList',
                value: '@'
            },
            link: (scope: CheckListScope, elem: JQuery, attrs: any) => {

                bindingEngine.propertyObserver( this, 'list').subscribe( (list:string[]) => {
                //scope.$watch('list', (list:string[]) => {
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
                    } else if (!checked && index != -1) {
                        scope.list.splice(index, 1);
                    }
                }

                elem.bind('change', () => {
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