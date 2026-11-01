import { createMemo, type Component, For, Repeat, snapshot } from 'solid-js';
import type { PlayerIn, Draw, Match } from '../../domain/draw';
import { byId, mapBy } from '../../services/util/find';
import type { TEvent, Tournament } from '../../domain/tournament';
import type { Player } from '../../domain/player';
import { DrawBox } from './DrawBox';
import './Draw.css';

type Props = {
    event: TEvent,
    draw: Draw,
    tournament: Tournament,
}

export const DrawRoundRobin: Component<Props> = (props) => {

    type Cell = {
        b: number,
        box?: PlayerIn & Match,
        player?: Player,
        playerIn?: boolean,
        isRight?: boolean,
    };
    
    //for round robin, fill the list of rows/columns for the view
    const rows = createMemo(() => {
        const players = props.tournament.players;
        const boxes = mapBy<PlayerIn & Match>(props.draw.boxes as Match[], 'position');
        const n = props.draw.nbColumn;
        return Array.from({ length: n }, (_, r) => {
            let b = (n + 1) * n - r - 1;
            return Array.from({ length: n + 1 }, (_, c) => {
                // TODO snapshot or deep(cell.box) to keep reactivity?
                const box = snapshot(boxes.get(b));
                const player = byId(players, box?.playerId);
                const bCur = b;
                b -= n;
                return { b: bCur, box, player, playerIn: c === 0, isRight: c === n } satisfies Cell;
            });
        });
    }, { name: 'mRows' });

    const isDiag = (position: number): boolean => {
        return (position % props.draw.nbColumn) * (props.draw.nbColumn + 1) === position;
    }

    return <table class="tableau draw roundrobin"
        // onclick={selectBox(event, draw, undefined)}
    >
        <tbody>
            <tr class="h-8">
                <td class="w-32" />
                <For each={rows()}>{(row) =>
                    <td class="w-32">
                        <DrawBox box={row[0].box} player={row[0].player} {...props}
                            // if.bind={props.draw.type !== ROUNDROBIN}
                        />
                    </td>
                }</For>
                <td>
                    <Repeat count={props.draw.nbOut}>{(out) =>
                        <div class="qualifOut">Q{out + 1}</div>
                    }</Repeat>
                </td>
            </tr>
            <For each={rows()}>{(row) =>
                <tr class="h-8">
                    <For each={row}>{(cell) =>
                        <td class={{ diag: isDiag(cell.b) }}>
                            <DrawBox {...cell} {...props}
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
