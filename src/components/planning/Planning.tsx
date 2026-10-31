import { type Component, createMemo, For, Show } from "solid-js";
import { useLocation, useNavigate } from "@solidjs/router";
import { matchesByDays } from "../../services/planningService";
import { defined } from "../../services/util/object";
import { DAYS, minutes } from "../../utils/date";
import { showDialog } from "../Dialogs";
import { selectPlace, selTournament } from "../util/selection";
import { PlanningSlot } from "./PlanningSlot";
import { Router } from "../../router";

type Props = {
    short?: boolean;
    day?: number,
    urlNewDate: (day: number) => string,
}

export const Planning: Component<Props> = (props) => {

    const location = useLocation();
    const navigate = useNavigate();

    const editPlace = (iPlace?: number) => { selectPlace(iPlace); showDialog({ name: "place" }); };

    const start = () => selTournament.info.start;

    const slots = createMemo(() => matchesByDays(selTournament), { name: 'planningSlots'});
    // const slots = () => matchesByDays(selTournament);

    const days = () => slots().map((_, i) => {
        const d0 = start();
        return d0 ? new Date(d0.getTime() + i * DAYS) : undefined
    }).filter(defined);

    const daySlots = () => props.day !== undefined ? slots()[props.day] : [];

    const prevDay = () => props.day ? props.day - 1 : undefined;
    const nextDay = () => props.day !== undefined && props.day + 1 < slots().length ? props.day + 1 : undefined;

    const hourStart = 8, hourEnd = 23;
    const hours = Array.from({ length: hourEnd - hourStart }, (_, i) => `${hourStart + i}h `);

    return <>
        <div class="flex justify-between items-center px-2">
            <h3>Planning
                <a class={["p-2 rounded-full inline-block hover:bg-gray-200 [&.pointer-events-none]:opacity-50 ", 
                    { "pointer-events-none": prevDay() === undefined }]}
                    href={props.urlNewDate(prevDay() ?? 0)} replace
                    title="View the previous day of the tournament"
                ><i class="icon2-left-arrow" /></a>

                {/* {days()[selection.day ?? -1]?.toLocaleDateString(undefined, { dateStyle: props.data.short ? 'medium' : 'full' })} */}
                <select class="border-0"
                    value={props.day}
                    onChange={(evt) => navigate(props.urlNewDate(parseInt(evt.currentTarget.value ?? '0', 10)), { replace: true })}
                >
                    <For each={days()}>{(day, i) =>
                        // <option value={i()}>{day.toLocaleDateString(undefined, { dateStyle: 'full' })}</option>
                        <option value={i()}>{day.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</option>
                    }</For>
                </select>

                <a class={["p-2 rounded-full inline-block hover:bg-gray-200 [&.pointer-events-none]:opacity-50 ",
                    { "pointer-events-none": nextDay() === undefined }]}
                    href={props.urlNewDate(nextDay() ?? 0)} replace
                    title="View the next day of the tournament"
                ><i class="icon2-right-arrow" /></a>
            </h3>

            {/* <button type="button" class="p-2 rounded-full">&Gt;</button> */}
            <Show when={props.short}>
                <a href={Router.paths.planning(props.day ?? '')(location.query)} replace class="p-2 rounded-full" title="Open the planning in the main page">&Gt;</a>
            </Show>
        </div>

        <ul class="grid gap-0.5"
            style={{
                'grid-template-rows': `[place] 1em repeat(${(hours.length + 1) * 12}, 1px`,
                'grid-template-columns': `[hour] 2em repeat(${(selTournament.places?.length ?? 0) + 1}, minmax(5em, 1fr))`
            }} >
            <For each={selTournament.places}>{(place, i) =>
                <li class='row-[place]' style={{
                    'grid-column-start': i() + 2
                }}>
                    <i class="icon2-info hover" onClick={[editPlace, i]} />
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
                <PlanningSlot slot={slot} tournament={selTournament} style={{
                    'grid-column': 2 + (slot.match.place ?? selTournament.places?.length ?? 0),
                    'grid-row': `${2 + Math.round( ((minutes(slot.match.date) ?? hourEnd * 60) - hourStart * 60)/ 5)}/span 18`,
                }} />
            }</For>
        </ul>

        <button type="button" onClick={[editPlace, null]} class="p-2 rounded-full" title='Add a place'>➕</button>
    </>
}
