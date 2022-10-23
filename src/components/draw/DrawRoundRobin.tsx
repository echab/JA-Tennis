import { Component, For, Setter, Show } from 'solid-js';
import { selection } from '../util/selection';
import { Box, PlayerIn, Draw, DrawType, Match } from '../../domain/draw';
import { byId, mapBy } from '../../services/util/find';
import { Player } from '../../domain/player';
import { TEvent } from '../../domain/tournament';
import './Draw.css';
import { DrawBox } from './DrawBox';

type Props = {
  event: TEvent,
  draw: Draw,
  players: Player[],
  showDlgMatch: Setter<boolean>,
}

export const DrawRoundRobin: Component<Props> = (props) => {
  const oT = props.draw;
  const boxes = mapBy<PlayerIn & Match>(oT.boxes as Match[], 'position');

  const simple = oT.type === DrawType.PouleSimple

  //for round robin, fill the list of rows/columns for the view
  let n = oT.nbColumn;
  const rows: number[][] = new Array(n);
  for (let r = 0; r < n; r++) {
    const cols: number[] = new Array(n + 1);

    let b = (n + 1) * n - r - 1;
    for (let c = 0; c <= n; c++) {
      cols[c] = b;
      b -= n;
    }
    rows[r] = cols;
  }

  const outs = Array(oT.nbOut - 1).fill(0).map((_, i) => i + 1);

  const isDiag = (position: number): boolean => {
    return oT && (position % oT.nbColumn) * (oT.nbColumn + 1) === position;
  }

  return <table class="draw roundrobin"
  // onclick={selectBox(event, draw, undefined)}
  >
    <tbody>
      <tr class="h-8">
        <td class="w-32"></td>
        <For each={rows}>{(row) =>
          <td class="w-32">
            <DrawBox box={boxes.get(row[0])} players={props.players}
            // if.bind="!simple"
            />
          </td>
        }</For>
        <td>
          <For each={outs}>{(out) =>
            <div class="qualifOut">Q{out}</div>
          }</For>
        </td>
      </tr>
      <For each={rows}>{(row, iRow) =>
        <tr class="h-8">
          <For each={row}>{(col, iCol) =>
            <td classList={{ diag: isDiag(col) }}>
              <DrawBox box={boxes.get(col)} players={props.players}
              //  if.bind="!simple" 
              />
            </td>
          }</For>
        </tr>
      }</For>

    </tbody>
  </table>
}

type BoxProps = {
  box?: PlayerIn & Match;
  players: Player[];
}
