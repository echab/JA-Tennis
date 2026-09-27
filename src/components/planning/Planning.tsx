import { Component, createMemo, For, onSettled, Show } from "solid-js";
import { useLocation, useSearchParams, type RouteSectionProps } from "@solidjs/router";
import type { Place } from "../../domain/tournament";
import { matchesByDays } from "../../services/planningService";
import { defined } from "../../services/util/object";
import { DAYS, minutes } from "../../utils/date";
import { Searchs } from "../../App";
import { showDialog } from "../Dialogs";
import { selection, selectDay, selectPlace } from "../util/selection";
import { PlanningSlot } from "./PlanningSlot";
import { Router } from "../../router";

type Data = {
    short?: boolean;
}

export const Planning: Component<RouteSectionProps<Data | undefined>> = (props) => {

    const location = useLocation();
    const [search, _setSearch] = useSearchParams<Searchs>();

    // init selection with url
    onSettled(() => {
        const day = parseInt(props.params.day ?? search.day ?? '0', 10);
        selectDay(day);
        // const place = props.params.place
        //     ? selection.tournament.places?.find(({ name }) => name === props.params.place)
        //     : undefined;
    });

    // // change url on selection change
    // const navigate = useNavigate();
    // createEffect(() => ({ short: props.data?.short, day: selection.day, pathname: location.pathname }), ({ short, day, pathname }) => {
    //     if (short) {
    //         setSearch({ day });
    //     } else {
    //         const url = Router.paths.planning(day ?? 0)(location.query);
    //         if (pathname.startsWith(Router.paths.planning(location.query)) && pathname !== url) {
    //             navigate(url, { replace: true });
    //         }
    //     }
    // });

    const editPlace = (place: Place) => { selectPlace(place); showDialog({ name: "place" }); };

    const start = () => selection.tournament.info.start;

    const slots = createMemo(() => matchesByDays(selection.tournament));
    // const slots = () => matchesByDays(selection.tournament);

    const days = () => slots().map((_, i) => {
        const d0 = start();
        return d0 ? new Date(d0.getTime() + i * DAYS) : undefined
    }).filter(defined);

    const daySlots = () => selection.day !== undefined ? slots()[selection.day] : [];

    const prevDay = () => selection.day ? selection.day - 1 : undefined;
    const nextDay = () => selection.day !== undefined && selection.day + 1 < slots().length ? selection.day + 1 : undefined;

    const hourStart = 8, hourEnd = 23;
    const hours = Array.from({ length: hourEnd - hourStart }, (_, i) => `${hourStart + i}h `);

    return <>
        <div class="flex justify-between items-center px-2">
            <h3>Planning
                <span class={["p-2 rounded-full inline-block hover:bg-gray-200 [&.pointer-events-none]:opacity-50 ", 
                    { "pointer-events-none": prevDay() === undefined }]}
                    onClick={() => selectDay(prevDay())}
                    // disabled={!prevDay()}
                    // href={urlDay(prevDay())} replace
                    title="View the previous day of the tournament"
                ><i class="icon2-left-arrow" /></span>

                {/* {days()[selection.day ?? -1]?.toLocaleDateString(undefined, { dateStyle: props.data.short ? 'medium' : 'full' })} */}
                <select class="border-0"
                    value={selection.day}
                    onChange={(evt) => selectDay(parseInt(evt.currentTarget.value ?? '0', 10))}
                >
                    <For each={days()}>{(day, i) =>
                        // <option value={i()}>{day.toLocaleDateString(undefined, { dateStyle: 'full' })}</option>
                        <option value={i()}>{day.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</option>
                    }</For>
                </select>

                <span class={["p-2 rounded-full inline-block hover:bg-gray-200 [&.pointer-events-none]:opacity-50 ",
                    { "pointer-events-none": nextDay() === undefined }]}
                    onClick={() => selectDay(nextDay())}
                    // disabled={!nextDay()}
                    // href={urlDay(nextDay())} replace
                    title="View the next day of the tournament"
                ><i class="icon2-right-arrow" /></span>
            </h3>

            {/* <button type="button" class="p-2 rounded-full">&Gt;</button> */}
            <Show when={props.data?.short}>
                <a href={Router.paths.planning(selection.day ?? '')(location.query)} replace class="p-2 rounded-full" title="Open the planning in the main page">&Gt;</a>
            </Show>
        </div>

        <ul class="grid gap-0.5"
            style={{
                'grid-template-rows': `[place] 1em repeat(${(hours.length + 1) * 12}, 1px`,
                'grid-template-columns': `[hour] 2em repeat(${(selection.tournament.places?.length ?? 0) + 1}, minmax(5em, 1fr))`
            }} >
            <For each={selection.tournament.places}>{(place, i) =>
                <li class='row-[place]' style={{
                    'grid-column-start': i() + 2
                }}>
                    <i class="icon2-info hover" onClick={[editPlace, place]} />
                    {place.name}
                </li>
            }</For>
            <For each={hours}>{(hour, i) =>
                <li class='col-[hour] text-right align-top bg-slate-200'
                    style={{
                        'grid-row': `${2 + i() * 12}/span 12`,
                    }}
                >{hour}</li>
            }</For>

            <For each={daySlots()}>{(slot) =>
                <PlanningSlot slot={slot} tournament={selection.tournament} style={{
                    'grid-column': 2 + (slot.match.place ?? selection.tournament.places?.length ?? 0),
                    'grid-row': `${2 + Math.round( ((minutes(slot.match.date) ?? hourEnd * 60) - hourStart * 60)/ 5)}/span 18`,
                }} />
            }</For>
        </ul>

        <button type="button" onClick={[editPlace, null]} class="p-2 rounded-full" title='Add a place'>➕</button>
    </>
}
