import { type Component, Show, untrack } from "solid-js";
import type { JSX } from '@solidjs/web';
import { useLocation } from "@solidjs/router";
import type { Player } from "../../domain/player";
import type { Slot, Tournament } from "../../domain/tournament";
import { byId } from "../../services/util/find";
import { showDialog } from "../Dialogs";
import { selectBox, selectPlayer, urlBox } from "../util/selection";
import { drawName } from "../../services/drawService";

type PlayerProps = {
    qualifIn?: number;
    player?: Player;
    aware?: number
}

const SlotPlayer: Component<PlayerProps> = (props) => <>
    <i class={{
        'icon2-planning-no': !props.aware,
        'icon2-responder': props.aware === 1,
        'icon2-aware': props.aware === 2,
    }} />
    {/* {props.qualifIn !== undefined ? `Q${props.qualifIn > 0 ? props.qualifIn : ''} ` : ''} */}
    {props.player ? `${props.player.name} ${props.player.firstname?.[0] ?? ''}` : ''}
    <Show when={props.player?.id} keyed>{(id) =>
        <i class="icon2-player hover cursor-pointer" title={`Edit the ${props.player?.teamIds ? 'team' : 'player'}`}
            onClick={() => {
                selectPlayer(id);
                showDialog({ name: "player" });
            }}
        />
    }</Show>
</>;

type Props = {
    slot: Slot;
    tournament: Tournament;
    style?: JSX.CSSProperties;
}

export const PlanningSlot: Component<Props> = (props) => {

    const location = useLocation();
    
    const { player1, player2, match } = untrack(() => props.slot);

    const [p1, p2] = untrack(() => [
        byId(props.tournament.players, player1?.playerId),
        byId(props.tournament.players, player2?.playerId)
    ]);

    return <li
        class={["bg-slate-300 border-l-8", { 'crossed-out': !!match.playerId }]}
        style={{ "border-color": props.slot.event?.color ?? 'transparent', ...props.style }}
        title={`${props.slot.event.name} - ${drawName(props.slot.draw)}`}
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
        <a href={urlBox(match, props.slot.draw, props.slot.event, props.tournament, location.query)} title="View in draw" class="hover">
            <i class="icon2-draw"/>
        </a>
        <span class="cursor-pointer" title="Edit the match"
            onClick={() => {
                selectBox(props.slot.event.id, props.slot.draw.id, match.position);
                showDialog({ name: "match" });
            }}
        >
            <i class="icon2-match hover2"/>
            <Show when={match.note}><i class="icon2-note" /></Show>
        </span>
    </li>
};
