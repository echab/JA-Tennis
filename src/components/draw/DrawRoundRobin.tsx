import { type Component, For } from 'solid-js';
import type { PlayerIn, Draw, Match } from '../../domain/draw';
import { mapBy } from '../../services/util/find';
import type { TEvent, Tournament } from '../../domain/tournament';
import { DrawBox } from './DrawBox';
import './Draw.css';

type Props = {
    event: TEvent,
    draw: Draw,
    tournament: Tournament,
}

export const DrawRoundRobin: Component<Props> = (props) => {

    const boxes = () => mapBy<PlayerIn & Match>(props.draw.boxes as Match[], 'position');

    //for round robin, fill the list of rows/columns for the view
    const rows = () => {
        const n = props.draw.nbColumn;
        const rows = Array.from<number[]>({ length: n });
        for (let r = 0; r < n; r++) {
            const cols = Array.from<number>({ length: n + 1 });

            let b = (n + 1) * n - r - 1;
            for (let c = 0; c <= n; c++) {
                cols[c] = b;
                b -= n;
            }
            rows[r] = cols;
        }
        return rows;
    }

    const outs = () => Array.from({ length: props.draw.nbOut - 1 }, (_, i) => i + 1);

    const isDiag = (position: number): boolean => {
        return props.draw && (position % props.draw.nbColumn) * (props.draw.nbColumn + 1) === position;
    }

    return <table class="draw roundrobin"
        // onclick={selectBox(event, draw, undefined)}
    >
        <tbody>
            <tr class="h-8">
                <td class="w-32" />
                <For each={rows()}>{(row) =>
                    <td class="w-32">
                        <DrawBox box={boxes().get(row[0])} players={props.tournament.players}
                            // if.bind={props.draw.type !== ROUNDROBIN}
                        />
                    </td>
                }</For>
                <td>
                    <For each={outs()}>{(out) =>
                        <div class="qualifOut">Q{out}</div>
                    }</For>
                </td>
            </tr>
            <For each={rows()}>{(row) =>
                <tr class="h-8">
                    <For each={row}>{(col) =>
                        <td class={{ diag: isDiag(col) }}>
                            <DrawBox box={boxes().get(col)} players={props.tournament.players}
                                //  if.bind={props.draw.type !== ROUNDROBIN}
                            />
                        </td>
                    }</For>
                </tr>
            }</For>

        </tbody>
    </table>
}

// type BoxProps = {
//     box?: PlayerIn & Match;
//     players: Player[];
// }
