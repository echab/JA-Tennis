declare module uib {

    interface IModalOptions {
        templateUrl?: string;
        template?: any;
        scope?: ng.IScope;
        controller?: any;   //TODO function or string
        resolve?: Object;
        backdrop?: boolean;
        keyboard?: boolean;
        windowClass?: string;
    }

    interface IModalService<T> {
        open(opt?: IModalOptions): IModal<T>;
    }

    interface IModal<T> {
        close(result?: T) :void;
        dismiss(reason: String): void;
        result: ng.IPromise<Object>;
        opened: ng.IPromise<Object>;
    }
}