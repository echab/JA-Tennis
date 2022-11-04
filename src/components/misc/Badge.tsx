import { Component, Show } from "solid-js";

type Props = {
    count: number;
    /** badge is not displayed if count is less than minDisplay */
    minDisplay?: number;
    class?: string;
}

export const Badge: Component<Props> = (props) => {
    return <Show when={props.count >= (props.minDisplay ?? 0)}>
        <span
            class={`absolute top-1 right-2 text-xs text-white bg-red-600 rounded-full border-[1px] border-white px-1 py-0 ${props.class ?? ''}`}
        >{props.count}</span>
    </Show>
}
