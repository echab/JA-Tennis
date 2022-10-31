import { Component, createSignal, Match, Show, Switch } from "solid-js";
import { errorCount } from "../services/validationService";
import { Problems } from "./Problems";
import { Events } from "./event/Events";
import { Players } from "./player/Players";
import { Tournaments } from "./tournament/Tournaments";
import { Badge } from "./misc/Badge";
import { selection } from "./util/selection";
import { Planning } from "./planning/Planning";

type Props = {
}

export const SidePanel: Component<Props> = () => {

    const [pane, setPane] = createSignal(0);

    const togglePane = (i: number) => {
        setPane(i === pane() ? 0 : i);
    };

    return <aside class="flex flex-row bg-slate-100 border-r-[1px] border-slate-300 print:hidden"
        classList={{
            'w-4/12': !!pane(),
        }}
    >
        <ul class="flex flex-col text-center bg-slate-200 p-2 border-r-[1px] border-slate-300">
            <li aria-selected={pane() === 1} class="[&[aria-selected=true]]:text-blue-500" onClick={[togglePane, 1]}>
                <button title="Tournament" class="rounded-full w-14 h-10 -mb-3 [&[aria-selected=true]]:bg-blue-200"
                    aria-selected={pane() === 1}

                ><i class="icon2-ball" /></button>
                <br /><small>Tournament</small>
            </li>
            <li aria-selected={pane() === 2} class="mt-6 [&[aria-selected=true]]:text-blue-500" onClick={[togglePane, 2]}>
                <button title="Players" class='rounded-full w-14 h-10 -mb-3 [&[aria-selected=true]]:bg-blue-200'
                    aria-selected={pane() === 2}
                ><i class="icon2-player" /></button>
                <br /><small>Players</small>
            </li>
            <li aria-selected={pane() === 3} class="mt-6 [&[aria-selected=true]]:text-blue-500" onClick={[togglePane, 3]}>
                <button title="Events &amp; Draws" class="rounded-full w-14 h-10 -mb-3  [&[aria-selected=true]]:bg-blue-200"
                    aria-selected={pane() === 3}
                ><i class="icon2-draw" /></button>
                <br /><small>Draws</small>
            </li>
            <li aria-selected={pane() === 4} class="mt-6 [&[aria-selected=true]]:text-blue-500" onClick={[togglePane, 4]}>
                <button title="Planning" class="rounded-full w-14 h-10 -mb-3  [&[aria-selected=true]]:bg-blue-200"
                    aria-selected={pane() === 4}
                ><i class="icon2-planning" /></button>
                <br /><small>Planning</small>
            </li>
            <li aria-selected={pane() === 5} class="mt-6 [&[aria-selected=true]]:text-blue-500" onClick={[togglePane, 5]}>
                <button title="Problems" class="rounded-full w-14 h-10 -mb-3  [&[aria-selected=true]]:bg-blue-200 relative"
                    aria-selected={pane() === 5}
                ><i class="icon2-bug" />
                    <Badge count={errorCount(selection)} minDisplay={1}/>
                </button>
                <br /><small>Problems</small>
            </li>
            <li aria-selected={pane() === 6} class="mt-6 [&[aria-selected=true]]:text-blue-500" onClick={[togglePane, 6]}>
                <button title="Settings" class="rounded-full w-14 h-10 -mb-3  [&[aria-selected=true]]:bg-blue-200"
                    aria-selected={pane() === 6}
                ><i class="icon2-gear" /></button>
                <br /><small>Settings</small>
            </li>
        </ul>
        <Show when={pane() !== undefined}>
            <div class="flex-grow">
                <Switch>
                    <Match when={pane() === 1}>
                        <Tournaments />
                    </Match>
                    <Match when={pane() === 2}>
                        <Players
                            players={selection.tournament?.players ?? []}
                            events={selection.tournament?.events ?? []}
                            short={true}
                        />
                    </Match>
                    <Match when={pane() === 3}>
                        <Events events={selection.tournament?.events ?? []} />
                    </Match>
                    <Match when={pane() === 4}>
                        <Planning
                            places={selection.tournament.places ?? []}
                            short={true}
                        />
                    </Match>
                    <Match when={pane() === 5}>
                        <Problems />
                    </Match>
                    <Match when={pane() === 6}>
                        <div>Settings...</div>
                    </Match>
                </Switch>
            </div>
        </Show>
    </aside>
}
