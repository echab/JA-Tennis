import { Component, For, JSX, onMount, onCleanup } from 'solid-js';
import { Draw, DrawType } from '../../domain/draw';
import { drawLib, GenerateType } from '../../services/draw/drawLib';
import { OptionalId } from '../../domain/object';
import { Player } from '../../domain/player';
import { TEvent } from '../../domain/tournament';
import { RankString, CategoryString } from '../../domain/types';
import { deleteDraw, groupDraw, groupFindAllPlayerOut } from '../../services/drawService';
import { getRegisteredPlayers, ranksName } from '../../services/tournamentService';
import { rank, category } from '../../services/types';
import { columnMax, countInCol } from '../../utils/drawUtil';
import { useForm } from '../util/useForm';
import { commandManager } from '../../services/util/commandManager';
import { selectDraw } from '../util/selection';
import { IconSexe } from '../misc/IconSexe';

const EMPTY: OptionalId<Draw> = { name: '', type: DrawType.Knockout, minRank: '', maxRank: '', nbColumn: 3, nbOut: 1, boxes: [] };

type Props = {
  event: TEvent;
  draw?: OptionalId<Draw>;
  allPlayers: Player[];
  onOk: (event: TEvent, draws: OptionalId<Draw>[]) => void;
  onClose: () => void;
}

