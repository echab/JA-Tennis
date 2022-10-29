import { Component, For, JSX, onMount, onCleanup, from } from 'solid-js';
import { Draw, Match } from '../../domain/draw';
import { drawLib } from '../../services/draw/drawLib';
import { Player } from '../../domain/player';
import { TEvent } from '../../domain/tournament';
import { matchFormat } from '../../services/types';
import { useForm } from '../util/useForm';
import { byId } from '../../services/util/find';

type Opponents = {
  player1?: Player
  player2?: Player
  aware1?: boolean;
  aware2?: boolean;
  receive1?: boolean;
  receive2?: boolean;
}

type Props = {
  event: TEvent;
  draw: Draw;
  match: Match;
  players: Player[];
  places: string[];
  onOk: (event: TEvent, draw: Draw, match: Match) => void;
  onClose: () => void;
}

export const DialogMatch: Component<Props> = (props) => {
  let refDlg: HTMLDialogElement;

  onMount(() => {
    refDlg.addEventListener('close', props.onClose)
    refDlg.showModal();
  });

  onCleanup(() => {
    refDlg.removeEventListener('close', props.onClose)
  })


  const lib = drawLib(props.event, props.draw);

  const {box1, box2} = lib.boxesOpponents(props.match);

  const player1 = byId(props.players, box1.playerId);
  const player2 = byId(props.players, box2.playerId);

  const opponents : Opponents = {
    player1,
    player2,
    aware1: box1.aware,
    aware2: box2.aware,
    receive1: box1.receive,
    receive2: box2.receive,
  };

  const match: Match & Opponents = { ...props.match, ...opponents }; // clone, without reactivity
  match.score ??= '';

  const { form, updateField } = useForm(match);

  const matchFormats = matchFormat.list();

  const places = props.places ?? [];

  const submit: JSX.EventHandlerUnion<HTMLFormElement, Event & { submitter: HTMLElement; }> = (evt) => {
    evt.preventDefault();

    // const formElems = (evt.target as HTMLFormElement).elements as unknown as Record<keyof Draw, RadioNodeList>;

    let result: Match = {
      // Box:
      // id: form.id,
      position: form.position,
      hidden: form.hidden,
      locked: form.locked,

      playerId: form.playerId,

      receive: form.receive,
      aware: form.aware,

      // Match:
      score: form.score.trim(),
      wo: form.wo,
      qualifOut: form.qualifOut,
      canceled: form.canceled,
      vainqDef: form.vainqDef,

      place: form.place?.trim(),
      date: form.date,

      matchFormat: form.matchFormat,
      note: form.note?.trim(),

      _player1: player1,
      _player2: player2,
    };

    // TODO aware1, aware2, receive1, receive2 on opponents boxes

    props.onOk(props.event, props.draw, result);
    
    refDlg.close();
    // props.onClose();
  };

  return (
    <dialog ref={refDlg!} class="p-0">
      <header class="flex justify-between sticky top-0 bg-slate-300 p-1">
        <span><i class='icon2-match'></i> Match - {player1?.name ?? '-'} vs {player2?.name ?? '-'}</span>
        <small>{props.match.position}</small>
        <button type="button" data-dismiss="modal" aria-hidden="true"
          onclick={() => refDlg.close()}
        >&times;</button>
      </header>
      <form method="dialog" class="w-[32rem]" onsubmit={submit}>
        <div class="p-4">
          {/* <input id="id" type="hidden" value={form.id} /> */}

          <div class="mb-1">
            <span class="inline-block w-3/12 text-right pr-3">Winner:</span>
            <label><input type="radio" name="winner" class="p-1 mr-1" autofocus
              checked={form.playerId == player1?.id} value={player1?.id} onChange={updateField("playerId")}
            />
              {player1?.name} {player1?.rank}</label>
            <br/>
            <span class="inline-block w-3/12 text-right pr-3">
              {/* <label><input type="radio" name="winner"
                checked={!form.playerId} value={undefined} onChange={updateField("playerId")}
              />None</label> */}
            </span>
            <label><input type="radio" name="winner" class="p-1 mr-1"
              checked={form.playerId == player2?.id} value={player2?.id} onChange={updateField("playerId")} 
               />
            {player2?.name} {player2?.rank}</label>
          </div>
          
          <div class="mb-1">
            <label for="score" class="inline-block w-3/12 text-right pr-3">Score:</label>
            <input id="score" type="text" class="w-4/12 p-1"
              value={form.score} onChange={updateField("score")}/>

            <label class="ml-2"><input id="wo" type="checkbox" checked={form.wo} onChange={updateField("wo")} /> WO</label>
          </div>

          <div class="mb-1">
            <span class="inline-block w-3/12"></span>
            <label><input type="checkbox" checked={form.canceled} onChange={updateField("canceled")} /> Canceled</label>
            <label class="pl-3"><input type="checkbox" checked={form.vainqDef} onChange={updateField("vainqDef")} /> Vainqueur defaillant</label>
          </div>

          <fieldset class="border-2">
            <legend>Planning</legend>

            <div class="mb-1">
              <label class="inline-block w-3/12 text-right pr-3">Date &amp; time:</label>
              <input name="start" type="datetime-local" value={form.date?.toISOString().substring(0,16) ?? ''} onChange={updateField('date')} class="p-1" />
            </div>

            <div class="mb-1">
              <label for="place" class="inline-block w-3/12 text-right pr-3">Court:</label>
              <select id="place" value={form.place} onChange={updateField('place')} class="w-6/12 p-1">
                <option></option>
                <For each={places}>{(place) => <option>{place}</option>}</For>
              </select>
            </div>

            <div class="mb-1">
              <label class="inline-block w-3/12 text-right pr-3">{player1?.name}:</label>
              <label><input type="checkbox" checked={form.aware1} onChange={updateField("aware1")} /><i class='icon2-aware'></i>Aware</label>
              <label class="pl-5"><input type="checkbox" checked={form.receive1} onChange={updateField("receive1")} /><i class='icon2-home'></i>Receive</label>
            </div>
            <div class="mb-1">
              <label class="inline-block w-3/12 text-right pr-3">{player2?.name}:</label>
              <label><input type="checkbox" checked={form.aware2} onChange={updateField("aware2")} /><i class='icon2-aware'></i>Aware</label>
              <label class="pl-5"><input type="checkbox" checked={form.receive2} onChange={updateField("receive2")} /><i class='icon2-home'></i>Receive</label>
            </div>
          </fieldset>

          <fieldset class="border-2"><legend>Comment</legend>
            <div class="mb-1">
              <label for="place" class="inline-block w-3/12 text-right pr-3">Match format:</label>
              <select id="place" value={form.matchFormat} onChange={updateField('matchFormat')} class="w-9/12 p-1">
                <option></option>
                <For each={Object.entries(matchFormats)}>{([code,f]) => <option value={code}>{f.name}</option>}</For>
              </select>
            </div>

            <div class="flex mb-1">
              <label class="inline-block w-3/12 text-right pr-3"><i class="icon2-note"></i> Note:</label>
              <textarea value={form.note ?? ''} onChange={updateField('note')} class="w-9/12 p-1"></textarea>
            </div>
          </fieldset>
        </div>
        <footer class='sticky bottom-0 flex justify-end space-x-2 mt-2 pb-4 pr-4 bg-gray-50 bg-opacity-60'>
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
