import { A } from '@solidjs/router';
import { Component, For, JSX, onMount, onCleanup, mergeProps, Show } from 'solid-js';
import { OptionalId } from '../../domain/object';
import { Player } from '../../domain/player';
import { TEvent } from '../../domain/tournament';
import { RankString, CategoryString } from '../../domain/types';
import { deletePlayer } from '../../services/playerService';
import { isSexeCompatible } from '../../services/tournamentService';
import { rank, category } from '../../services/types';
import { commandManager } from '../../services/util/commandManager';
import { byId } from '../../services/util/find';
import { IconSexe } from '../misc/IconSexe';
import { urlPlayer } from '../util/selection';
import { useForm } from '../util/useForm';

const EMPTY: OptionalId<Player> = { name: '', sexe: 'H', rank: 'NC', registration: [] };

type Props = {
  player?: OptionalId<Player>;
  events: TEvent[];
  players: Player[];
  onOk: (player: OptionalId<Player>) => void;
  onClose: () => void;
}

export const DialogPlayer: Component<Props> = (props) => {
  let refDlg: HTMLDialogElement;

  onMount(() => {
    refDlg.addEventListener('close', props.onClose)
    refDlg.showModal();
  });

  onCleanup(() => {
    refDlg.removeEventListener('close', props.onClose)
  })

  const player: OptionalId<Player> | undefined = props.player && { ...props.player }; // clone, without reactivity

  const { form, updateField, getCheckboxes } = useForm<OptionalId<Player>>(player ?? EMPTY);

  const ranks: RankString[] = rank.list();
  const categories: CategoryString[] = category.list();

  const submit: JSX.EventHandlerUnion<HTMLFormElement, Event & { submitter: HTMLElement; }> = (evt) => {
    evt.preventDefault();

    const formElems = (evt.target as HTMLFormElement).elements as unknown as Record<keyof Player, RadioNodeList>;

    const result: OptionalId<Player> = {
      id: form.id || undefined,
      name: form.name.trim(),
      sexe: form.sexe,
      firstname: form.firstname?.trim() || undefined,
      rank: form.rank,
      birth: form.birth && new Date(form.birth) || undefined,
      club: form.club?.trim() || undefined,
      licence: form.licence?.trim() || undefined,
      registration: getCheckboxes(formElems.registration),
      adress1: form.adress1?.trim() || undefined,
      adress2: form.adress2?.trim() || undefined,
      zipCode: form.zipCode?.trim() || undefined,
      city: form.city?.trim() || undefined,
      phone1: form.phone1?.trim() || undefined,
      phone2: form.phone2?.trim() || undefined,
      email: form.email?.trim() || undefined,
      comment: form.comment?.trim() || undefined,
    };

    // if ((evt.submitter as HTMLButtonElement).value === 'Delete') {
    //   if (form.id) {
    //     commandManager.add(deletePlayer(form.id));
    //   }
    // } else
    props.onOk(result);

    refDlg.close();
    // props.onClose();
  };

  const deleteAndClose = () => {
    commandManager.add(deletePlayer(form.id!));
    refDlg.close();
    // props.onClose();
  }

  return (
    <dialog ref={refDlg!} class="p-0">
      <header class="flex justify-between sticky top-0 bg-slate-300 p-1">
        <b><i class='icon2-player'></i> {props.player ? `Edit ${props.player.teamIds ? 'team' : 'player'} ${props.player?.name ?? ''}` : 'New player'}</b>
        <small>Id: {props.player?.id}</small>
        <button type="button" data-dismiss="modal" aria-hidden="true"
          onclick={() => refDlg.close()}
        >&times;</button>
      </header>
      <form method="dialog" class="w-[32rem]" onsubmit={submit}>
        <div class="p-4">
          <input id="id" type="hidden" value={form.id} />
          <div class="flex space-x-6">
            <label class="inline-block w-3/12 text-right pr-3 h-8">Sexe:</label>
            <label class="px-1">
              <input value='H' type="radio" required
                checked={form.sexe === 'H'} onChange={updateField("sexe")} /> <i class="icon2-male"></i></label>
            <label class="px-1">
              <input value='F' type="radio" required
                checked={form.sexe === 'F'} onChange={updateField("sexe")} /> <i class="icon2-female"></i></label>
            <label class="px-1">
              <input value='M' type="radio" required
                checked={form.sexe === 'M'} onChange={updateField("sexe")} /> <i class="icon2-mixte"></i></label>
          </div>
          <div class="mb-1">
            <label for="name" class="inline-block w-3/12 text-right pr-3">Name:</label>
            <input id="name" type="text" required class="w-9/12 p-1"
              autofocus
              value={form.name} onChange={updateField("name")} />
            {/*<span class="error" show.bind="playerForm.name.$error.required">Required!</span> */}
          </div>
          <Show when={form.teamIds} fallback={
            <div class="mb-1">
              <label for="firstname" class="inline-block w-3/12 text-right pr-3">First name:</label>
              <input id="firstname" type="text" value={form.firstname ?? ''} onChange={updateField('firstname')} class="w-9/12 p-1" />
            </div>
          }>
            <div class="mb-1 flex">
              <div class="inline-block w-3/12 text-right pr-3">
                Team:<br/>
                <button type="button" class="rounded-full p-1" title="Add team member">➕</button>
              </div>
              <ul>
                <For each={form.teamIds}>{(playerId) => {
                  const teamPlayer = byId(props.players, playerId);
                  return <li>{
                    teamPlayer
                      ? <span>
                        <A href={urlPlayer(teamPlayer)}><i class="icon2-info"/></A>
                        <IconSexe sexe={teamPlayer.sexe} /> {teamPlayer.name} {teamPlayer.firstname?.[0] ?? ''} {teamPlayer.rank} {teamPlayer.rank2 && teamPlayer.rank2 !== teamPlayer.rank ? `(${teamPlayer.rank2})` :''}
                      </span>
                      : `#${playerId}`                    
                  }
                  <button type="button" class="rounded-full p-1 hover">✖</button>
                  </li> ;
                } 
                }</For>
              </ul>
            </div>
          </Show>

          <div class="mb-1">
            <label for="rank" class="inline-block w-3/12 text-right pr-3">Rank:</label>
            <select id="rank" value={form.rank} onChange={updateField('rank')} class="w-2/12 p-1">
              <For each={ranks}>{(rank) => <option>{rank}</option>}</For>
            </select>
          </div>

          <fieldset class="border-2"><legend>General</legend>
            <div class="mb-1">
              <label class="inline-block w-3/12 text-right pr-3">Birth:</label>
              <input name="birth" type="date" value={form.birth?.toISOString().substring(0, 10) ?? ''} onChange={updateField('birth')} class="p-1" />
              <span class="ml-2">{form.birth && category.ofDate(form.birth)}</span>
            </div>
            <div class="mb-1">
              <label class="inline-block w-3/12 text-right pr-3">Club:</label>
              <input type="text" value={form.club ?? ''} onChange={updateField('club')} class="w-9/12 p-1" />
            </div>
            <div class="mb-1">
              <label class="inline-block w-3/12 text-right pr-3">Licence:</label>
              <input type="text" value={form.licence ?? ''} onChange={updateField('licence')} class="w-3/12 p-1" />
            </div>
          </fieldset>
          <fieldset class="border-2"><legend>Registration</legend>
            <div class="mb-1 flex">
              <label class="inline-block w-3/12 text-right pr-3">Events:</label>
              <div class="inline-block">
                <For each={props.events.filter((event) => isSexeCompatible(event, form.sexe))}>{(event) =>
                  <div>
                    <label><input name="registration" type="checkbox"
                      value={event.id}
                      checked={form.registration.includes(event.id)}
                    /> <span class="border-l-8" style={{ "border-color": event.color ?? 'transparent' }}>
                      <IconSexe sexe={event.sexe} double={event.typeDouble}/>{event.name}
                    </span></label>
                  </div>
                }</For>
              </div>
            </div>
          </fieldset>
          <fieldset class="border-2"><legend>Coordinates</legend>
            <details class="mb-1">
              <summary class="w-3/12">Adress <Show when={form.adress1 || form.adress2 || form.city || form.zipCode}>*</Show></summary>
              <div class="mb-1">
                <label for="adress" class="inline-block w-3/12 text-right pr-3">Adress:</label>
                <input id="adress" type="text" value={form.adress1 ?? ''} onChange={updateField('adress1')} class="w-9/12 p-1" />
              </div>
              <div class="mb-1">
                <label class="inline-block w-3/12"></label>
                <input type="text" value={form.adress2 ?? ''} onChange={updateField('adress2')} class="w-9/12 p-1" />
              </div>
              <div class="mb-1">
                <label class="inline-block w-3/12"></label>
                <input type="text" value={form.zipCode ?? ''} onChange={updateField('zipCode')} class="w-2/12 p-1" />
                <span class="inline-block w-1/12"></span>
                <input type="text" value={form.city ?? ''} onChange={updateField('city')} class="w-6/12 p-1" />
              </div>
            </details>
            <div class="mb-1">
              <label class="inline-block w-3/12 text-right pr-3">Phones:</label>
              <input type="tel" value={form.phone1 ?? ''} onChange={updateField('phone1')} class="w-4/12 p-1" />
              <span class="inline-block w-1/12"></span>
              <input type="tel" value={form.phone2 ?? ''} onChange={updateField('phone2')} class="w-4/12 p-1" />
            </div>
            <div class="mb-1">
              <label class="inline-block w-3/12 text-right pr-3">eMail:</label>
              <input type="email" value={form.email ?? ''} onChange={updateField('email')} class="w-9/12 p-1" />
            </div>
          </fieldset>
          {/*<fieldset class="border-2"><legend>Team</legend>
                      </fieldset> */}
          <fieldset class="border-2"><legend>Comment</legend>
            <div class="flex">
              <label class="inline-block w-3/12 text-right pr-3">Note:</label>
              <textarea value={form.comment ?? ''} onChange={updateField('comment')} class="w-9/12 p-1"></textarea>
            </div>
          </fieldset>
        </div>
        <footer class='sticky bottom-0 flex justify-end space-x-2 mt-2 pb-4 pr-4 bg-gray-50 bg-opacity-60'>
          <button type="submit"
            //  disabled.bind="!!playerForm.$error.required"
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
        {/*<fieldset class="border-2">
                  <legend>Coordinate</legend>

                  <div>
                      <label>
                          Rank:
                  <select type="text" value={form.rank ?? ''} onChange={updateField('rank')} >
                      <option repeat.for="value of ranks">{value}</option>
                  </select></label>
                  </div>
              </fieldset> */}
        {/*{ playerForm.$error } */}
      </form>
    </dialog>
  );
};
