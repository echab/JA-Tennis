import { Component, For, JSX } from 'solid-js';
import { selectDraw, selectEvent, selection } from '../util/selection';
import { TEvent } from '../../domain/tournament';
import { commandManager } from '../../services/util/commandManager';
import { registerPlayer } from '../../services/playerService';
import { dragOver, getDragPlayer, getDropEvent } from '../../services/util/dragdrop';
import { isSexeCompatible } from '../../services/tournamentService';
import { showDialog } from '../Dialogs';

type Props = {
  events: TEvent[];
}

export const Events: Component<Props> = (props) => {

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
    <For each={props.events} fallback={<div>No event</div>}>{(event) =>
      <div
        aria-selected={event.id === selection.event?.id}
        class="border-l-8 m-2"
        style={{ "border-color": event.color ?? 'transparent' }}
        ondrop={drop_handler} ondragover={dragOver} data-type='event' data-id={event.id}
      >
        {/* <input type="checkbox" /> */}
        <h4 class="[&[aria-selected=true]]:bg-blue-200"
          aria-selected={selection.event === event}
          onclick={(evt) => { selectEvent(event); }}
         >
          <i class="icon2-info hover" onclick={() => { selectEvent(event); showDialog("event"); }}></i>
          {/* <small>{event.id} </small> */}
          <i classList={{
            'icon2-male': event.sexe === 'H',
            'icon2-female': event.sexe === 'F',
            'icon2-mixte': event.sexe === 'M',
          }}></i>
          <span>{event.name}</span>
          {/* <small>X click.trigger="eventEditor.remove(event)"</small> */}
        </h4>

        <div>
          <For each={event.draws}>{(draw) =>
            <div class="draws px-1"
              aria-selected={draw.id === selection.draw?.id}
              // classList={{ error: validation.hasErrorDraw(draw) }}
            >
              <h5 class="[&[aria-selected=true]]:bg-blue-200"
                classList={{"mt-2": !draw.suite }}
                aria-selected={selection.draw?.id === draw.id}
                onclick={(evt) =>                   selectDraw(event, draw)}
              >
                <i class="icon2-info hover"
                  onclick={() => {
                    selectDraw(event, draw);
                    showDialog("draw");
                  }}
                ></i>
                <i class="icon2-draw"></i>
                {draw.name} {draw.suite ? '(c)' : ''}
                {/* <i class="glyphicon glyphicon-trash" click.trigger="drawEditor.remove(draw)">X</i> */}
                <span class="float-right">&Gt;</span>
              </h5>
            </div>
          }</For>
        </div>

        <button type="button" class="rounded-full p-1"
          onclick={() => {
            selectDraw(event, undefined);
            showDialog("draw");
          }}
        >➕ Add draw</button>

      </div>
    }</For>

    <button type="button" class="rounded-full p-1"
      onclick={() => {
        selectEvent(undefined);
        showDialog("event");
      }}
    >➕ Add event</button>
  </>
}