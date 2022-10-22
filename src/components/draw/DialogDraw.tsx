import { Component, For, JSX, onMount, onCleanup } from 'solid-js';
import { Draw, DrawType } from '../../domain/draw';
import { drawLib, GenerateType } from '../../services/draw/drawLib';
import { OptionalId } from '../../domain/object';
import { Player } from '../../domain/player';
import { TEvent } from '../../domain/tournament';
import { RankString, CategoryString } from '../../domain/types';
import { groupFindAllPlayerOut, previousGroup } from '../../services/drawService';
import { getRegisteredPlayers } from '../../services/tournamentService';
import { rank, category } from '../../services/types';
import { columnMax, countInCol } from '../../utils/drawUtil';
import { useForm } from '../util/useForm';

const EMPTY: OptionalId<Draw> = { name: '', type: DrawType.Normal, minRank: '', maxRank: '', nbColumn: 3, nbOut: 1, boxes: [] };

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

  const { form, updateField } = useForm<OptionalId<Draw>>(draw ?? EMPTY);

  const ranks: RankString[] = rank.list();

  const drawTypes: { value: number; label: string; }[] = [];
  drawTypes[DrawType.Normal] = { value: DrawType.Normal, label: "Normal" }; //TODO translate
  drawTypes[DrawType.Final] = { value: DrawType.Final, label: "Final" };
  drawTypes[DrawType.PouleSimple] = { value: DrawType.PouleSimple, label: "Round-robin simple" };
  drawTypes[DrawType.PouleAR] = { value: DrawType.PouleAR, label: "Round-robin double" };

  const categories: CategoryString[] = category.list();

  /** @returns registered players and entries numbers from previous draw */
  const registeredPlayersOrQ = (): (Player|number)[] => {
    const players: (Player|number)[] = getRegisteredPlayers(props.allPlayers, props.event, form.minRank, form.maxRank);
    const d = (draw ?? props.event.draws.at(-1)) as Draw | undefined;
    if (d) {
      const previous = previousGroup(d);
      if (previous) {
          const qualifs = groupFindAllPlayerOut(props.event, previous);
          if (qualifs.length) {
            return players.concat(qualifs);
          }
      }
    }
    return players;
  }

  const getNbEntry = (): number => {
    return form.type & DrawType.PouleSimple
      ? form.nbColumn // TODO type poule
      : countInCol(columnMax(form.nbColumn, form.nbOut), form.nbOut);
  }

  const submit: JSX.EventHandlerUnion<HTMLFormElement, Event & { submitter: HTMLElement; }> = (evt) => {
    evt.preventDefault();

    // const formElems = (evt.target as HTMLFormElement).elements as unknown as Record<keyof Draw, RadioNodeList>;

    let result: OptionalId<Draw>[] = [{
      id: form.id || undefined,
      name: form.name.trim(),
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

  return (
    <dialog ref={refDlg!} class="p-0">
      <header class="flex justify-between sticky top-0 bg-slate-300 p-1">
        <span>{props.event.name} - <b>{props.draw ? `Edit draw ${props.draw?.name ?? ''}` : 'New draw'}</b></span>
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
            <input id="name" type="text" required class="w-9/12 p-1"
              autofocus
              value={form.name} onChange={updateField("name")} />
            {/*<span class="error" show.bind="eventForm.name.$error.required">Required!</span> */}
          </div>

          {/* 
          TODO suite
          TODO entries count computed?
          TODO paper orientation
          */}

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

          <fieldset>
            <legend>Dimensions:</legend>
            <div class="mb-1">
              <label for="nbIn" class="inline-block w-3/12 text-right pr-3">Entries:</label>
              <input id="nbIn" type="number" readonly value={getNbEntry()} class="w-3/12"/>
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
            data-dismiss="modal" aria-hidden="true"
            onclick={() => refDlg.close()}
          >Cancel</button>
        </footer>
        {/*{ eventForm.$error } */}
      </form>
    </dialog>
  );
};
