import { Component, Show } from 'solid-js';
import { selection } from '../util/selection';
import { Match, PlayerIn } from '../../domain/draw';
import { byId } from '../../services/util/find';
import { Player } from '../../domain/player';
import './Draw.css';
import { isMatch } from '../../services/drawService';

type BoxProps = {
  box?: PlayerIn & Match;
  players: Player[];
}

export const DrawBox: Component<BoxProps> = (props) => {
  const b = props.box;
  if (!b) {
    return <div></div>
  }
  const p = byId(props.players, b.playerId);

  const match = isMatch(b);
  const played = match && !!(b as Match).score;

  return <div
    class="boite joueur"
    classList={{
      match,
      inPlayer: !match,
      played,
      hidden: b.hidden,
      selected: b.position === selection.box?.position,
      // error: 
    }}
  // title={error ? error.message +' '+ error.detail : ''}
  // onclick={selectBox(event, draw, box)}
  >
    <Show when={b.qualifIn}><span class="qe">Q{b.qualifIn === -1 ? '?' : b.qualifIn}</span></Show>
    <Show when={b.seeded}><span class="ts">{b.seeded}</span></Show>
    <span class="nom">{p?.name ?? ''}</span>
    <Show when={b.order && p?.rank}><span class="classement">{p!.rank}</span></Show>
    <Show when={b.qualifOut}><span class="qs">Q{b.qualifOut}</span></Show>
    <br />
    <Show when={b.order} fallback={
      <Show when={b.score} fallback={
        <Show when={b.date}><span class="date">{b.date?.toLocaleString()}</span></Show>
      }><span class="score">{b.score}</span></Show>
    }><span class="club">{p?.club ?? ''}</span></Show>
  </div>
}
