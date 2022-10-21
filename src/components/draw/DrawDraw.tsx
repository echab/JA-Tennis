import { Component, createSignal, Setter, Show } from 'solid-js';
import { selection } from '../util/selection';
import { Draw, DrawType, Match } from '../../domain/draw';
import { Player } from '../../domain/player';
import { DialogMatch } from './DialogMatch';
import { commandManager } from '../../services/util/commandManager';
import { updateMatch } from '../../services/drawService';
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

  const [isDlgMatch, showDlgMatch] = createSignal(false);

  const places = selection.tournament.places ?? [];

  return <>
    <Show when={props.event && props.draw && selection.box && isDlgMatch()}>
      <DialogMatch event={props.event} draw={props.draw}
        players={props.players} places={places}
        match={selection.box as Match}
        onOk={commandManager.wrap(updateMatch)}
        onClose={() => showDlgMatch(false)}
      />
    </Show>
    <Show when={props.draw.type & DrawType.PouleSimple} fallback={
      <DrawKnockout event={props.event} draw={props.draw} players={props.players} showDlgMatch={showDlgMatch} />
    }>
      <DrawRoundRobin event={props.event} draw={props.draw} players={props.players} showDlgMatch={showDlgMatch} />
    </Show>
  </>
}
