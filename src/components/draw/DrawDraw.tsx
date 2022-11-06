import type { TEvent, Tournament } from '../../domain/tournament';
import { Component, Show } from 'solid-js';
import { Draw, ROUNDROBIN } from '../../domain/draw';
import { DrawKnockout } from './DrawKnockout';
import { DrawRoundRobin } from './DrawRoundRobin';
import './Draw.css';

type Props = {
    event: TEvent,
    draw: Draw,
    tournament: Tournament,
}

export const DrawDraw: Component<Props> = (props) => {
    // eslint-disable-next-line no-bitwise
    return <Show when={props.draw.type & ROUNDROBIN} fallback={
        <DrawKnockout event={props.event} draw={props.draw} tournament={props.tournament} />
    }>
        <DrawRoundRobin event={props.event} draw={props.draw} tournament={props.tournament} />
    </Show>
}
