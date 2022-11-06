import { A, useNavigate, useParams, useSearchParams } from "@solidjs/router";
import { Component, createEffect, createMemo, For, Show } from "solid-js";
import { Player } from "../../domain/player";
import { Place } from "../../domain/tournament";
import { matchesByDays } from "../../services/planningService";
import { defined } from "../../services/util/object";
import { DAYS } from "../../utils/date";
import { Params, Searchs } from "../App";
import { showDialog } from "../Dialogs";
import { selection, selectDay, urlDay, selectPlace } from "../util/selection";
import { PlanningSlot } from "./PlanningSlot";

type Props = {
    places: Place[];
    players: Player[];
    short?: boolean;
}

export const Planning: Component<Props> = (props) => {

    const params = useParams<Params>();
    const [search, setSearch] = useSearchParams<Searchs>();

    // change selection on url change
    createEffect(() => {
        const day = parseInt(params.day ?? search.day ?? '0', 10);
        selectDay(day);
        // const place = params.place
        //     ? props.places.find(({ name }) => name === params.place)
        //     : undefined;
    });

    // change url on selection change
    const navigate = useNavigate();
    createEffect(() => {
        if (props.short) {
            setSearch({ day: selection.day });
        } else {
            const url = urlDay(selection.day ?? 0);
            if (location.pathname.startsWith(urlDay()) && location.pathname !== url) {
                navigate(url, { replace: true });
            }
        }
    });

    const editPlace = (place: Place) => { selectPlace(place); showDialog("place"); };

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
    const hours = Array(hourEnd - hourStart).fill(0).map((_, i) => `${hourStart + i}h `);

    return <>
        <div class="flex justify-between items-center px-2">
            <h3>Planning
                <span class="p-2 rounded-full inline-block hover:bg-gray-200 [&.pointer-events-none]:opacity-50 "
                    onclick={() => selectDay(prevDay())}
                    // disabled={!prevDay()}
                    classList={{ "pointer-events-none": prevDay() === undefined }}
                    // href={urlDay(prevDay())} replace
                    title="View the previous day of the tournament"
                ><i class="icon2-left-arrow" /></span>

                {/* {days()[selection.day ?? -1]?.toLocaleDateString(undefined, { dateStyle: props.short ? 'medium' : 'full' })} */}
                <select class="border-0"
                    value={selection.day}
                    onChange={(evt) => selectDay(parseInt(evt.currentTarget.value ?? '0', 10))}
                >
                    <For each={days()}>{(day, i) =>
                        // <option value={i()}>{day.toLocaleDateString(undefined, { dateStyle: 'full' })}</option>
                        <option value={i()}>{day.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</option>
                    }</For>
                </select>

                <span class="p-2 rounded-full inline-block hover:bg-gray-200 [&.pointer-events-none]:opacity-50 "
                    onclick={() => selectDay(nextDay())}
                    // disabled={!nextDay()}
                    classList={{ "pointer-events-none": nextDay() === undefined }}
                    // href={urlDay(nextDay())} replace
                    title="View the next day of the tournament"
                ><i class="icon2-right-arrow" /></span>
            </h3>

            {/* <button type="button" class="p-2 rounded-full">&Gt;</button> */}
            <Show when={props.short}>
                <A href={urlDay(selection.day)} replace class="p-2 rounded-full" title="Open the planning in the main page">&Gt;</A>
            </Show>
        </div>

        <ul class="pb-2 grid grid-rows-[12] gap-[2px]"
            style={{
                'grid-template-columns': `[hour] 2em repeat(${props.places.length + 1}, minmax(5em, 1fr))`
            }} >
            <For each={props.places}>{(place, i) =>
                <li class='row-start-1' style={{
                    'grid-column-start': i() + 2
                }}>
                    <i class="icon2-info hover" onclick={[editPlace, place]} />
                    {place.name}
                </li>
            }</For>
            <For each={hours}>{(hour, i) =>
                <li class='col-start-[hour] text-right align-top bg-slate-200' style={{ 'grid-row-start': i() + 2 }}>{hour}</li>
            }</For>

            <For each={daySlots()}>{(slot) =>
                <PlanningSlot slot={slot} players={selection.tournament.players} style={{
                    'grid-column-start': 2 + (slot.match.place ?? props.places.length),
                    'grid-row-start': 2,
                }} />
            }</For>
        </ul>

        <button type="button" onclick={[editPlace, null]} class="p-2 rounded-full" title='Add a place'>➕</button>
    </>
}
