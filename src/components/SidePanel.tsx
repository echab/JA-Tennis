import { Component, createSignal, Match, Switch } from "solid-js";
import { Events } from "./event/Events";
import { Players } from "./player/Players";
import { Tournament } from "./tournament/Tournament";
import { selection } from "./util/selection";

type Props = {
}

export const SidePanel: Component<Props> = () => {

    const [pane, setPane] = createSignal(1);

    return <aside class="flex flex-row w-4/12 bg-slate-100 border-r-[1px] border-slate-300">
        <ul class="flex flex-col text-center bg-slate-200 p-2 border-r-[1px] border-slate-300">
            <li aria-selected={pane() === 0} class="[&[aria-selected=true]]:text-blue-500">
                <button title="Tournament" class="rounded-full w-14 h-10 -mb-3 [&[aria-selected=true]]:bg-blue-200"
                 aria-selected={pane() === 0}
                    onClick={[setPane, 0]}
                ><i class="icon2-ball"></i></button>
                <br /><small>Tournament</small>
            </li>
            <li aria-selected={pane() === 1} class="mt-6 [&[aria-selected=true]]:text-blue-500">
                <button title="Players" class='rounded-full w-14 h-10 -mb-3 [&[aria-selected=true]]:bg-blue-200'
                    aria-selected={pane() === 1} 
                    onClick={[setPane, 1]}><i class="icon2-player"></i></button>
                <br /><small>Players</small>
            </li>
            <li aria-selected={pane() === 2} class="mt-6 [&[aria-selected=true]]:text-blue-500">
                <button title="Events" class="rounded-full w-14 h-10 -mb-3  [&[aria-selected=true]]:bg-blue-200"
                aria-selected={pane() === 2}
                    onClick={[setPane, 2]}><i class="icon2-draw"></i></button>
                <br /><small>Draws</small>
            </li>
            <li aria-selected={pane() === 3} class="mt-6 [&[aria-selected=true]]:text-blue-500">
                <button title="Planning" class="rounded-full w-14 h-10 -mb-3  [&[aria-selected=true]]:bg-blue-200"
                aria-selected={pane() === 3}
                    onClick={[setPane, 3]}><i class="icon2-planning"></i></button>
                <br /><small>Planning</small>
            </li>
            <li aria-selected={pane() === 4} class="mt-6 [&[aria-selected=true]]:text-blue-500">
                <button title="Errors" class="rounded-full w-14 h-10 -mb-3  [&[aria-selected=true]]:bg-blue-200"
                aria-selected={pane() === 4}
                    onClick={[setPane, 4]}><i class="icon2-bug"></i></button>
                <br /><small>Errors</small>
            </li>
            <li aria-selected={pane() === 5} class="mt-6 [&[aria-selected=true]]:text-blue-500">
                <button title="Settings" class="rounded-full w-14 h-10 -mb-3  [&[aria-selected=true]]:bg-blue-200"
                aria-selected={pane() === 5}
                    onClick={[setPane, 5]}><i class="icon2-gear"></i></button>
                <br /><small>Settings</small>
            </li>

        </ul>
        <div class="flex-grow">
            <Switch>
                <Match when={pane() === 0}>
                    <Tournament />
                </Match>
                <Match when={pane() === 1}>
                    <Players
                        players={selection.tournament?.players ?? []}
                        events={selection.tournament?.events ?? []}
                    />
                </Match>
                <Match when={pane() === 2}>
                    <Events events={selection.tournament?.events ?? []} />
                </Match>
                <Match when={pane() === 3}>
                    <div>Planning...</div>
                </Match>
                <Match when={pane() === 4}>
                    <div>Errors...</div>
                </Match>
                <Match when={pane() === 5}>
                    <div>Settings...</div>
                </Match>
            </Switch>
        </div>
    </aside>
}
