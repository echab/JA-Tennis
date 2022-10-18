import { Component, createSignal, For, JSX, Show } from 'solid-js';
import { selectDraw, selectEvent, selection } from '../util/selection';
import { TEvent } from '../../domain/tournament';
import { DrawDraw } from '../draw/DrawDraw';
import { DialogEvent } from './DialogEvent';
import { commandManager } from '../../services/util/commandManager';
import { updateEvent } from '../../services/eventService';
import { DialogDraw } from '../draw/DialogDraw';
import { updateDraws } from '../../services/drawService';
import { registerPlayer } from '../../services/playerService';
import { dragOver, getDragPlayer, getDropEvent } from '../../services/util/dragdrop';
import { isSexeCompatible } from '../../services/tournamentService';

type Props = {
  events: TEvent[];
}

export const Events: Component<Props> = (props) => {

  const [isDlgEvent, showDlgEvent] = createSignal(false);
  const [isDlgDraw, showDlgDraw] = createSignal(false);

  const players = selection.tournament.players;

  const drop_handler: JSX.EventHandlerUnion<HTMLDivElement, DragEvent> = (evt) => {
    evt.preventDefault();
    if (evt.dataTransfer) {
      const player = getDragPlayer(evt);
      const event = getDropEvent(evt);
      if (event && player && isSexeCompatible(event, player.sexe)) {
        commandManager.add(registerPlayer(player, event));
      }
    }
  }

  return <>
    <Show when={isDlgEvent()}>
      <DialogEvent event={selection.event}
        onOk={(event) => commandManager.add(updateEvent(event))}
        onClose={() => showDlgEvent(false)}
      />
    </Show>
    <Show when={selection.event && isDlgDraw()}>
      <DialogDraw event={selection.event!} draw={selection.draw} allPlayers={players}
        onOk={(event, draws) => commandManager.add(updateDraws(event, draws))}
        onClose={() => showDlgDraw(false)}
      />
    </Show>
    <button type="button"
      onclick={() => {
        selectEvent(undefined);
        showDlgEvent(true);
      }}
    >➕ Add event</button>

    <For each={props.events} fallback={<div>No event</div>}>{(event) =>
      <div classList={{ selected: event.id === selection.event?.id }} class="border-l-8"
        style={{ "border-color": event.color ?? 'transparent' }}
        ondrop={drop_handler} ondragover={dragOver} data-type='event' data-id={event.id}
      >
        {/* <input type="checkbox" /> */}
        <h4>
          <i class="icon2-info hover" onclick={() => { selectEvent(event); showDlgEvent(true); }}></i>
          {/* <small>{event.id} </small> */}
          <i classList={{
            'icon2-male': event.sexe === 'H',
            'icon2-female': event.sexe === 'F',
            'icon2-mixte': event.sexe === 'M',
          }}></i>
          <span
          //  click.trigger="selection.select2(event)"
          >{event.name}</span>
          {/* <small>X click.trigger="eventEditor.remove(event)"</small> */}
        </h4>

        <For each={event.draws} fallback={<div class="draws inline">No draw</div>}>{(draw) =>
          <div class="draws inline px-1 border-l-2 border-l-blue-500"
            classList={{
              //  error: drawEditor.validation.hasErrorDraw(draw),
              selected: draw.id === selection.draw?.id
            }}
          >
            <i class="icon2-info hover"
              onclick={() => {
                selectDraw(event, draw);
                showDlgDraw(true);
              }}
            ></i>
            <span
            // click.trigger="selection.select2(draw)"
            >{draw.name} {draw.suite ? '(S)' : ''}</span>
            {/* <i class="glyphicon glyphicon-trash" click.trigger="drawEditor.remove(draw)">X</i> */}
            <DrawDraw event={event} draw={draw} players={players}
            // box-width="10" box-height="4" inter-box-width="2" inter-box-height="0"
            // style="position:relative;"
            // onclick={selectDraw(event, draw)}
            />
          </div>
        }</For>

        <button type="button"
          onclick={() => {
            selectDraw(event, undefined);
            showDlgDraw(true);
          }}
        >➕ Add draw</button>

      </div>
    }</For>
  </>
}