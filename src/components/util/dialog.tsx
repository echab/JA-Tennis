import { createSignal, JSX, JSXElement } from "solid-js"

export function dialog<T extends {}>(element: JSX.FunctionElement) {
    const [isOpen, setOpen] = createSignal<T>();

    // TODO?

    return [isOpen, setOpen];
}