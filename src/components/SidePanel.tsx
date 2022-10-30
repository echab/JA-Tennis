import { Component, createSignal, Match, Show, Switch } from "solid-js";
import { errorCount } from "../services/validationService";
import { Errors } from "./Errors";
import { Events } from "./event/Events";
import { Players } from "./player/Players";
import { Tournaments } from "./tournament/Tournaments";
import { Badge } from "./misc/Badge";
import { selection } from "./util/selection";

type Props = {
}

export const SidePanel: Component<Props> = () => {

    const [pane, setPane] = createSignal(1);

    const [expand, setExpand] = createSignal(true);

    return <aside class="flex flex-row bg-slate-100 border-r-[1px] border-slate-300"
        classList={{
            'w-4/12': expand(),
        }}
    >
        <ul class="flex flex-col text-center bg-slate-200 p-2 border-r-[1px] border-slate-300">
            <li aria-selected={pane() === 0} class="[&[aria-selected=true]]:text-blue-500" onClick={[setPane, 0]}>
                <button title="Tournament" class="rounded-full w-14 h-10 -mb-3 [&[aria-selected=true]]:bg-blue-200"
                    aria-selected={pane() === 0}

                ><i class="icon2-ball"></i></button>
                <br /><small>Tournament</small>
            </li>
            <li aria-selected={pane() === 1} class="mt-6 [&[aria-selected=true]]:text-blue-500" onClick={[setPane, 1]}>
                <button title="Players" class='rounded-full w-14 h-10 -mb-3 [&[aria-selected=true]]:bg-blue-200'
                    aria-selected={pane() === 1}
                ><i class="icon2-player"></i></button>
                <br /><small>Players</small>
            </li>
            <li aria-selected={pane() === 2} class="mt-6 [&[aria-selected=true]]:text-blue-500" onClick={[setPane, 2]}>
                <button title="Events" class="rounded-full w-14 h-10 -mb-3  [&[aria-selected=true]]:bg-blue-200"
                    aria-selected={pane() === 2}
                ><i class="icon2-draw"></i></button>
                <br /><small>Draws</small>
            </li>
            <li aria-selected={pane() === 3} class="mt-6 [&[aria-selected=true]]:text-blue-500" onClick={[setPane, 3]}>
                <button title="Planning" class="rounded-full w-14 h-10 -mb-3  [&[aria-selected=true]]:bg-blue-200"
                    aria-selected={pane() === 3}
                ><i class="icon2-planning"></i></button>
                <br /><small>Planning</small>
            </li>
            <li aria-selected={pane() === 4} class="mt-6 [&[aria-selected=true]]:text-blue-500" onClick={[setPane, 4]}>
                <button title="Errors" class="rounded-full w-14 h-10 -mb-3  [&[aria-selected=true]]:bg-blue-200 relative"
                    aria-selected={pane() === 4}
                ><i class="icon2-bug"></i>
                    <Badge count={errorCount(selection)} minDisplay={1}/>
                </button>
                <br /><small>Errors</small>
            </li>
            <li aria-selected={pane() === 5} class="mt-6 [&[aria-selected=true]]:text-blue-500" onClick={[setPane, 5]}>
                <button title="Settings" class="rounded-full w-14 h-10 -mb-3  [&[aria-selected=true]]:bg-blue-200"
                    aria-selected={pane() === 5}
                ><i class="icon2-gear"></i></button>
                <br /><small>Settings</small>
            </li>

            <li class="mt-6">
                <button title="Settings" class="rounded-full w-14 h-10 -mb-3"
                    onClick={() => setExpand((b) => !b)}
                ><i classList={{
                    "icon2-left-arrow": expand(),
                    "icon2-right-arrow": !expand(),
                }}></i></button>
            </li>
        </ul>
        <Show when={expand()}>
            <div class="flex-grow">
                <Switch>
                    <Match when={pane() === 0}>
                        <Tournaments />
                    </Match>
                    <Match when={pane() === 1}>
                        <Players
                            players={selection.tournament?.players ?? []}
                            events={selection.tournament?.events ?? []}
                            short={true}
                        />
                    </Match>
                    <Match when={pane() === 2}>
                        <Events events={selection.tournament?.events ?? []} />
                    </Match>
                    <Match when={pane() === 3}>
                        <div>Planning...</div>
                    </Match>
                    <Match when={pane() === 4}>
                        <Errors />
                    </Match>
                    <Match when={pane() === 5}>
                        <div>Settings...</div>
                    </Match>
                </Switch>
            </div>
        </Show>
    </aside>
}
