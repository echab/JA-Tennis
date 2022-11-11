/* eslint-disable no-bitwise */
import type { TEvent, Tournament } from '../../domain/tournament';
import type { Params } from '../App';
import { Component, For, Show } from 'solid-js';
import { selectBox, selectDay, urlBox } from '../util/selection';
import { PlayerIn, Draw, Match, BUILD, FINAL } from '../../domain/draw';
import { byId, mapBy } from '../../services/util/find';
import { showDialog } from '../Dialogs';
import { A, useParams } from '@solidjs/router';
import { isMatch } from '../../services/drawService';
import { columnMax, columnMin, countInCol, positionTopCol } from '../../services/draw/knockoutLib';
import { dayOf } from '../../services/planningService';
import './Draw.css';
import { drawLib } from '../../services/draw/drawLib';

type Props = {
    event: TEvent,
    draw: Draw,
    tournament: Tournament,
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
                player: byId(props.tournament.players, box?.playerId),
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

    // for VainDef, retreive the name of the winner
    const lib = () => drawLib(props.event, props.draw);
    const otherName = (match?: Match) => {
        if (!match) { return ''; }
        const { player1, player2 } = lib().boxesOpponents(match);
        const otherId = match.playerId ? match.playerId === player1.playerId ? player2.playerId : player1.playerId : undefined;
        const otherPlayer = otherId ? byId(props.tournament.players, otherId) : undefined;
        return otherPlayer ? `${otherPlayer.name} ${otherPlayer.firstname?.[0] ?? ''}` : '';
    };

    return <table class="tableau">
        <tbody>
            <For each={lignes()}>{(l) =>
                <tr>
                    <For each={cols(l)}>{({ odd, even, rowspan, box, player, isRight }) =>
                        <td rowspan={rowspan} classList={{
                            even, odd, qs: isRight
                        }}>
                            <Show when={props.draw.lock === BUILD || even || odd}>
                                {/* TODO <DrawBox box={b} players={props.tournament.players} /> */}
                                <A class="boite joueur block print:border-none print:bg-transparent"
                                    classList={{ selected: !!params.boxPos && +params.boxPos === box?.position }}
                                    // onclick={(evt) => { selectBox(props.event, props.draw, box); evt.preventDefault(); }}
                                    // onclick={() => navigate(urlBox(box), {replace:true})}
                                    href={urlBox(box)} replace noScroll={true}
                                    id={`pos${box?.position}`}
                                >
                                    {/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */}
                                    <Show when={box?.qualifIn !== undefined}><span class="qe">Q{box!.qualifIn || ''}</span></Show>
                                    {/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */}
                                    <Show when={box?.seeded}><span class="ts">{box!.seeded}</span></Show>

                                    {/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */}
                                    <Show when={box?.order && box.order > 0}><small class="pr-1">{box!.order}</small></Show>
                                    <Show when={box && isMatch(box)}><small class="pr-1">m</small></Show>

                                    <Show when={box?.vainqDef} fallback={
                                        <span class="nom">{player?.name}
                                            <Show when={box?.order && box.order > 0}> {player?.firstname}</Show>
                                        </span>
                                    }>
                                        <span class="nom inline-block border-l-2 border-gray-500 ml-2 pl-1">{player?.name} requalified<br />{otherName(box)} withdraws</span>
                                    </Show>
                                    {/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */}
                                    <Show when={box?.order && box.order > 0 && player?.rank}><span class="classement">{player!.rank}</span></Show>
                                    {/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */}
                                    <Show when={box?.qualifOut}><span class="qs">Q{box!.qualifOut}</span></Show>
                                    <br />
                                    <Show when={box?.order && box.order > 0}>
                                        {/* <i class="icon2-qualif-in hover" title="Edit qualified in"
                                          onclick={() => {
                                            selectBox(props.event, props.draw, box);
                                            // showDialog("qualif");
                                          }}
                                        /> */}
                                        <span class="club">{player?.club}</span>
                                    </Show>
                                    <Show when={box && isMatch(box)}>
                                        <span title="Edit the match"
                                            onclick={() => {
                                                selectBox(props.event, props.draw, box);
                                                showDialog("match");
                                            }}>
                                            <i class="icon2-match hover2" />
                                            <Show when={box?.note}><i class='icon2-note'/></Show>
                                        </span>

                                        <Show when={box?.date}>
                                            <i title="View in planning"
                                                classList={{
                                                    'icon2-planning':  !!box?.date,
                                                    'hover':  !!box?.date,
                                                    'icon2-planning-no': !box?.date,
                                                }}
                                                onclick={(evt) => {
                                                    evt.preventDefault();
                                                    selectDay(dayOf(box?.date, props.tournament.info));
                                                }}
                                            />
                                        </Show>
                                        <Show when={box?.score || box?.wo} fallback={
                                            <>
                                                {/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */}
                                                <Show when={box?.date}><span class="date">{box!.date!.toLocaleString()}</span></Show>
                                                {/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */}
                                                <Show when={box?.place !== undefined}> <span class="place">{props.tournament.places?.[box!.place!]?.name ?? ''}</span></Show>
                                            </>
                                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                                        }><span class="score">{`${box!.score}${box?.wo ? ' WO' : ''}`}</span></Show>

                                        <Show when={isRight && props.draw.type !== FINAL}>
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
