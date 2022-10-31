import { Component, For, Show } from 'solid-js';
import { selectBox, urlBox } from '../util/selection';
import { PlayerIn, Draw, Match, DrawType, Mode } from '../../domain/draw';
import { byId, mapBy } from '../../services/util/find';
import { Player } from '../../domain/player';
import { Place, TEvent } from '../../domain/tournament';
import { showDialog } from '../Dialogs';
import { A, useParams } from '@solidjs/router';
import { Params } from '../App';
import { isMatch } from '../../services/drawService';
import './Draw.css';
import { columnMax, columnMin, countInCol, positionTopCol } from '../../services/draw/knockoutLib';

type Props = {
  event: TEvent,
  draw: Draw,
  players: Player[],
  places: Place[],
}

export const DrawKnockout: Component<Props> = (props) => {

  const params = useParams<Params>();

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
      const visible = !!box && (!!box.order || box.qualifIn !== undefined || isMatch(box))
      result.push({
        box,
        player: byId(props.players, box?.playerId),
        even: (pos & 1) === 0 && visible,
        odd: (pos & 1) !== 0 && visible,
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
          <For each={cols(l)}>{({ odd, even, rowspan, box, player, isRight }) =>
            <td rowspan={rowspan} classList={{
              even, odd, qs: isRight
            }}>
              <Show when={props.draw.lock === Mode.Build || even || odd}>
                {/* TODO <DrawBox box={b} players={props.players} /> */}
                <A class="boite joueur block"
                  classList={{ selected: !!params.boxPos && +params.boxPos === box?.position }}
                  // onclick={(evt) => { selectBox(props.event, props.draw, box); evt.preventDefault(); }}
                  // onclick={() => navigate(urlBox(box), {replace:true})}
                  href={urlBox(box)} replace noScroll={true}
                  id={`pos${box?.position}`}
                >
                  <Show when={box?.qualifIn !== undefined}><span class="qe">Q{box!.qualifIn || ''}</span></Show>
                  <Show when={box?.seeded}><span class="ts">{box!.seeded}</span></Show>

                  <Show when={box?.order}><small class="pr-1">{box!.order}</small></Show>
                  <Show when={box && isMatch(box)}><small class="pr-1">m</small></Show>

                  <span class="nom">{player?.name}
                    <Show when={box?.order}> {player?.firstname}</Show>
                  </span>
                  <Show when={box?.order && player?.rank}><span class="classement">{player!.rank}</span></Show>
                  <Show when={box?.qualifOut}><span class="qs">Q{box!.qualifOut}</span></Show>
                  <br />
                  <Show when={box?.order}>
                    {/* <i class="icon2-qualif-in hover" title="Edit qualified in"
                      onclick={() => {
                        selectBox(props.event, props.draw, box);
                        // showDialog("qualif");
                      }}
                    /> */}
                    <span class="club">{player?.club}</span>
                  </Show>
                  <Show when={box && isMatch(box)}>
                    <i class="icon2-match hover" title="Edit the match"
                      onclick={() => {
                        selectBox(props.event, props.draw, box);
                        showDialog("match");
                      }}
                    />
                    <Show when={box?.score} fallback={
                      <>
                        <Show when={box?.date}><span class="date">{box!.date!.toLocaleString()}</span></Show>
                        <Show when={box?.place !== undefined}> <span class="place">{(box!.place ? props.places[box!.place]?.name: '') ?? ''}</span></Show>
                        {/* TODO place name */}
                      </>
                    }><span class="score">{box!.score}</span></Show>

                    <Show when={isRight && props.draw.type !== DrawType.Final}>
                      <i class="icon2-qualif-out hover" title="Edit qualified out"
                        onclick={() => {
                          selectBox(props.event, props.draw, box);
                          // showDialog("qualif");
                        }}
                      />
                    </Show>
                  </Show>
                </A>
              </Show>
            </td>
          }</For>
        </tr>
      }</For>
    </tbody>
  </table>
}
