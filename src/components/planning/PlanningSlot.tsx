import { type Component, Show, Match as Case, untrack, Switch } from "solid-js";
import type { JSX } from '@solidjs/web';
import { useLocation } from "@solidjs/router";
import { ClockExclamationPointIcon, PhoneIcon, PhoneLogIcon, StickyNoteIcon, UserRoundIcon } from "@lucide/solid";
import { DrawIcon, MatchIcon } from "../misc/Icons";
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
    <Switch>
        <Case when={!props.aware}><ClockExclamationPointIcon color="var(--color-warning)" /></Case>
        <Case when={props.aware === 1}><PhoneLogIcon /></Case>{/* responder */}
        <Case when={props.aware === 2}><PhoneIcon /></Case>
    </Switch>
    {/* {props.qualifIn !== undefined ? `Q${props.qualifIn > 0 ? props.qualifIn : ''} ` : ''} */}
    {props.player ? `${props.player.name} ${props.player.firstname?.[0] ?? ''}` : ''}
    <Show when={props.player?.id} keyed>{(id) =>
        <span class="hover cursor-pointer" title={`Edit the ${props.player?.teamIds ? 'team' : 'player'}`}
            onClick={() => {
                selectPlayer(id);
                showDialog({ name: "player" });
            }}
        ><UserRoundIcon /></span>
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
        class={["bg-surface-alt text-onsurface-alt border-l-8", { 'crossed-out': !!match.playerId }]}
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
        <a href={urlBox(match, props.slot.draw.id, props.slot.event.id, props.tournament, location.query)} title="View in draw" class="hover">
            <DrawIcon />
        </a>
        <span class="cursor-pointer" title="Edit the match"
            onClick={() => {
                selectBox(props.slot.event.id, props.slot.draw.id, match.position);
                showDialog({ name: "match" });
            }}
        >
            <span class="hover2"><MatchIcon /></span>
            <Show when={match.note}><StickyNoteIcon /></Show>
        </span>
    </li>
};
