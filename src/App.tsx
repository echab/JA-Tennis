import { type VoidComponent, onSettled, Loading, type ParentComponent, DEV } from 'solid-js';
import { Router } from './router';
import { commandManager } from './services/util/commandManager';
import { selection, selectTournament, selTournament } from './components/util/selection';
import { SidePanel } from './components/SidePanel';
import { Dialogs } from './components/Dialogs';
// import { ErrorToast } from './components/misc/ErrorToast';
import { restoreTournament } from './services/tournamentsStore';

import styles from './App.module.css';
import './index.css';

import { installDiagnosticsBridge } from "@solidjs/diagnostics/browser";
DEV && installDiagnosticsBridge();

export type Params = {
    playerId?: string;
    eventId?: string;
    drawId?: string;
    boxPos?: string;
    day?: string;
}

export type Searchs = {
    pane: 'tournament' | 'events' | 'players' | 'planning' | 'problems' | 'settings',
    // playerId?: string;
    day?: string;
}

const App: VoidComponent = () => (
    // <Errored fallback={(err) => <ErrorToast message={String(err())} />}>
        <Loading fallback={'loading...'}>
            <Router>
                {(props) => <Main {...props} />}
            </Router>
        </Loading>
    // </Errored>
);

const Main: ParentComponent = (props) => {

    onSettled(() => {
        restoreTournament().then(selectTournament); // TODO solid2: async effect
    });

    // const paste = async () => {
    //     console.log('paste');
    //     try {
    //         const permission = await navigator.permissions.query({ name: 'clipboard-read' });
    //         if (permission.state === 'denied') {
    //             throw new Error('Not allowed to read clipboard.');
    //         }
    //         const clipboardContents = await navigator.clipboard.read();
    //         for (const item of clipboardContents) {
    //             console.log(item);
    //             // if (!item.types.includes('image/png')) {
    //             //     throw new Error('Clipboard contains non-image data.');
    //             // }
    //             // const blob = await item.getType('image/png');
    //             // destinationImage.src = URL.createObjectURL(blob);
    //         }
    //     }
    //     // eslint-disable-next-line @typescript-eslint/no-explicit-any
    //     catch (error: any) {
    //         console.error(new Error(error.message));
    //     }
    // };

    return <>
        <Dialogs />
        <div class={styles.App}>
            <header class="px-3 flex items-center justify-between min-h-[2.5em] text-slate-200 bg-linear-to-l from-slate-500 to-slate-800 print:hidden">
                <span><i class="icon2-ball" /> JA-Tennis</span>
                <div>
                    <button type="button" class="border-2 border-zinc-500" disabled={!commandManager.canUndo} onClick={() => commandManager.undo()} title={`Undo ${commandManager.undoNames(1)?.[0] ?? ''}`}>↶ Undo</button>
                    &nbsp;
                    <button type="button" disabled={!commandManager.canRedo} onClick={() => commandManager.redo()} title={`Redo ${commandManager.redoNames(1)?.[0] ?? ''}`}>↷ Redo</button>
                    {/* &nbsp;
                    <button type="button" onclick={copy} ><i class='icon2-copy'/> Copy</button>
                    &nbsp;
                    <button type="button" onclick={paste} ><i class='icon2-paste'/> Paste</button> */}
                </div>
                <div>
                    selection: tournament={selTournament.id} player={selection.player?.id} event={selection.eventId} draw={selection.drawId} box={selection.box?.position} day={selection.day} place={selection.place?.name}
                </div>
            </header>
            <div class="flex">
                <SidePanel />
                <div class="grow">
                    {props.children}
                </div>
            </div>
        </div>
    </>
}

export default App;
