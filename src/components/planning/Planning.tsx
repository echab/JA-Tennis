import { A, useNavigate, useParams } from "@solidjs/router";
import { Component, createEffect, For, Show } from "solid-js";
import { Place } from "../../domain/tournament";
import { Params } from "../App";
import { showDialog } from "../Dialogs";
import { selection, selectPlace, urlPlace } from "../util/selection";

type Props = {
    places: Place[];
    short?: boolean;
}

export const Planning: Component<Props> = (props) => {

    const params = useParams<Params>();

    // change selection on url change
    createEffect(() => {
        const place = params.place
            ? props.places.find(({ name }) => name === params.place)
            : undefined;
        selectPlace(place);
    });

    // change url on selection change
    const navigate = useNavigate();
    createEffect(() => {
        const url = urlPlace(selection.place);
        if (location.pathname.startsWith(urlPlace()) && location.pathname !== url) {
            navigate(url, { replace: true });
        }
    });

    const editPlace = (place?: Place) => { selectPlace(place); showDialog("place"); };

    return <>
        <div class="flex justify-between items-center px-2">
            <h3>Planning</h3>

            <button type="button" onclick={[editPlace, null]} class="p-2 rounded-full" title='Add a place'>➕</button>

            {/* <button type="button" class="p-2 rounded-full">&Gt;</button> */}
            <Show when={props.short}>
                <A href={urlPlace()} replace={true} class="p-2 rounded-full" title="Open the planning in the main page">&Gt;</A>
            </Show>
        </div>
        <ul class="pb-2">
            <For each={props.places}>{(place) =>
                <li>
                    <i class="icon2-info hover" onclick={[editPlace,place]}></i>
                    {place.name}
                </li>
            }</For>
        </ul>
    </>
}
