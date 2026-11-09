/* eslint-disable no-bitwise */
import { type Component, createMemo, For, Match as Case, onSettled, Repeat, Show, Switch } from 'solid-js';
import { useLocation, useNavigate, useParams } from '@solidjs/router';
import type { TEvent, Tournament } from '../../domain/tournament';
import type { Params } from '../../App';
import { selectBox, selectPlayer, urlBox } from '../util/selection';
import { type PlayerIn, type Draw, type Match, BUILD, FINAL } from '../../domain/draw';
import { by, byId, mapBy } from '../../services/util/find';
import { showDialog } from '../Dialogs';
import { isMatch, isPlayerIn } from '../../services/drawService';
import { column, columnMax, columnMin, countInCol, positionBottomCol, positionMatch, positionMax, positionOpponent1, positionTopCol } from '../../services/draw/knockoutLib';
import { drawLib } from '../../services/draw/drawLib';
import './Draw.css';

type Props = {
    event: TEvent,
    draw: Draw,
    tournament: Tournament,
}

export const DrawKnockout: Component<Props> = (props) => {

    const navigate = useNavigate();
    const location = useLocation();
    const params = useParams<Params>();

    const nLine = createMemo(() => countInCol(columnMax(props.draw.nbColumn, props.draw.nbOut), props.draw.nbOut), { name: 'nLineM' });

    const cols = createMemo(() => (l: number) => {
        const result = [];
        const cMax = columnMax(props.draw.nbColumn, props.draw.nbOut);
        const cMin = columnMin(props.draw.nbOut);
        const boxes = mapBy<PlayerIn & Match>(props.draw.boxes as Match[], 'position');
        const players = props.tournament.players;
        for (let c = cMax; c >= cMin; c--) {
            const ic = cMax - c;
            const pos = positionTopCol(c) - (l >> ic);
            const box = boxes.get(pos);
            const visible = !!box && (!!box.order || box.qualifIn !== undefined || isMatch(box))
            result.push({
                box,
                player: byId(players, box?.playerId),
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
    }, { name: 'colsM' });

    // for VainDef, retreive the name of the winner
    const lib = createMemo(() => drawLib(props.event, props.draw), { name: 'libM' });
    const otherName = createMemo(() => (match?: Match) => {
        if (!match) { return ''; }
        const { player1, player2 } = lib().boxesOpponents(match);
        const otherId = match.playerId ? match.playerId === player1.playerId ? player2.playerId : player1.playerId : undefined;
        const otherPlayer = otherId ? byId(props.tournament.players, otherId) : undefined;
        return otherPlayer ? `${otherPlayer.name} ${otherPlayer.firstname?.[0] ?? ''}` : '';
    }, { name: 'otherNameM' });

    onSettled(() => {
        const handleKey = (evt: KeyboardEvent) => {
            // console.log('keydown=', evt.key)
            if (!params.boxPos) { return; }
            const curPos = +params.boxPos;
            const col = column(curPos);
            let pos = -1;
            switch(evt.key) {
                case 'Home': pos = positionMax(props.draw.nbColumn, props.draw.nbOut); break;
                // case 'Home': pos = positionTopCol(col); break;
                case 'ArrowUp': if (curPos < positionTopCol(col)) { pos = curPos + 1; } break;
                case 'ArrowDown': if (curPos > positionBottomCol(col, props.draw.nbOut)) { pos = curPos - 1; } break;
                case 'ArrowLeft': if (col < columnMax(props.draw.nbColumn, props.draw.nbOut)) { pos = positionOpponent1(curPos); } break;
                case 'ArrowRight': if (col > columnMin(props.draw.nbOut)) { pos = positionMatch(curPos); } break;
                case 'End': pos = positionBottomCol(columnMax(props.draw.nbColumn, props.draw.nbOut), props.draw.nbOut); break;
                // case 'End': pos = positionBottomCol(col, props.draw.nbOut); break;
            }
            if (pos !== -1) {
                evt.preventDefault();
                const box = by(props.draw.boxes, 'position', pos);
                if (box) {
                    navigate(urlBox(box, props.draw.id, props.event.id, props.tournament, location.query), { replace: true, scroll: false });
                }
            }
        };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    });

    return <table class="tableau">
        <tbody>
            <Repeat count={nLine()}>{(l) =>
                <tr>
                    <For each={cols()(l)}>{({ odd, even, rowspan, box, player, isRight }) =>
                        <td rowspan={rowspan} class={{
                            even, odd, qs: isRight
                        }}>
                            <Show when={props.draw.lock === BUILD || even || odd}>
                                {/* TODO <DrawBox box={box} player={player} /> */}
                                <a class={["boite joueur block print:border-none print:bg-transparent",
                                    { selected: !!params.boxPos && +params.boxPos === box?.position }
                                ]}
                                    // onclick={(evt) => { selectBox(props.event, props.draw, box); evt.preventDefault(); }}
                                    // onclick={() => navigate(urlBox(box), {replace:true})}
                                    href={urlBox(box, props.draw.id, props.event.id, props.tournament, location.query)} replace noscroll
                                    id={`pos${box?.position}`}
                                    tabindex={0}
                                >
                                    <Show when={box?.qualifIn !== undefined}><span class="qe">Q{box!.qualifIn || ''}</span></Show>
                                    <Show when={box?.seeded}><span class="ts">{box!.seeded}</span></Show>

                                    <Show when={box?.order && box.order > 0}><small class="pr-1">{box!.order}</small></Show>

                                    <Show when={box?.vainqDef} fallback={
                                        <span class="nom">{player?.name}
                                            <Show when={(box?.order && box.order > 0) || box?.qualifIn !== undefined || box?.qualifOut !== undefined}> {player?.firstname}</Show>
                                        </span>
                                    }>
                                        <span class="nom inline-block border-l-2 border-gray-500 pl-1">{player?.name} requalified<br />{otherName()(box)} withdraws</span>
                                    </Show>
                                    <Show when={box?.order && box.order > 0 && player?.rank}><span class="classement">{player!.rank}</span></Show>
                                    <Show when={isPlayerIn(box) && box.playerId} keyed>{(playerId) =>
                                        <span title="Edit the player"
                                            onClick={() => {
                                                selectPlayer(playerId);
                                                showDialog({ name: "player" });
                                            }}>
                                            <i class="icon2-player hover2" />
                                        </span>
                                    }</Show>
                                    <Show when={box?.qualifOut}><span class="qs">Q{box!.qualifOut}</span></Show>
                                    <br />
                                    <Switch>
                                        <Case when={box?.order && box.order > 0}>
                                            {/* <i class="icon2-qualif-in hover" title="Edit qualified in"
                                            onclick={() => {
                                                selectBox(props.event, props.draw, box);
                                                // showDialog("qualif");
                                            }}
                                            /> */}
                                            <span class="club">{player?.club}</span>
                                        </Case>
                                        <Case when={isMatch(box)}>
                                            <span title="Edit the match"
                                                onClick={() => {
                                                    selectBox(props.event.id, props.draw.id, box?.position);
                                                    showDialog({ name: "match" });
                                                }}>
                                                <i class="icon2-match hover2" />
                                                <Show when={box?.note}>{(note) => <i class='icon2-note' title={note()}/>}</Show>
                                            </span>

                                            <i class={{
                                                'icon2-planning-no': !!(box && (!box.date && !box.score && !box.wo)),
                                            }} />

                                            {/* <Show when={box?.date}>
                                                <i class={{
                                                    // 'icon2-planning':  !!box?.date,
                                                    // 'hover':  !!box?.date,
                                                    'icon2-planning-no': !!(box && (!box.date && !box.score && !box.wo)),
                                                }}
                                                title="View in planning"
                                                onclick={(evt) => {
                                                    evt.preventDefault();
                                                    selectDay(dayOf(box?.date, props.tournament.info));
                                                }}
                                                />
                                            </Show> */}
                                            <Show when={box?.score || box?.wo} fallback={
                                                <>
                                                    <Show when={box?.date}><span class="date">{box!.date!.toLocaleString()}</span></Show>
                                                    <Show when={box?.place !== undefined}> <span class="place">{props.tournament.places?.[box!.place!]?.name ?? ''}</span></Show>
                                                </>
                                            }><span class="score">{`${box?.score}${box?.wo ? ' WO' : ''}`}</span></Show>

                                            <Show when={isRight && props.draw.type !== FINAL}>
                                                <i class="icon2-qualif-out hover" title="Edit qualified out"
                                                    onClick={() => {
                                                        selectBox(props.event.id, props.draw.id, box?.position);
                                                        // showDialog("qualif");
                                                    }}
                                                />
                                            </Show>
                                            <Show when={box?.vainqDef}><br/><br/></Show>
                                        </Case>
                                    </Switch>
                                    &nbsp;
                                </a>
                            </Show>
                        </td>
                    }</For>
                </tr>
            }</Repeat>
        </tbody>
    </table>
}
