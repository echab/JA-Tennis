import { A } from "@solidjs/router";
import { Component, JSX } from "solid-js";
import { Player } from "../../domain/player";
import { Slot } from "../../domain/tournament";
import { byId } from "../../services/util/find";
import { showDialog } from "../Dialogs";
import { selectBox, urlBox } from "../util/selection";

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
        title={`${props.slot.event.name} - ${props.slot.draw.name}`}
    >
        {player1?.qualifIn !== undefined ? `Q${player1?.qualifIn > 0 ? player1?.qualifIn : ''} ` : ''}
        {p1 ? `${p1.name} ${p1.firstname}` : ''}
        <br/>
        {player2?.qualifIn !== undefined ? `Q${player2?.qualifIn > 0 ? player2?.qualifIn : ''} ` : ''}
        {p2 ? `${p2.name} ${p2.firstname}` : ''}
        <br/>
        {match.date!.toLocaleTimeString(undefined, {timeStyle: 'short'})}
        {/* ({match.date!.toLocaleString()}) */}
        {/* {match.date!.toLocaleDateString()} */}
        {/* - {match.place} */}
        <A href={urlBox(match, props.slot.draw, props.slot.event)} title="View in draw" class="hover">
            <i class="icon2-draw"/>
        </A>
        <i class="icon2-match hover" title="Edit the match"
            onclick={() => {
                selectBox(props.slot.event, props.slot.draw, match);
                showDialog("match");
            }}
        />
    </li>
};
