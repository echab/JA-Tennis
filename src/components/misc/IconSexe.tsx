import { Component } from "solid-js";

type Props = {
    sexe?: 'H' | 'F' | 'M';
}
export const IconSexe: Component<Props> = (props) => (
    <i classList={{
        'icon2-male': props.sexe === 'H',
        'icon2-female': props.sexe === 'F',
        'icon2-mixte': props.sexe === 'M',
    }}></i>
)