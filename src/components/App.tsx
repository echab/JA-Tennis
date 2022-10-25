import { Component, createSignal, Match, Show, Switch } from 'solid-js';
import { mockTournament } from '../assets/data';
import { commandManager } from '../services/util/commandManager';

// import logo from './logo.svg';
import { Players } from './player/Players';
import { selection, selectTournament } from './util/selection';
import { Events } from './event/Events';
import styles from './App.module.css';
import '../assets/icons.css';
// import { DialogInfo } from './tournament/DialogInfo';
import { initTournament, updateInfo } from '../services/tournamentService';
import { SidePanel } from './SidePanel';
import { DrawDraw } from './draw/DrawDraw';
import { Dialogs, showDialog } from './Dialogs';

export const App: Component = () => {

  selectTournament(initTournament(mockTournament));

  const [isDlgInfo, showDlgInfo] = createSignal(false);

  return <>
    <Dialogs />
    <div class={styles.App}>
      <header class="px-3 flex items-center justify-between min-h-[2.5em] text-slate-200 bg-gradient-to-l from-slate-500 to-slate-800">
        {/* <i class="icon2-ball"></i> JA-Tennis */}
        <div>
          <button type="button" class="border-2 border-zinc-500" disabled={!commandManager.canUndo} onclick={() => commandManager.undo()} title={`Undo ${commandManager.undoNames(1)?.[0] ?? ''}`}>↶ Undo</button>
          &nbsp;
          <button type="button" disabled={!commandManager.canRedo} onclick={() => commandManager.redo()} title={`Redo ${commandManager.redoNames(1)?.[0] ?? ''}`}>↷ Redo</button>
        </div>
        <div>
          selection: player={selection.player?.id} event={selection.event?.id} draw={selection.draw?.id} box={selection.box?.position}
        </div>
      </header>
      <div class="flex">
        <SidePanel />
        <Main />
      </div>
    </div>
  </>
};

export const Main: Component = () => {
  return <div>
    {/* <Events events={selection.tournament?.events ?? []} /> */}
    <Switch fallback={<div>...</div>}>
      <Match when={selection.event && !selection.draw}>
        <h4>{selection.event!.name}</h4>
      </Match>
      <Match when={selection.event && selection.draw}>
        <h4>{selection.event!.name} - {selection.draw!.name}</h4>
        <DrawDraw
          event={selection.event!}
          draw={selection.draw!}
          players={selection.tournament.players}
        />
      </Match>
    </Switch>
  </div>
}
