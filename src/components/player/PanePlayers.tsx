import { type Component, createEffect, untrack } from "solid-js";
import { useLocation, type RouteSectionProps } from "@solidjs/router";
import { selectPlayer } from "../util/selection";
import { paths } from "../../router";
import { Players } from "./Players";

type Data = {
}

export const PanePlayers: Component<RouteSectionProps<Data | undefined>> = (props) => {

    const location = useLocation();

    // init selection from url
    createEffect(() => props.params.playerId, (playerId) => {
        untrack(() => {
            selectPlayer(playerId);
        });
    });

    return <Players
        playerId={props.params.playerId}
        urlNewPlayer={(playerId) => paths.players(playerId ?? '')(location.query)}
    />
};