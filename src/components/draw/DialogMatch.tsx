import { Component, For, JSX, onMount, onCleanup } from 'solid-js';
import { Draw, Match } from '../../domain/draw';
import { drawLib } from '../../services/draw/drawLib';
import { TEvent, Tournament } from '../../domain/tournament';
import { matchFormat } from '../../services/types';
import { useForm } from '../util/useForm';
import { byId } from '../../services/util/find';
import { dateTimeLocal } from '../../utils/date';

type Props = {
    event: TEvent;
    draw: Draw;
    match: Match;
    tournament: Tournament;
    // eslint-disable-next-line no-unused-vars
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

    const { player1: box1, player2: box2 } = lib.boxesOpponents(props.match);

    const match: Match = { ...props.match }; // clone, without reactivity
    match.score ??= '';

    const player1 = byId(props.tournament.players, box1.playerId);
    const player2 = byId(props.tournament.players, box2.playerId);

    const { form, updateField } = useForm(match);

    const otherPlayerId = (id: string) => id === box1.playerId ? box2.playerId : box1.playerId;
    const winnerId = () => match.playerId
        ? form.vainqDef ? otherPlayerId(match.playerId) : match.playerId
        : '';

    const matchFormats = matchFormat.list();

    const submit: JSX.EventHandlerUnion<HTMLFormElement, Event & { submitter: HTMLElement; }> = (evt) => {
        evt.preventDefault();

        // const formElems = (evt.target as HTMLFormElement).elements as unknown as Record<keyof Draw, RadioNodeList>;

        const result: Match = {
            // Box:
            // id: form.id,
            position: form.position,
            hidden: form.hidden,
            locked: form.locked,

            playerId: form.vainqDef ? otherPlayerId(form.playerId) : form.playerId,

            // Match:
            score: form.score.trim(),
            wo: form.wo,
            qualifOut: form.qualifOut,
            canceled: form.canceled,
            vainqDef: form.vainqDef,

            // Planning:
            place: form.place !== undefined && form.place >= 0 ? Number(form.place) : undefined,
            date: form.date,
            receive: form.receive,
            aware1: form.aware1,
            aware2: form.aware2,

            matchFormat: form.matchFormat,
            note: form.note?.trim(),
        };

        props.onOk(props.event, props.draw, result);

        refDlg.close();
        // props.onClose();
    };

    return (
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        <dialog ref={refDlg!} class="p-0">
            <header class="flex justify-between sticky top-0 bg-slate-300 p-1">
                <span><i class='icon2-match' /> Match - {player1?.name ?? '-'} vs {player2?.name ?? '-'}</span>
                {/* <small>{props.match.position}</small> */}
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
                            checked={winnerId() === player1?.id} value={player1?.id} onChange={updateField("playerId")}
                        />
                        {player1?.name} {player1?.rank}</label>
                        <br />
                        <span class="inline-block w-3/12 text-right pr-3">
                            {/* <label><input type="radio" name="winner"
                                checked={!form.playerId} value={undefined} onChange={updateField("playerId")}
                            />None</label> */}
                        </span>
                        <label><input type="radio" name="winner" class="p-1 mr-1"
                            checked={winnerId() === player2?.id} value={player2?.id} onChange={updateField("playerId")}
                        />
                        {player2?.name} {player2?.rank}</label>
                    </div>

                    <div class="mb-1">
                        <label for="score" class="inline-block w-3/12 text-right pr-3">Score:</label>
                        <input id="score" type="text" class="w-4/12 p-1"
                            value={form.score} onChange={updateField("score")} />

                        <label class="ml-2"><input id="wo" type="checkbox" checked={form.wo} onChange={updateField("wo")} /> WO</label>
                    </div>

                    <div class="mb-1">
                        <span class="inline-block w-3/12"></span>
                        <label><input type="checkbox" checked={form.canceled} onChange={updateField("canceled")} /> Gives up</label>
                        <label class="pl-3"><input type="checkbox" checked={form.vainqDef} onChange={updateField("vainqDef")} /> Defaulting winner</label>
                    </div>

                    <fieldset class="border-2">
                        <legend>Planning</legend>

                        <div class="mb-1">
                            <label class="inline-block w-3/12 text-right pr-3">Date &amp; time:</label>
                            <input name="start" type="datetime-local" value={dateTimeLocal(form.date) ?? ''} onChange={updateField('date')} class="p-1"
                                min={dateTimeLocal(props.tournament.info.start)}
                                max={dateTimeLocal(props.tournament.info.end)}
                            />
                        </div>

                        <div class="mb-1">
                            <label for="place" class="inline-block w-3/12 text-right pr-3">Court:</label>
                            <select id="place" value={form.place} onChange={updateField('place')} class="w-6/12 p-1">
                                <option value={-1}></option>
                                <For each={props.tournament.places}>{(place, i) => <option value={i()}>{place.name}</option>}</For>
                            </select>
                        </div>

                        <div class="mb-1">
                            <label class="inline-block w-3/12 text-right pr-3">{player1?.name}:</label>
                            <label><input type="checkbox" checked={!!form.aware1} onChange={updateField("aware1")} /><i class='icon2-aware' />Aware</label>
                            <label class="pl-5"><input type="checkbox" checked={!form.receive} onChange={updateField("receive")} /><i class='icon2-home' />Receive</label>
                        </div>
                        <div class="mb-1">
                            <label class="inline-block w-3/12 text-right pr-3">{player2?.name}:</label>
                            <label><input type="checkbox" checked={!!form.aware2} onChange={updateField("aware2")} /><i class='icon2-aware' />Aware</label>
                            <label class="pl-5"><input type="checkbox" checked={!!form.receive} onChange={updateField("receive")} /><i class='icon2-home' />Receive</label>
                        </div>
                    </fieldset>

                    <fieldset class="border-2"><legend>Comment</legend>
                        <div class="mb-1">
                            <label for="matchFormat" class="inline-block w-3/12 text-right pr-3">Match format:</label>
                            <select id="matchFormat" value={form.matchFormat} onChange={updateField('matchFormat')} class="w-9/12 p-1">
                                <option></option>
                                <For each={matchFormats}>{(f, i) => <option value={i()}>{f.name}</option>}</For>
                            </select>
                        </div>

                        <div class="flex mb-1">
                            <label class="inline-block w-3/12 text-right pr-3"><i class="icon2-note" /> Note:</label>
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
