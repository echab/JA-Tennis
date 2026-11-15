import { Component, Show } from 'solid-js';
import { useLocation } from '@solidjs/router';
import { ClockExclamationPointIcon, StickyNoteIcon } from '@lucide/solid';
import { MatchIcon, QualifOutIcon } from '../misc/Icons';
import { selectBox, urlBox } from '../util/selection';
import { FINAL, type Draw, type Match, type PlayerIn } from '../../domain/draw';
import type { Player } from '../../domain/player';
import { isMatch } from '../../services/drawService';
import type { TEvent, Tournament } from '../../domain/tournament';
import { showDialog } from '../Dialogs';

type BoxProps = {
    box?: PlayerIn & Match;
    player?: Player;
    playerIn?: boolean;
    isRight?: boolean;
    event: TEvent,
    draw: Draw,
    tournament: Tournament,
}

export const DrawBox: Component<BoxProps> = (props) => {
    const location = useLocation();

    return <Show when={props.box} keyed fallback={<div />}>{(box) => {
        const match = isMatch(box);
        return <a
            class={["boite block print:border-none print:bg-transparent",
            {
                match,
                joueur: false,
                inPlayer: !match,
                played: match && !!box.score,
                hidden: !!box.hidden,
                selected: props.box && props.box.position === box?.position
                // error:
            }]}
            // title={error ? error.message +' '+ error.detail : ''}
            // onclick={(evt) => { selectBox(props.event, props.draw, box); evt.preventDefault(); }}
            // onclick={() => navigate(urlBox(box), {replace:true})}
            href={urlBox(box, props.draw.id, props.event.id, props.tournament, location.query)} replace noscroll
            id={`pos${box?.position}`}
            tabindex={0}
        >
            <Show when={props.playerIn} fallback={
                <span class="nom">{props.player?.name ?? ''}</span>
            }>
                <Show when={box.qualifIn !== undefined}><span class="qe">Q{box.qualifIn === -1 ? '?' : box.qualifIn}</span></Show>
                <Show when={box.seeded}><span class="ts">{box.seeded}</span></Show>
                <span class="nom">{props.player?.name ?? ''}</span>
                <Show when={box.order && box.order > 0 && props.player?.rank} keyed>{(rank) => <span class="classement">{rank}</span>}</Show>
            </Show>
            <Show when={box.qualifOut} keyed>{(qualifOut) => <span class="qs">Q{qualifOut}</span>}</Show>
            <br />
            {/* <Show when={box.order && box.order > 0} fallback={
                <Show when={box.score} fallback={
                    <Show when={box.date}><span class="date">{box.date?.toLocaleString()}</span></Show>
                }><span class="score">{box.score}</span></Show>
            }>
                <span class="club">{props.player?.club ?? ''}</span>
            </Show> */}
            <Show when={box && isMatch(box)}>
                <span title="Edit the match"
                    onClick={() => {
                        selectBox(props.event.id, props.draw.id, box?.position);
                        showDialog({ name: "match" });
                    }}>
                    <span class="hover2"><MatchIcon /></span>
                    <Show when={box?.note}>{(note) => <span title={note()}><StickyNoteIcon color="var(--color-warning)" /></span>}</Show>
                </span>

                <Show when={!!(box && (!box.date && !box.score && !box.wo))}>
                    <ClockExclamationPointIcon color="var(--color-warning)" />
                </Show>

                {/* <Show when={box?.date}>
                    <span title="View in planning"
                        onclick={(evt) => {
                            evt.preventDefault();
                            selectDay(dayOf(box?.date, props.tournament.info));
                        }}>
                        <Show when={box && (!box.date && !box.score && !box.wo)}><ClockExclamationPointIcon /></Show>
                    </span>
                </Show> */}
                <Show when={box?.score || box?.wo} fallback={
                    <>
                        <Show when={box?.date}><span class="date">{box!.date!.toLocaleString()}</span></Show>
                        <Show when={box?.place !== undefined}> <span class="place">{props.tournament.places?.[box!.place!]?.name ?? ''}</span></Show>
                    </>
                }><span class="score">{`${box?.score}${box?.wo ? ' WO' : ''}`}</span></Show>

                <Show when={props.isRight && props.draw.type !== FINAL}>
                    <span  class="hover" title="Edit qualified out"
                        onClick={() => {
                            selectBox(props.event.id, props.draw.id, box?.position);
                            // showDialog("qualif");
                    }}><QualifOutIcon />
                    </span>
                </Show>
                <Show when={box?.vainqDef}><br/><br/></Show>
            </Show>            
        </a>;
        }}
    </Show>
}
