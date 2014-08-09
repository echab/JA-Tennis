
declare module uib {

    export module mock {

        interface IModalService<T> {
            close(result?: T): void;    //append close method for mock
        }
    }
}