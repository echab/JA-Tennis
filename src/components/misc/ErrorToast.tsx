import { Component } from "solid-js";

type Props = {
    message: string;
}

export const ErrorToast: Component<Props> = (props) => {
    console.error(props.message);

    return <div class="bg-black text-white border-red-500 border-2">
        <h3 class="font-bold">⚠ Error</h3>
        <div class="font-mono">{props.message}</div>
    </div>
}