import { A } from "@solidjs/router";
import { Component, JSX, Show } from "solid-js";
import { Player } from "../../domain/player";
import { Slot } from "../../domain/tournament";
import { byId } from "../../services/util/find";
import { showDialog } from "../Dialogs";
import { selectBox, selectPlayer, urlBox } from "../util/selection";

type PlayerProps = {
    qualifIn?: number;
    player?: Player;
    aware?: number
}

const SlotPlayer: Component<PlayerProps> = (props) => <>
    <i classList={{
        'icon2-planning-no': !props.aware,
        'icon2-responder': props.aware === 1,
        'icon2-aware': props.aware === 2,
    }} />
    {/* {props.qualifIn !== undefined ? `Q${props.qualifIn > 0 ? props.qualifIn : ''} ` : ''} */}
    {props.player ? `${props.player.name} ${props.player.firstname?.[0] ?? ''}` : ''}
    <Show when={props.player}>
        <i class="icon2-player hover cursor-pointer" title={`Edit the ${props.player?.teamIds ? 'team' : 'player'}`}
            onclick={() => {
                selectPlayer(props.player);
                showDialog("player");
            }}
        />
    </Show>
</>;

type Props = {
    slot: Slot;
    players: Player[];
    style?: JSX.CSSProperties;
}

export const PlanningSlot: Component<Props> = (props) => {
    const player1 = props.slot.player1; // TODO loose reactivity?
    const player2 = props.slot.player2;
    const match = props.slot.match;

    const p1 = byId(props.players, player1?.playerId);
    const p2 = byId(props.players, player2?.playerId);

    return <li
        class="bg-slate-300 border-l-8"
        style={{ "border-color": props.slot.event?.color ?? 'transparent', ...props.style }}
        classList={{ 'crossed-out': !!match.playerId }}
        title={`${props.slot.event.name} - ${props.slot.draw.name}`}
        id={`${match.position}-${props.slot.draw.id}-${props.slot.event.id}`}
    >
        <SlotPlayer qualifIn={player1?.qualifIn} player={p1} aware={match.aware1} />
        <br />
        <SlotPlayer qualifIn={player2?.qualifIn} player={p2} aware={match.aware2} />
        <br />
        {/* {match.date?.toLocaleTimeString(undefined, {timeStyle: 'short'})} */}
        {/* ({match.date!.toLocaleString()}) */}
        {/* {match.date!.toLocaleDateString()} */}
        {/* - {match.place} */}
        <A href={urlBox(match, props.slot.draw, props.slot.event)} title="View in draw" class="hover">
            <i class="icon2-draw"/>
        </A>
        <span class="cursor-pointer" title="Edit the match"
            onclick={() => {
                selectBox(props.slot.event, props.slot.draw, match);
                showDialog("match");
            }}
        >
            <i class="icon2-match hover2"/>
            <Show when={match.note}><i class="icon2-note" /></Show>
        </span>
    </li>
};
