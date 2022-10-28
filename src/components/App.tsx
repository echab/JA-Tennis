import { Component } from 'solid-js';
import { Route, Router, Routes } from '@solidjs/router';
import { mockTournament } from '../assets/data';
import { commandManager } from '../services/util/commandManager';

// import logo from './logo.svg';
import { selection, selectTournament } from './util/selection';
import styles from './App.module.css';
import '../assets/icons.css';
import { initTournament } from '../services/tournamentService';
import { SidePanel } from './SidePanel';
import { Dialogs } from './Dialogs';
import { PaneDraw } from './draw/PaneDraw';
import { Players } from './player/Players';

export type Params = {
  playerId?: string;
  eventId?: string;
  drawId?: string;
  boxPos?: string;
}

export const App: Component = () => {

  selectTournament(initTournament(mockTournament));

  return <Router>
    <Dialogs />
    <div class={styles.App}>
      <header class="px-3 flex items-center justify-between min-h-[2.5em] text-slate-200 bg-gradient-to-l from-slate-500 to-slate-800">
        <span><i class="icon2-ball"></i> JA-Tennis</span>
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
  </Router>
};

export const Main: Component = () => {
  return (
    <div class="grow">
      <Routes>
        <Route path="/event/:eventId/:drawId?/:boxPos?" element={
          <PaneDraw />
        } />
        <Route path="/players/:playerId?" element={
          <Players
            events={selection.tournament.events}
            players={selection.tournament.players}
          />
        } />
      </Routes>
    </div>
  );
  // return <Switch fallback={<div>...</div>}>
  //   <Match when={selection.event && !selection.draw}>
  //     <h4>{selection.event!.name}</h4>
  //   </Match>
  //   <Match when={selection.event && selection.draw}>
  //     <PaneDraw />
  //   </Match>
  // </Switch>
}
