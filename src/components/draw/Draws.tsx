import { Component, For } from 'solid-js';
import { selection } from '../util/selection';
import { Draw } from '../../domain/draw';

type Props = {
  draws: Draw[];
}

export const Draws: Component<Props> = (props) => {

    return <div>Draws {props.draws.length} TODO</div>
}