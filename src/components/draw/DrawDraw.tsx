import { Component, Show } from 'solid-js';
import { Draw, DrawType } from '../../domain/draw';
import { Player } from '../../domain/player';
import { Place, TEvent } from '../../domain/tournament';
import './Draw.css';
import { DrawKnockout } from './DrawKnockout';
import { DrawRoundRobin } from './DrawRoundRobin';

type Props = {
  event: TEvent,
  draw: Draw,
  players: Player[],
  places: Place[],
}

export const DrawDraw: Component<Props> = (props) => {
  return <Show when={props.draw.type & DrawType.Roundrobin} fallback={
    <DrawKnockout event={props.event} draw={props.draw} players={props.players} places={props.places} />
  }>
    <DrawRoundRobin event={props.event} draw={props.draw} players={props.players} places={props.places} />
  </Show>
}
