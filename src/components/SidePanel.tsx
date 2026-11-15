import { Match, Switch, type ParentComponent } from "solid-js";
import { useSearchParams } from "@solidjs/router";
import { CalendarClockIcon, SettingsIcon, TriangleExclamationPointIcon, UserRoundIcon } from "@lucide/solid";
import { BallIcon, DrawIcon } from "./misc/Icons";
import { errorCount } from "../services/validationService";
import { Problems } from "./Problems";
import { SideEvents } from "./event/SideEvents";
import { SidePlayers } from "./player/SidePlayers";
import { Tournaments } from "./tournament/Tournaments";
import { Badge } from "./misc/Badge";
import { selection } from "./util/selection";
import { SidePlanning } from "./planning/SidePlanning";
import { Settings } from "./Settings";
import type { Searchs } from "../App";

export const SidePanel: ParentComponent = () => {

    const [search] = useSearchParams<Searchs>();
    const buildSearch = (pane: Searchs['pane']) => {
        const s = { ...search};
        if (s.pane === pane) {
            delete s.pane;
        } else {
            s.pane = pane;
        }
        return `?${new URLSearchParams(s).toString()}`;
    }

    return <aside class={["flex flex-row bg-surface-panel border-r border-stroke-panel print:hidden",
        {
            'w-4/12': !!search.pane,
        }]}
    >
        <nav class="flex flex-col text-center bg-surface-bar p-2 border-r border-stroke-panel gap-4">
            <a href={buildSearch('tournament')} title="Tournament"
                aria-selected={search.pane === 'tournament' ? 'true' : 'false'}
                class="rounded-full min-w-14 aria-selected:bg-surface-selected hover:bg-surface-selecting"
            >
                <BallIcon />
                <br /><small>Tournament</small>
            </a>
            <a href={buildSearch('players')} title="Players"
                aria-selected={search.pane === 'players' ? 'true' : 'false'}
                class='rounded-full min-w-14 aria-selected:bg-surface-selected hover:bg-surface-selecting'
            >
                <UserRoundIcon />
                <br /><small>Players</small>
            </a>
            <a href={buildSearch('events')} title="Events &amp; Draws"
                aria-selected={search.pane === 'events' ? 'true' : 'false'}
                class="rounded-full min-w-14 aria-selected:bg-surface-selected hover:bg-surface-selecting"
            >
                <DrawIcon />
                <br /><small>Draws</small>
            </a>
            <a href={buildSearch('planning')} title="Planning"
                aria-selected={search.pane === 'planning' ? 'true' : 'false'}
                class="rounded-full min-w-14 aria-selected:bg-surface-selected hover:bg-surface-selecting"
            >
                <CalendarClockIcon />
                <br /><small>Planning</small>
            </a>
            <a href={buildSearch('problems')} title="Problems"
                aria-selected={search.pane === 'problems' ? 'true' : 'false'}
                class="rounded-full min-w-14 aria-selected:bg-surface-selected hover:bg-surface-selecting relative"
            >
                <TriangleExclamationPointIcon />
                <span class="absolute top-0 right-2">
                    <Badge count={errorCount(selection)} minDisplay={1}/>
                </span>
                <br /><small>Problems</small>
            </a>
            <a href={buildSearch('settings')} title="Settings"
                aria-selected={search.pane === 'settings' ? 'true' : 'false'}
                class="rounded-full min-w-14 aria-selected:bg-surface-selected hover:bg-surface-selecting"
            >
                <SettingsIcon />
                <br /><small>Settings</small>
            </a>
        </nav>
        <div class="grow overflow-x-auto">
            <Switch>
                <Match when={search.pane === 'tournament'}><Tournaments /></Match>
                <Match when={search.pane === 'players'}><SidePlayers /></Match>
                <Match when={search.pane === 'events'}><SideEvents /></Match>
                <Match when={search.pane === 'planning'}><SidePlanning /></Match>
                <Match when={search.pane === 'problems'}><Problems /></Match>
                <Match when={search.pane === 'settings'}><Settings /></Match>
            </Switch>
        </div>
    </aside>
}
