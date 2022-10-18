import { Component, For, JSX, onMount, onCleanup } from 'solid-js';
import { OptionalId } from '../../domain/object';
import { TEvent } from '../../domain/tournament';
import { RankString, CategoryString } from '../../domain/types';
import { rank, category } from '../../services/types';
import { useForm } from '../util/useForm';

const EMPTY: OptionalId<TEvent> = { name: '', sexe: 'H', category: '', maxRank: 'NC', draws: [] };

type Props = {
   event?: OptionalId<TEvent>;
   onOk: (event: OptionalId<TEvent>) => void;
   onClose: () => void;
}

export const DialogEvent: Component<Props> = (props) => {
   let refDlg: HTMLDialogElement;

   onMount(() => {
      refDlg.addEventListener('close', props.onClose)
      refDlg.showModal();
   });

   onCleanup(() => {
      refDlg.removeEventListener('close', props.onClose)
   })

   const event: OptionalId<TEvent> | undefined = props.event && { ...props.event }; // clone, without reactivity

   const { form, updateField, getRadio } = useForm<OptionalId<TEvent>>(event ?? EMPTY);

   const ranks: RankString[] = rank.list();
   const categories: CategoryString[] = category.list();

   const submit: JSX.EventHandlerUnion<HTMLFormElement, Event & { submitter: HTMLElement; }> = (evt) => {
      evt.preventDefault();

      // const formElems = (evt.target as HTMLFormElement).elements as unknown as Record<keyof TEvent, RadioNodeList>;

      const result: OptionalId<TEvent> = {
         id: form.id || undefined,
         name: form.name.trim(),
         typeDouble: form.typeDouble,
         sexe: form.sexe,
         category: form.category,
         maxRank: form.maxRank,

         consolation: form.consolation,

         start: form.start && new Date(form.start) || undefined,
         end: form.end && new Date(form.end) || undefined,

         matchFormat: form.matchFormat,
         color: form.color,
         draws: event?.draws ?? [],
      };

      props.onOk(result);
      // refDlg.returnValue = event;
      refDlg.close();
      // props.onClose();
   };

   return (
      <dialog ref={refDlg!} class="p-0">
         <header class="flex justify-between sticky top-0 bg-slate-300 p-1">
            <b>{props.event ? `Edit event ${props.event?.name ?? ''}` : 'New event'}</b>
            <small>Id: {props.event?.id}</small>
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
               TODO Type: simple/double
               TODO: consolation
               TODO: matchFormat
               */}

               <div class="flex space-x-6">
                  <label class="inline-block w-3/12 text-right pr-3 h-8">Sexe:</label>
                  <label>
                     <input value='H' type="radio" required
                        checked={form.sexe === 'H'} onChange={updateField("sexe")} /> <i class="icon2-male"></i> Male</label>
                  <label>
                     <input value='F' type="radio" required
                        checked={form.sexe === 'F'} onChange={updateField("sexe")} /> <i class="icon2-female"></i> Female</label>
                  <label>
                     <input value='M' type="radio" required
                        checked={form.sexe === 'M'} onChange={updateField("sexe")} /> <i class="icon2-mixte"></i> Mixte</label>
               </div>

               <div class="mb-1">
                  <label for="category" class="inline-block w-3/12 text-right pr-3">Category:</label>
                  <select id="category" value={form.category} onChange={updateField('category')} class="w-3/12 p-1">
                     <For each={categories}>{(cat) => <option>{cat}</option>}</For>
                  </select>
               </div>
               <div class="mb-1">
                  <label for="maxRank" class="inline-block w-3/12 text-right pr-3">Max rank:</label>
                  <select id="maxRank" value={form.maxRank} onChange={updateField('maxRank')} class="w-3/12 p-1">
                     <For each={ranks}>{(rank) => <option>{rank}</option>}</For>
                  </select>
               </div>

               <div class="mb-1">
                  <label class="inline-block w-3/12 text-right pr-3">Date start:</label>
                  <input name="start" type="date" value={form.start?.toISOString().substring(0, 10) ?? ''} onChange={updateField('start')} class="p-1" />
               </div>
               <div class="mb-1">
                  <label class="inline-block w-3/12 text-right pr-3">End:</label>
                  <input name="end" type="date" value={form.end?.toISOString().substring(0, 10) ?? ''} onChange={updateField('end')} class="p-1" />
               </div>

               <div class="mb-1">
                  <label class="inline-block w-3/12 text-right pr-3">Color:</label>
                  <input name="color" type="color" list='colors' value={form.color ?? ''} onChange={updateField('color')} class="p-1" />
                  <datalist id="colors">
                     <option value="lightblue">blue</option>
                     <option value="pink">pink</option>
                  </datalist>
               </div>
            </div>
            <hr />
            <div class="mb-1">
               <label class="inline-block w-3/12 text-right pr-3">Draws:</label>
               <For each={event?.draws}>{(draw) =>
                  <span><i class="icon2-draw"></i> {draw.name}</span>
               }</For>
            </div>
            <footer class='sticky bottom-0 flex justify-end space-x-2 mt-2 pb-4 pr-4 bg-gray-50 bg-opacity-60'>
               <button type="submit"
                  //  disabled.bind="!!eventForm.$error.required"
                  class="rounded-md border border-transparent bg-indigo-400 py-2 px-4 min-w-[6rem]"
               >OK
               </button>

               {/* <button
            disabled={!event?.id}
            onclick={() => {
              if (event?.id) {
                commandManager.add(removePlayer(event.id));
                refDlg.returnValue = 'Delete'
                refDlg.close();
              }
            }}
          >✖ Delete</button> */}

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
