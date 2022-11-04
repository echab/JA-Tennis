import { Component } from 'solid-js';
import { Draw } from '../../domain/draw';

type Props = {
    draws: Draw[];
}

export const Draws: Component<Props> = (props) => {

    return <div>Draws {props.draws.length} TODO</div>
}