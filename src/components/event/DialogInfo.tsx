import { Component, JSX, onMount, onCleanup, Show } from 'solid-js';
import { TournamentInfo } from '../../domain/tournament';
import { useForm } from '../util/useForm';

const EMPTY: TournamentInfo = { name: '', slotLength: 90 };

type Props = {
   info: TournamentInfo;
   // eslint-disable-next-line no-unused-vars
   onOk: (info: TournamentInfo) => void;
   onClose: () => void;
}

export const DialogInfo: Component<Props> = (props) => {
   let refDlg: HTMLDialogElement;

   onMount(() => {
      refDlg.addEventListener('close', props.onClose)
      refDlg.showModal();
   });

   onCleanup(() => {
      refDlg.removeEventListener('close', props.onClose)
   })

   const info: TournamentInfo | undefined = props.info && { ...props.info }; // clone, without reactivity

   const { form, updateField, updateSubField } = useForm<TournamentInfo>(info ?? EMPTY);

   const submit: JSX.EventHandlerUnion<HTMLFormElement, Event & { submitter: HTMLElement; }> = (evt) => {
      evt.preventDefault();

      const club: TournamentInfo["club"] = {
         name: form.club?.name.trim() || '',
         adress1: form.club?.adress1?.trim() || undefined,
         adress2: form.club?.adress2?.trim() || undefined,
         zipCode: form.club?.zipCode?.trim() || undefined,
         city: form.club?.city?.trim() || undefined,
         phone1: form.club?.phone1?.trim() || undefined,
         phone2: form.club?.phone2?.trim() || undefined,
         email: form.club?.email?.trim() || undefined,
      };

      const referee: TournamentInfo["referee"] = {
         name: form.referee?.name.trim() || '',
         licence: form.referee?.licence?.trim() || undefined,
         adress1: form.referee?.adress1?.trim() || undefined,
         adress2: form.referee?.adress2?.trim() || undefined,
         zipCode: form.referee?.zipCode?.trim() || undefined,
         city: form.referee?.city?.trim() || undefined,
         phone1: form.referee?.phone1?.trim() || undefined,
         phone2: form.referee?.phone2?.trim() || undefined,
         email: form.referee?.email?.trim() || undefined,
      };

      const result: TournamentInfo = {
         name: form.name.trim(),

         start: form.start && new Date(form.start) || undefined,
         end: form.end && new Date(form.end) || undefined,

         slotLength: form.slotLength,

         homologation: form.homologation?.trim(),

         club,
         referee,
      };

      props.onOk(result);
      refDlg.close();
      // props.onClose();
   };

   return (
      <dialog ref={refDlg!} class="p-0">
         <header class="flex justify-between sticky top-0 bg-slate-300 p-1">
            <b>Tournament information</b>
            <button type="button" data-dismiss="modal" aria-hidden="true"
               onclick={() => refDlg.close()}
            >&times;</button>
         </header>
         <form method="dialog" class="w-[32rem]" onsubmit={submit}>
            <div class="p-4">
               <div class="mb-1">
                  <label for="name" class="inline-block w-3/12 text-right pr-3">Name:</label>
                  <input id="name" type="text" autofocus required class="w-9/12 p-1"
                     value={form.name} onChange={updateField("name")} />
                  {/*<span class="error" show.bind="eventForm.name.$error.required">Required!</span> */}
               </div>

               <fieldset>
                  <legend>Planning</legend>

                  <div class="mb-1">
                     <label class="inline-block w-3/12 text-right pr-3">Date start:</label>
                     <input name="start" type="date" value={form.start?.toISOString().substring(0, 10) ?? ''} onChange={updateField('start')} class="p-1" />
                  </div>
                  <div class="mb-1">
                     <label class="inline-block w-3/12 text-right pr-3">End:</label>
                     <input name="end" type="date" class="p-1"
                        value={form.end?.toISOString().substring(0, 10) ?? ''} onChange={updateField('end')}
                     />
                  </div>

                  <div class="mb-1" title="average match duration">
                     <label class="inline-block w-3/12 text-right pr-3">Slot duration:</label>
                     <input name="slotLength" type="number" min="10" max="300" list='slotLengths' required class="p-1"
                        value={form.slotLength} onChange={updateField('slotLength')}
                     />
                     <span class="ml-2">minutes</span>
                     <datalist id="slotLengths">
                        <option>45</option>
                        <option>60</option>
                        <option>75</option>
                        <option>90</option>
                        <option>105</option>
                     </datalist>
                  </div>
               </fieldset>

               <div class="mb-1">
                  <label for="homologation" class="inline-block w-3/12 text-right pr-3">Homologation:</label>
                  <input id="homologation" type="text" class="w-5/12 p-1"
                     value={form.homologation ?? ''} onChange={updateField('homologation')} />
               </div>

               <fieldset>
                  <legend>Club</legend>
                  <div class="mb-1">
                     <label for="club_name" class="inline-block w-3/12 text-right pr-3">Name:</label>
                     <input id="club_name" type="text" class="w-9/12 p-1"
                        value={form.club?.name ?? ''} onChange={updateSubField("club", "name")} />
                  </div>
                  <div class="mb-1">
                     <label class="inline-block w-3/12 text-right pr-3">Phones:</label>
                     <input type="tel" value={form.club?.phone1 ?? ''} onChange={updateSubField("club", 'phone1')} class="w-4/12 p-1" />
                     <span class="inline-block w-1/12"></span>
                     <input type="tel" value={form.club?.phone2 ?? ''} onChange={updateSubField("club", 'phone2')} class="w-4/12 p-1" />
                  </div>
                  <div class="mb-1">
                     <label class="inline-block w-3/12 text-right pr-3">eMail:</label>
                     <input type="email" value={form.club?.email ?? ''} onChange={updateSubField("club", 'email')} class="w-9/12 p-1" />
                  </div>
                  <details class="mb-1">
                     <summary class="w-3/12">Adress <Show when={form.club?.adress1 || form.club?.adress2 || form.club?.city || form.club?.zipCode}>*</Show></summary>
                     <div class="mb-1">
                        <label for="adress" class="inline-block w-3/12 text-right pr-3">Adress:</label>
                        <input id="adress" type="text" value={form.club?.adress1 ?? ''} onChange={updateSubField("club", 'adress1')} class="w-9/12 p-1" />
                     </div>
                     <div class="mb-1">
                        <label class="inline-block w-3/12"></label>
                        <input type="text" value={form.club?.adress2 ?? ''} onChange={updateSubField("club", 'adress2')} class="w-9/12 p-1" />
                     </div>
                     <div class="mb-1">
                        <label class="inline-block w-3/12"></label>
                        <input type="text" value={form.club?.zipCode ?? ''} onChange={updateSubField("club", 'zipCode')} class="w-2/12 p-1" />
                        <span class="inline-block w-1/12"></span>
                        <input type="text" value={form.club?.city ?? ''} onChange={updateSubField("club", 'city')} class="w-6/12 p-1" />
                     </div>
                  </details>
               </fieldset>

               <fieldset>
                  <legend>Referee</legend>
                  <div class="mb-1">
                     <label for="referee_name" class="inline-block w-3/12 text-right pr-3">Name:</label>
                     <input id="referee_name" type="text" class="w-9/12 p-1"
                        value={form.referee?.name ?? ''} onChange={updateSubField("referee", "name")} />
                  </div>
                  <div class="mb-1">
                     <label class="inline-block w-3/12 text-right pr-3">Phones:</label>
                     <input type="tel" value={form.referee?.phone1 ?? ''} onChange={updateSubField("referee", 'phone1')} class="w-4/12 p-1" />
                     <span class="inline-block w-1/12"></span>
                     <input type="tel" value={form.referee?.phone2 ?? ''} onChange={updateSubField("referee", 'phone2')} class="w-4/12 p-1" />
                  </div>
                  <div class="mb-1">
                     <label class="inline-block w-3/12 text-right pr-3">eMail:</label>
                     <input type="email" value={form.referee?.email ?? ''} onChange={updateSubField("referee", 'email')} class="w-9/12 p-1" />
                  </div>
                  <details class='mb-1'>
                     <summary class="w-3/12">Adress <Show when={form.referee?.adress1 || form.referee?.adress2 || form.referee?.city || form.referee?.zipCode}>*</Show></summary>
                     <div class="mb-1">
                        <label for="adress" class="inline-block w-3/12 text-right pr-3">Adress:</label>
                        <input id="adress" type="text" value={form.referee?.adress1 ?? ''} onChange={updateSubField("referee", 'adress1')} class="w-9/12 p-1" />
                     </div>
                     <div class="mb-1">
                        <label class="inline-block w-3/12"></label>
                        <input type="text" value={form.referee?.adress2 ?? ''} onChange={updateSubField("referee", 'adress2')} class="w-9/12 p-1" />
                     </div>
                     <div class="mb-1">
                        <label class="inline-block w-3/12"></label>
                        <input type="text" value={form.referee?.zipCode ?? ''} onChange={updateSubField("referee", 'zipCode')} class="w-2/12 p-1" />
                        <span class="inline-block w-1/12"></span>
                        <input type="text" value={form.referee?.city ?? ''} onChange={updateSubField("referee", 'city')} class="w-6/12 p-1" />
                     </div>
                  </details>
               </fieldset>
            </div>
            <hr />
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
