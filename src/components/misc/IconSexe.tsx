import { Component } from "solid-js";
import { SexeString } from "../../domain/player";

type Props = {
    sexe?: SexeString;
    double?: boolean;
}

export const IconSexe: Component<Props> = (props) => (
    <i classList={{
        'icon2-male': props.sexe === 'H' && !props.double,
        'icon2-female': props.sexe === 'F' && !props.double,
        'icon2-mixte': props.sexe === 'M' && !props.double,
        'icon2-double-male': props.sexe === 'H' && props.double,
        'icon2-double-female': props.sexe === 'F' && props.double,
        'icon2-double-mixte': props.sexe === 'M' && props.double,
    }}/>
)