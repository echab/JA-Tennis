import { Component, JSX, onMount, onCleanup } from 'solid-js';
import type { Place } from '../../domain/tournament';
import { useForm } from '../util/useForm';

const EMPTY: Place = { name: '', avail: [] };

type Props = {
    place: Place;
    // eslint-disable-next-line no-unused-vars
    onOk: (place: Place) => void;
    onClose: () => void;
}

export const DialogPlace: Component<Props> = (props) => {
    let refDlg: HTMLDialogElement;

    onMount(() => {
        refDlg.addEventListener('close', props.onClose)
        refDlg.showModal();
    });

    onCleanup(() => {
        refDlg.removeEventListener('close', props.onClose)
    })

    const place: Place | undefined = props.place && { ...props.place }; // clone, without reactivity

    const { form, updateField } = useForm<Place>(place ?? EMPTY);

    const submit: JSX.EventHandlerUnion<HTMLFormElement, SubmitEvent> = (evt) => {
        evt.preventDefault();

        const result: Place = {
            name: form.name.trim(),
            avail: form.avail,
        };

        props.onOk(result);
        refDlg.close();
        // props.onClose();
    };

    return (
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        <dialog ref={refDlg!} class="p-0">
            <header class="flex justify-between sticky top-0 bg-slate-300 p-1">
                <b><i class='icon2-planning' /> Place</b>
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

                    <div class="mb-1">
                        <label for="avail" class="inline-block w-3/12 text-right pr-3">Availability:</label>
                        {/* <input id="avail" type="text" class="w-5/12 p-1"
                     value={form.avail ?? ''} onChange={updateField('avail')} /> */}
                    </div>
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
                     commandManager.add(deletePlace(event.id));
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
