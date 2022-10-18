import { Component, For, Setter, Show } from 'solid-js';
import { selectBox } from '../util/selection';
import { BoxIn, Draw, Match } from '../../domain/draw';
import { columnMax, columnMin, countInCol, positionTopCol } from '../../utils/drawUtil';
import { byId, mapBy } from '../../services/util/find';
import { Player } from '../../domain/player';
import { TEvent } from '../../domain/tournament';
import './Draw.css';

type Props = {
  event: TEvent,
  draw: Draw,
  players: Player[],
  showDlgMatch: Setter<boolean>,
}

export const DrawKnockout: Component<Props> = (props) => {
  const oT = props.draw;
  const boxes = mapBy<BoxIn & Match>(oT.boxes as Match[], 'position');

  const nLigne = countInCol(columnMax(oT.nbColumn, oT.nbOut), oT.nbOut);
  const lignes = Array(nLigne).fill(0).map((_, i) => i);
  const cMax = columnMax(oT.nbColumn, oT.nbOut);
  const cMin = columnMin(oT.nbOut);

  const cols = (l: number) => {
    const result = [];
    for (let c = cMax; c >= cMin; c--) {
      const ic = cMax - c;
      const colR = c === cMin;
      const i = positionTopCol(c) - (l >> ic);
      const b = boxes.get(i);
      const j = b?.playerId ? byId(props.players, b.playerId) : undefined;
      result.push({ i, rs: 1 << ic, ...b, position: i, ...j, colR });
      if (i & 1) {
        break;
      }
    }
    return result;
  }

  return <table class="tableau">
    <tbody>
      <For each={lignes}>{(l) =>
        <tr>
          <For each={cols(l)}>{(b) =>
            <td rowspan={b.rs} classList={{
              pair: b.i % 2 === 0,
              impair: b.i % 2 === 1,
              qs: b.colR
            }}>
              {/* TODO <DrawBox box={b} players={props.players} /> */}
              <div class="boite joueur">
                <Show when={b.qualifIn}><span class="qe">Q{b.qualifIn}</span></Show>
                <Show when={b.seeded}><span class="ts">{b.seeded}</span></Show>
                <span class="nom">{b.name}</span>
                <Show when={b.order && b.rank}><span class="classement">{b.rank}</span></Show>
                <Show when={b.qualifOut}><span class="qs">Q{b.qualifOut}</span></Show>
                <br />
                <Show when={b.order} fallback={
                  <>
                    <i class="icon2-match hover"
                      onclick={() => {
                        selectBox(props.event!, props.draw, b);
                        props.showDlgMatch(true);
                      }}
                    ></i>
                    <Show when={b.score} fallback={
                      <Show when={b.date}><span class="date">{b.date?.toLocaleString()}</span></Show>
                    }><span class="score">{b.score}</span></Show>
                  </>
                }><span class="club">{b.club}</span></Show>
              </div>
            </td>
          }</For>
        </tr>
      }</For>
    </tbody>
  </table>
}
