import { Component, For, Show } from 'solid-js';
import { selectBox } from '../util/selection';
import { PlayerIn, Draw, Match } from '../../domain/draw';
import { columnMax, columnMin, countInCol, positionTopCol } from '../../utils/drawUtil';
import { byId, mapBy } from '../../services/util/find';
import { Player } from '../../domain/player';
import { TEvent } from '../../domain/tournament';
import './Draw.css';
import { showDialog } from '../Dialogs';

type Props = {
  event: TEvent,
  draw: Draw,
  players: Player[],
}

export const DrawKnockout: Component<Props> = (props) => {

  const lignes = () => {
    const nLigne = countInCol(columnMax(props.draw.nbColumn, props.draw.nbOut), props.draw.nbOut);
    return Array(nLigne).fill(0).map((_, i) => i);
  } 

  const cols = (l: number) => {
    const result = [];
    const cMax = columnMax(props.draw.nbColumn, props.draw.nbOut);
    const cMin = columnMin(props.draw.nbOut);
    const boxes = mapBy<PlayerIn & Match>(props.draw.boxes as Match[], 'position');
    for (let c = cMax; c >= cMin; c--) {
      const ic = cMax - c;
      const pos = positionTopCol(c) - (l >> ic);
      const box = boxes.get(pos);
      result.push({
        box,
        player: byId(props.players, box?.playerId),
        even: (pos & 1) === 0,
        odd: (pos & 1) !== 0,
        rowspan: 1 << ic,
        isRight: c === cMin,
      });
      if (pos & 1) {
        break;
      }
    }
    return result;
  }

  return <table class="tableau">
    <tbody>
      <For each={lignes()}>{(l) =>
        <tr>
          <For each={cols(l)}>{({odd, even, rowspan, box, player, isRight}) =>
            <td rowspan={rowspan} classList={{
              even, odd, qs: isRight
            }}>
              {/* TODO <DrawBox box={b} players={props.players} /> */}
              <div class="boite joueur"
                onclick={(evt) => {selectBox(props.event, props.draw, box); evt.cancelBubble = true; }}
              >
                <Show when={box?.qualifIn}><span class="qe">Q{box!.qualifIn}</span></Show>
                <Show when={box?.seeded}><span class="ts">{box!.seeded}</span></Show>
                <span class="nom">{player?.name}
                  <Show when={box?.order}> {player?.firstname}</Show>
                </span>
                <Show when={box?.order && player?.rank}><span class="classement">{player!.rank}</span></Show>
                <Show when={box?.qualifOut}><span class="qs">Q{box!.qualifOut}</span></Show>
                <br />
                <Show when={box?.order} fallback={
                  <>
                    <i class="icon2-match hover"
                      onclick={() => {
                        selectBox(props.event, props.draw, box);
                        showDialog("match");
                      }}
                    ></i>
                    <Show when={box?.score} fallback={
                      <Show when={box?.date}><span class="date">{box!.date!.toLocaleString()}</span></Show>
                    }><span class="score">{box!.score}</span></Show>
                  </>
                }><span class="club">{player?.club}</span></Show>
              </div>
            </td>
          }</For>
        </tr>
      }</For>
    </tbody>
  </table>
}
