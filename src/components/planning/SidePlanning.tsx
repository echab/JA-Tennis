import type { Component } from "solid-js";
import { useLocation, useSearchParams } from "@solidjs/router";
import type { Searchs } from "../../App";
import { Planning } from "./Planning";

type Props = {
}

export const SidePlanning: Component<Props> = () => {

    const location = useLocation();
    const [search, _setSearch] = useSearchParams<Searchs>();

    return <Planning
        short
        day={search.day ? parseInt(search.day, 10) : undefined}
        urlNewDate={(day) => `?${new URLSearchParams({ ...location.query, day: String(day) })}` }
    />
};