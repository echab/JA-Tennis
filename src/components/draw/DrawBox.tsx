import { Component, Show } from 'solid-js';
import { selection } from '../util/selection';
import type { Match, PlayerIn } from '../../domain/draw';
import type { Player } from '../../domain/player';
import { isMatch } from '../../services/drawService';
import './Draw.css';

type BoxProps = {
    box?: PlayerIn & Match;
    player?: Player;
}

export const DrawBox: Component<BoxProps> = (props) => {
    return <Show when={props.box} keyed fallback={<div />}>{(box) => {

        const match = isMatch(box);
        return <div
            class={["boite joueur",
            {
                match,
                inPlayer: !match,
                played: match && !!box.score,
                hidden: !!box.hidden,
                selected: box.position === selection.box?.position,
                // error:
            }]}
            // title={error ? error.message +' '+ error.detail : ''}
            // onclick={selectBox(event, draw, box)}
        >
            <Show when={box.qualifIn}><span class="qe">Q{box.qualifIn === -1 ? '?' : box.qualifIn}</span></Show>
            <Show when={box.seeded}><span class="ts">{box.seeded}</span></Show>
            <span class="nom">{props.player?.name ?? ''}</span>
            <Show when={box.order && props.player?.rank}><span class="classement">{props.player!.rank}</span></Show>
            <Show when={box.qualifOut}><span class="qs">Q{box.qualifOut}</span></Show>
            <br />
            <Show when={box.order} fallback={
                <Show when={() => box.score} fallback={
                    <Show when={box.date}><span class="date">{box.date?.toLocaleString()}</span></Show>
                }><span class="score">{box.score}</span></Show>
            }><span class="club">{props.player?.club ?? ''}</span></Show>
        </div>;
        }}
    </Show>
}
