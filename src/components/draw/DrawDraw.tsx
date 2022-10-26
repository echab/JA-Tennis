import { Component, Show } from 'solid-js';
import { Draw, DrawType } from '../../domain/draw';
import { Player } from '../../domain/player';
import { TEvent } from '../../domain/tournament';
import './Draw.css';
import { DrawKnockout } from './DrawKnockout';
import { DrawRoundRobin } from './DrawRoundRobin';

type Props = {
  event: TEvent,
  draw: Draw,
  players: Player[],
}

export const DrawDraw: Component<Props> = (props) => {
  return <Show when={props.draw.type & DrawType.PouleSimple} fallback={
    <DrawKnockout event={props.event} draw={props.draw} players={props.players} />
  }>
    <DrawRoundRobin event={props.event} draw={props.draw} players={props.players} />
  </Show>
}
