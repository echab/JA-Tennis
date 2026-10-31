import { type Component, createEffect, untrack } from "solid-js";
import { useLocation, type RouteSectionProps } from "@solidjs/router";
import { selectDay, selection } from "../util/selection";
import { Router } from "../../router";
import { Planning } from "./Planning";

type Data = {
}

export const PanePlanning: Component<RouteSectionProps<Data | undefined>> = (props) => {

    const location = useLocation();

    // init selection from url
    createEffect(() => parseInt((props.params.day) ?? '0', 10), (day) => {
        untrack(() => {
            selectDay(day);
        });
    });

    return <Planning
        day={selection.day}
        urlNewDate={(day) => Router.paths.planning(day)(location.query)}
    />
};