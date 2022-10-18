import type { Component } from 'solid-js';
import { mockTournament } from '../assets/data';
import { commandManager } from '../services/util/commandManager';

// import logo from './logo.svg';
import { Players } from './player/Players';
import { selection, selectTournament } from './util/selection';
// import { SelectionProvider, useSelection } from './util/selection';
import { Events } from './event/Events';
import styles from './App.module.css';
import '../assets/icons.css';

export const App: Component = () => {
  return (
    // <SelectionProvider>
    <div class={styles.App}>
      <header class={styles.header}>
        {/* <i class="icon2-ball"></i> JA-Tennis */}
        <div>
          <button type="button" disabled={!commandManager.canUndo} onclick={() => commandManager.undo()} title={`Undo ${commandManager.undoNames(1)?.[0] ?? ''}`}>↶ Undo</button>
          &nbsp;
          <button type="button" disabled={!commandManager.canRedo} onclick={() => commandManager.redo()} title={`Redo ${commandManager.redoNames(1)?.[0] ?? ''}`}>↷ Redo</button>
        </div>
      </header>
      <div class="flex">
        <LeftPane />
        <RightPane />
      </div>
    </div>
    // </SelectionProvider>
  );
};

export const LeftPane: Component = () => {
  // const { selection, selectTournament, selectPlayer } = useSelection();
  selectTournament(mockTournament);

  return <div>
    <Players
      players={selection.tournament?.players ?? []}
      events={selection.tournament?.events ?? []}
    />
  </div>
}

export const RightPane: Component = () => {
  return <div>
    <Events
      events={selection.tournament?.events ?? []}
    />
  </div>
}
