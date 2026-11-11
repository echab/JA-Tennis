import type { Component } from "solid-js";
import { useLocation } from "@solidjs/router";
import { Players } from "./Players";
import { paths } from "../../router";

type Props = {
}

export const SidePlayers: Component<Props> = () => {

    const location = useLocation();
    // const [search, _setSearch] = useSearchParams<Searchs>();

    return <Players
        short
        // playerId={search.playerId ? parseInt(search.playerId, 10) : undefined}
        // urlNewPlayer={(playerId) => `?${new URLSearchParams({ ...location.query, playerId: playerId ?? '' })}` }
        urlNewPlayer={(playerId) => paths.players(playerId ?? '')({ ...location.query, pane: '' }) }
    />
};