import { createEffect } from "solid-js";
import { createStore, SetStoreFunction, Store } from "solid-js/store";

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
): [Store<T>, SetStoreFunction<T>] {
    const localState = localStorage.getItem(name);
    const [state, setState] = createStore<T>(
        localState ? JSON.parse(localState, options?.reviver) : init
    );
    createEffect(() => {
        localStorage.setItem(name, JSON.stringify(state, options?.replacer, options?.space));
    });
    return [state, setState];
}
