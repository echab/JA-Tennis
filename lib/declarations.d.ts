declare module ng {
    interface IDirectiveFactory {
        priority?: number;
        template?: string;
        templateUrl?: string;
        replace?: boolean;
        transclude?: boolean;
        restrict?: string;
        scope?: Object;
        link(scope: ng.IScope, element: JQuery, attrs:any, ctrl:Function):void;
        compile?: Function;
    }
}
