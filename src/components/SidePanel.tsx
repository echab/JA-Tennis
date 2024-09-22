import { Match, Switch, type ParentComponent } from "solid-js";
import { errorCount } from "../services/validationService";
import { Problems } from "./Problems";
import { Events } from "./event/Events";
import { Players } from "./player/Players";
import { Tournaments } from "./tournament/Tournaments";
import { Badge } from "./misc/Badge";
import { selection } from "./util/selection";
import { Planning } from "./planning/Planning";
import { A, useLocation, useParams } from "@solidjs/router";
import { Settings } from "./Settings";

export const SidePanel: ParentComponent = () => {

    const params = useParams();
    const location = useLocation();

    const panelUrl = (panel: string) => {
        const loc = location.pathname || 'tournament';
        const newLoc = `/${panel}/`;
        return `${loc.replace(
            /^\/[a-z_]+\//,
            !loc.startsWith(newLoc) || loc.startsWith('/_/') ? newLoc : '/_/'
        )}${location.search}${location.hash}`;
    };

    const routeSectionProps = { params, location, data:{} };

    return <aside class="flex flex-row bg-slate-100 border-r-[1px] border-slate-300 print:hidden"
        classList={{
            'w-4/12': params.pane !== '_',
        }}
    >
        <nav class="flex flex-col text-center bg-slate-200 p-2 border-r-[1px] border-slate-300 gap-4">
            <A href={panelUrl('tournament')} title="Tournament"
                aria-selected={params.pane === 'tournament'}
                class="rounded-full min-w-14 [&[aria-selected=true]]:bg-blue-200"
            >
                <i class="icon2-ball" />
                <br /><small>Tournament</small>
            </A>
            <A href={panelUrl('players')} title="Players"
                aria-selected={params.pane === 'players'}
                class='rounded-full min-w-14 [&[aria-selected=true]]:bg-blue-200'
            >
                <i class="icon2-player" />
                <br /><small>Players</small>
            </A>
            <A href={panelUrl('events')} title="Events &amp; Draws"
                aria-selected={params.pane === 'events'}
                class="rounded-full min-w-14 [&[aria-selected=true]]:bg-blue-200"
            >
                <i class="icon2-draw" />
                <br /><small>Draws</small>
            </A>
            <A href={panelUrl('planning')} title="Planning"
                aria-selected={params.pane === 'planning'}
                class="rounded-full min-w-14 [&[aria-selected=true]]:bg-blue-200"
            >
                <i class="icon2-planning" />
                <br /><small>Planning</small>
            </A>
            <A href={panelUrl('problems')} title="Problems"
                aria-selected={params.pane === 'problems'}
                class="rounded-full min-w-14 [&[aria-selected=true]]:bg-blue-200 relative"
            >
                <i class="icon2-bug" />
                <Badge count={errorCount(selection)} minDisplay={1}/>
                <br /><small>Problems</small>
            </A>
            <A href={panelUrl('settings')} title="Settings"
                aria-selected={params.pane === 'settings'}
                class="rounded-full min-w-14 [&[aria-selected=true]]:bg-blue-200"
            >
                <i class="icon2-gear" />
                <br /><small>Settings</small>
            </A>
        </nav>
        <div class="flex-grow overflow-x-auto">
            <Switch>
                <Match when={params.pane === 'tournament'}><Tournaments /></Match>
                <Match when={params.pane === 'players'}><Players {...routeSectionProps} data={{short: true}} /></Match>
                <Match when={params.pane === 'events'}><Events {...routeSectionProps} /></Match>
                <Match when={params.pane === 'planning'}><Planning {...routeSectionProps} data={{short: true}} /></Match>
                <Match when={params.pane === 'problems'}><Problems /></Match>
                <Match when={params.pane === 'settings'}><Settings /></Match>
            </Switch>
        </div>
    </aside>
}