export const DialogDraw: Component<Props> = (props) => {
  let refDlg: HTMLDialogElement;

  onMount(() => {
    refDlg.addEventListener('close', props.onClose)
    refDlg.showModal();
  });

  onCleanup(() => {
    refDlg.removeEventListener('close', props.onClose)
  })

  const draw: OptionalId<Draw> | undefined = props.draw && { ...props.draw }; // clone, without reactivity

  const isFirstDraw = !props.event.draws.length || draw?.id === props.event.draws[0].id;

  const { form, setForm, updateField } = useForm<OptionalId<Draw>>(draw ?? EMPTY);

  const ranks: RankString[] = rank.list();

  if (!props.draw) {
    // new draw
    const prevRank = props.event.draws.at(-1)?.maxRank;
    const minRank = prevRank ? rank.next(prevRank) : rank.first();
    setForm({ minRank, maxRank: props.event.maxRank });
  }

  const drawTypes: { value: number; label: string; }[] = [];
  drawTypes[DrawType.Knockout] = { value: DrawType.Knockout, label: "Knock out" };
  drawTypes[DrawType.Final] = { value: DrawType.Final, label: "Final" };
  drawTypes[DrawType.Roundrobin] = { value: DrawType.Roundrobin, label: "Round-robin" };
  drawTypes[DrawType.RoundrobinReturn] = { value: DrawType.RoundrobinReturn, label: "Round-robin with return" };

  const categories: CategoryString[] = category.list();

  /** @returns registered players and entries numbers from previous draw */
  const registeredPlayersOrQ = (): (Player|number)[] => {
    const players: (Player|number)[] = getRegisteredPlayers(props.allPlayers, props.event, form.minRank, form.maxRank);
    const prevDraw = props.event.draws.at(-1) as Draw | undefined;
    if (prevDraw) {
      const [iStart, iNext] = groupDraw(props.event, prevDraw);
      if (iStart < iNext) {
          const qualifs = groupFindAllPlayerOut(props.event, [iStart, iNext]);
          if (qualifs.length) {
            return players.concat(qualifs);
          }
      }
    }
    return players;
  }

  const getNbEntry = (): number => {
    return form.type & DrawType.Roundrobin
      ? form.nbColumn // TODO type poule
      : countInCol(columnMax(form.nbColumn, form.nbOut), form.nbOut);
  }

  const submit: JSX.EventHandlerUnion<HTMLFormElement, Event & { submitter: HTMLElement; }> = (evt) => {
    evt.preventDefault();

    // const formElems = (evt.target as HTMLFormElement).elements as unknown as Record<keyof Draw, RadioNodeList>;

    let result: OptionalId<Draw>[] = [{
      id: form.id || undefined,
      name: form.name.trim() || ranksName(form.minRank, form.maxRank),
      type: form.type,
      suite: form.suite,

      minRank: form.minRank,
      maxRank: form.maxRank,

      nbColumn: form.nbColumn,
      nbOut: form.nbOut,

      orientation: form.orientation,

      boxes: draw?.boxes ?? [],

      mode: form.mode,
    }];

    if ((evt.submitter as HTMLButtonElement).value === 'generate') {
      const lib = drawLib(props.event, result[0] as Draw);
      result = lib.generateDraw(GenerateType.Create, registeredPlayersOrQ());
    }

    props.onOk(props.event, result);
    
    refDlg.close();
    // props.onClose();
  };

  const deleteAndClose = () => {
    if (draw?.id) {
      commandManager.add(deleteDraw(draw.id));
      selectDraw(props.event, undefined);
      refDlg.close();
      // props.onClose();
    }
  }

  return (
    <dialog ref={refDlg!} class="p-0">
      <header class="flex justify-between sticky top-0 bg-slate-300 p-1">
        <span><i class='icon2-draw'></i> <IconSexe sexe={props.event.sexe} double={props.event.typeDouble} />{props.event.name} - <b>{props.draw ? `Edit draw ${props.draw?.name ?? ''}` : 'New draw'}</b></span>
        <small>Id: {props.draw?.id}</small>
        <button type="button" data-dismiss="modal" aria-hidden="true"
          onclick={() => refDlg.close()}
        >&times;</button>
      </header>
      <form method="dialog" class="w-[32rem]" onsubmit={submit}>
        <div class="p-4">
          <input id="id" type="hidden" value={form.id} />
          <div class="mb-1">
            <label for="name" class="inline-block w-3/12 text-right pr-3">Name:</label>
            <input id="name" type="text" class="w-9/12 p-1"
              autofocus
              placeholder={ranksName(form.minRank, form.maxRank)}
              value={form.name !== ranksName(form.minRank, form.maxRank) ? form.name : ''} onChange={updateField("name")} />
            {/*<span class="error" show.bind="eventForm.name.$error.required">Required!</span> */}
          </div>

          <div class="mb-1">
            <label for="type" class="inline-block w-3/12 text-right pr-3">Type:</label>
            <select id="type" required value={form.type} onChange={updateField('type')} class="w-6/12 p-1">
              <For each={drawTypes}>{({ value, label }) => <option value={value}>{label}</option>}</For>
            </select>
          </div>

          <div class="mb-1">
            <label for="minRank" class="inline-block w-3/12 text-right pr-3">Rank, from:</label>
            <select id="minRank" value={form.minRank} onChange={updateField('minRank')} class="w-2/12 p-1">
              <For each={ranks}>{(rank) => <option>{rank}</option>}</For>
            </select>

            <label for="maxRank" class="inline-block w-2/12 text-right pr-3">to:</label>
            <select id="maxRank" value={form.maxRank} onChange={updateField('maxRank')} class="w-2/12 p-1">
              <For each={ranks}>{(rank) => <option>{rank}</option>}</For>
            </select>
            <label class="pl-3">{registeredPlayersOrQ().length} registered</label>
          </div>

          <div class="mb-1">
            <span class="inline-block w-3/12 text-right pr-3"></span>
            <label><input type="checkbox" checked={form.suite} onchange={updateField('suite')}
              disabled={isFirstDraw}
              /> Same group as previous draw</label>
          </div>

          <fieldset>
            <legend>Dimensions:</legend>
            <div class="mb-1">
              <label for="nbIn" class="inline-block w-3/12 text-right pr-3">Entries:</label>
              <input id="nbIn" type="number" readonly value={getNbEntry()} class="w-3/12 p-1"/>
            </div>
            <div class="mb-1">
              <label for="nbColumn" class="inline-block w-3/12 text-right pr-3">Columns:</label>
              <input id="nbColumn" type="number" value={form.nbColumn} onChange={updateField('nbColumn')} min="2" max="9" required class="w-3/12 p-1" />
            </div>
            <div class="mb-1">
              <label for="nbOut" class="inline-block w-3/12 text-right pr-3">Outputs:</label>
              <input id="nbOut" type="number" value={form.nbOut} onChange={updateField('nbOut')} min="1" max="16" required class="w-3/12 p-1" />
            </div>
          </fieldset>

          {/* 
          TODO paper orientation
          */}

        </div>
        <footer class='sticky bottom-0 flex justify-end space-x-2 mt-2 pb-4 pr-4 bg-gray-50 bg-opacity-60'>
          <button type="submit" value="generate"
            //  disabled={!!drawForm.$error.required}
             class="rounded-md border border-transparent bg-indigo-200 py-2 px-4 min-w-[6rem]">
              <i class="icon2-draw-generate"></i> Generate
          </button>
          <button type="submit"
            //  disabled.bind="!!eventForm.$error.required"
            class="rounded-md border border-transparent bg-indigo-400 py-2 px-4 min-w-[6rem]"
          >OK
          </button>

          <button type="button" class="rounded-md border border-transparent bg-gray-200 py-2 px-4 min-w-[6rem]"
            value="Delete" disabled={!form.id}
            onclick={deleteAndClose}
            >✖ Delete
          </button>

          <button type="button" class="rounded-md border border-transparent bg-gray-200 py-2 px-4 min-w-[6rem]"
            data-dismiss="modal" aria-hidden="true"
            onclick={() => refDlg.close()}
          >Cancel</button>
        </footer>
        {/*{ eventForm.$error } */}
      </form>
    </dialog>
  );
};
