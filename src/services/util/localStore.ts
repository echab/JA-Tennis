import { createEffect } from "solid-js";
import { createStore, SetStoreFunction, Store } from "solid-js/store";

export type Options = {
    /** reviver for `JSON.parse` */
    reviver?: (this: any, key: string, value: any) => any,
    /** replacer for `JSON.stringify` */
    replacer?: (this: any, key: string, value: any) => any,
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
