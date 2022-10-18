import { Component, createSignal, Show } from 'solid-js';
import { mockTournament } from '../assets/data';
import { commandManager } from '../services/util/commandManager';

// import logo from './logo.svg';
import { Players } from './player/Players';
import { selection, selectTournament } from './util/selection';
// import { SelectionProvider, useSelection } from './util/selection';
import { Events } from './event/Events';
import styles from './App.module.css';
import '../assets/icons.css';
import { DialogInfo } from './event/DialogInfo';
import { updateInfo } from '../services/tournamentService';

export const App: Component = () => {

  const [isDlgInfo, showDlgInfo] = createSignal(false);

  return <>
    <Show when={isDlgInfo()}>
      <DialogInfo info={selection.tournament.info}
        onOk={(info) => commandManager.add(updateInfo(info))}
        onClose={() => showDlgInfo(false)}
      />
    </Show>
    {/* <SelectionProvider> */}
    <div class={styles.App}>
      <header class="px-3 flex items-stretch justify-between min-h-[2.5em] text-slate-200 bg-gradient-to-l from-slate-500 to-slate-800">
        {/* <i class="icon2-ball"></i> JA-Tennis */}
        <span>
          <button type="button" onclick={() => showDlgInfo(true)}>Info</button>
          <span> - </span>{selection.tournament.info.name}
        </span>
        <div>
          <button type="button" class="border-2 border-zinc-500" disabled={!commandManager.canUndo} onclick={() => commandManager.undo()} title={`Undo ${commandManager.undoNames(1)?.[0] ?? ''}`}>↶ Undo</button>
          &nbsp;
          <button type="button" disabled={!commandManager.canRedo} onclick={() => commandManager.redo()} title={`Redo ${commandManager.redoNames(1)?.[0] ?? ''}`}>↷ Redo</button>
        </div>
      </header>
      <div class="flex">
        <LeftPane />
        <RightPane />
      </div>
    </div>
    {/* </SelectionProvider> */}
  </>
};

export const LeftPane: Component = () => {
  // const { selection, selectTournament, selectPlayer } = useSelection();
  selectTournament(mockTournament);

  return <div>
    {JSON.stringify(selection.tournament.info)}
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
