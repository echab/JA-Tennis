import { createStore, snapshot, type Store, type StoreSetter } from "solid-js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type any_ = any;

export type Options = {
    /** reviver for `JSON.parse` */
    reviver?: (this: any_, key: string, value: any_) => any_,
    /** replacer for `JSON.stringify` */
    replacer?: (this: any_, key: string, value: any_) => any_,
    space?: string | number,
}

export function createLocalStore<T extends object>(
    name: string,
    init: T,
    options?: Options
): [Store<T>, StoreSetter<T>] {

    const localState = localStorage.getItem(name);

    const [state, _setState] = createStore<T>(
        localState ? JSON.parse(localState, options?.reviver) : init,
        { name: `st${name}`, shallow: true }
    );

    const setState: StoreSetter<T> = (setter) => {
        _setState((draft) => {
            const override = setter(draft);
            localStorage.setItem(name, JSON.stringify(snapshot(draft), options?.replacer, options?.space));
            return override;
        });
    };
    return [state, setState];
}
