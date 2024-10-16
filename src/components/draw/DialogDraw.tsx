import { Component, For, JSX, onMount, onCleanup } from 'solid-js';
import { Draw, FINAL, KNOCKOUT, PLAN, ROUNDROBIN, ROUNDROBIN_RETURN } from '../../domain/draw';
import { drawLib, GenerateType } from '../../services/draw/drawLib';
import type { OptionalId } from '../../domain/object';
import type { Player } from '../../domain/player';
import type { TEvent, Tournament } from '../../domain/tournament';
import type { RankString } from '../../domain/types';
import { deleteDraw, findGroupQualifOuts, groupDraw } from '../../services/drawService';
import { getRegisteredPlayers, defaultDrawName } from '../../services/tournamentService';
import { rank } from '../../services/types';
import { useForm } from '../util/useForm';
import { commandManager } from '../../services/util/commandManager';
import { selectDraw } from '../util/selection';
import { IconSexe } from '../misc/IconSexe';
import { columnMax, countInCol } from '../../services/draw/knockoutLib';

const EMPTY: OptionalId<Draw> = { name: '', type: KNOCKOUT, minRank: '', maxRank: '', nbColumn: 3, nbOut: 1, boxes: [] };

type Props = {
    event: TEvent;
    draw?: OptionalId<Draw>;
    tournament: Tournament;
    // eslint-disable-next-line no-unused-vars
    onOk(event: TEvent, draws: Array<OptionalId<Draw>>): void;
    onClose(): void;
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

    const drawTypes: Array<{ value: number; label: string; }> = [];
    drawTypes[KNOCKOUT] = { value: KNOCKOUT, label: "Knock out" };
    drawTypes[FINAL] = { value: FINAL, label: "Final" };
    drawTypes[ROUNDROBIN] = { value: ROUNDROBIN, label: "Round-robin" };
    drawTypes[ROUNDROBIN_RETURN] = { value: ROUNDROBIN_RETURN, label: "Round-robin with return" };

    /** @returns registered players and entries numbers from previous draw */
    const registeredPlayersOrQ = (): Array<Player|number> => {
        const players: Array<Player|number> = getRegisteredPlayers(props.tournament.players, props.event, form.minRank, form.maxRank);
        const prevDraw = props.event.draws.at(-1);
        if (prevDraw) {
            const [iStart, iNext] = groupDraw(props.event, prevDraw.id);
            if (iStart < iNext) {
                const qualifs = findGroupQualifOuts(props.event, [iStart, iNext]);
                if (qualifs.length) {
                    return players.concat(qualifs.map(([q]) => q));
                }
            }
        }
        return players;
    }

    const getNbEntry = (): number => {
        // eslint-disable-next-line no-bitwise
        return form.type & ROUNDROBIN
            ? form.nbColumn // TODO type poule
            : countInCol(columnMax(form.nbColumn, form.nbOut), form.nbOut);
    }

    const submit: JSX.EventHandlerUnion<HTMLFormElement, SubmitEvent> = (evt) => {
        evt.preventDefault();

        // const formElems = (evt.target as HTMLFormElement).elements as unknown as Record<keyof Draw, RadioNodeList>;

        let result: Array<OptionalId<Draw>> = [{
            id: form.id || undefined,
            name: form.name.trim() || defaultDrawName(form),
            type: form.type,
            cont: form.cont,

            minRank: form.minRank,
            maxRank: form.maxRank,

            nbColumn: form.nbColumn,
            nbOut: form.nbOut,

            orientation: form.orientation,

            boxes: draw?.boxes ?? [],

            lock: form.lock,
        }];

        if ((evt.submitter as HTMLButtonElement).value === 'generate') {
            const lib = drawLib(props.event, result[0]);
            // const lastGroup = groups(props.event).slice(-2);
            const lastGroup = groupDraw(props.event, props.event.draws.at(-1)?.id);
            result = lib.generateDraw(GenerateType.Create, registeredPlayersOrQ(), lastGroup);
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
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        <dialog ref={refDlg!} class="p-0">
            <header class="flex justify-between sticky top-0 bg-slate-300 p-1">
                <span><i class='icon2-draw' /> <IconSexe sexe={props.event.sexe} double={props.event.typeDouble} />{props.event.name} - <b>{props.draw ? `Edit draw ${props.draw?.name ?? ''}` : 'New draw'}</b></span>
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
                            placeholder={defaultDrawName(form)}
                            value={form.name !== defaultDrawName(form) ? form.name : ''} onChange={updateField("name")} />
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
                        <label><input type="checkbox" checked={form.cont} onchange={updateField('cont')}
                            disabled={isFirstDraw}
                        /> Same group as previous draw</label>
                    </div>

                    <fieldset>
                        <legend>Dimensions:</legend>
                        <div class="mb-1">
                            <span class="inline-block w-3/12 text-right pr-3"></span>
                            <label><input type="checkbox" checked={form.lock === PLAN} value={PLAN} onchange={updateField('lock')} class="p-1" /> <i class="icon2-locker" /> Lock</label>
                        </div>
                        <div class="mb-1">
                            <label for="nbIn" class="inline-block w-3/12 text-right pr-3">Entries:</label>
                            <input id="nbIn" type="number" readonly value={getNbEntry()} class="w-3/12 p-1" />
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
                        <i class="icon2-draw-generate" /> Generate
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
