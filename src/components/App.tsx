import { Component, ErrorBoundary } from 'solid-js';
import { Route, Router, Routes } from '@solidjs/router';
import { commandManager } from '../services/util/commandManager';

// import logo from './logo.svg';
import { selection, selectTournament } from './util/selection';
import { SidePanel } from './SidePanel';
import { Dialogs } from './Dialogs';
import { PaneDraw } from './draw/PaneDraw';
import { Players } from './player/Players';
import { ErrorToast } from './misc/ErrorToast';
import styles from './App.module.css';
import { TournamentsProvider, useTournaments } from './tournament/TournamentsStore';
import { Planning } from './planning/Planning';
import '../assets/icons.css';

export type Params = {
    playerId?: string;
    eventId?: string;
    drawId?: string;
    boxPos?: string;
    day?: string;
}

export type Searchs = {
    // playerId?: string;
    day?: string;
}

export const App: Component = () => (
    <Router>
        <ErrorBoundary fallback={(err) => <ErrorToast message={err} />}>
            <TournamentsProvider>
                <Main />
            </TournamentsProvider>
        </ErrorBoundary>
    </Router>
);

export const Main: Component = () => {

    const [tournaments] = useTournaments();

    selectTournament(tournaments[0]);

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
            <header class="px-3 flex items-center justify-between min-h-[2.5em] text-slate-200 bg-gradient-to-l from-slate-500 to-slate-800 print:hidden">
                <span><i class="icon2-ball" /> JA-Tennis</span>
                <div>
                    <button type="button" class="border-2 border-zinc-500" disabled={!commandManager.canUndo} onclick={() => commandManager.undo()} title={`Undo ${commandManager.undoNames(1)?.[0] ?? ''}`}>↶ Undo</button>
                    &nbsp;
                    <button type="button" disabled={!commandManager.canRedo} onclick={() => commandManager.redo()} title={`Redo ${commandManager.redoNames(1)?.[0] ?? ''}`}>↷ Redo</button>
                    {/* &nbsp;
                    <button type="button" onclick={copy} ><i class='icon2-copy'/> Copy</button>
                    &nbsp;
                    <button type="button" onclick={paste} ><i class='icon2-paste'/> Paste</button> */}
                </div>
                <div>
          selection: player={selection.player?.id} event={selection.event?.id} draw={selection.draw?.id} box={selection.box?.position} day={selection.day} place={selection.place?.name}
                </div>
            </header>
            <div class="flex">
                <SidePanel />
                <Content />
            </div>
        </div>
    </>
}

export const Content: Component = () => (
    <div class="grow">
        <Routes>
            <Route path="/draw/:eventId/:drawId?/:boxPos?" element={
                <PaneDraw />
            } />
            <Route path="/players/:playerId?" element={
                <Players
                    events={selection.tournament.events}
                    players={selection.tournament.players}
                />
            } />
            <Route path="/planning/:day?" element={
                <Planning
                    places={selection.tournament.places ?? []}
                    players={selection.tournament.players}
                />
            } />
        </Routes>
    </div>
)
