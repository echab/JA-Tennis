import { Component, For, JSX } from 'solid-js';
import { A } from '@solidjs/router';
import { selectDraw, selectEvent, selection, urlDraw, urlEvent } from '../util/selection';
import { TEvent } from '../../domain/tournament';
import { commandManager } from '../../services/util/commandManager';
import { registerPlayer } from '../../services/playerService';
import { dragOver, getDragPlayer, getDropEvent } from '../../services/util/dragdrop';
import { isSexeCompatible } from '../../services/tournamentService';
import { showDialog } from '../Dialogs';
import { IconSexe } from '../misc/IconSexe';

type Props = {
  events: TEvent[];
}

export const Events: Component<Props> = (props) => {

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
        <A class="[&[aria-selected=true]]:bg-blue-200 block"
          aria-selected={selection.event === event}
          // onclick={() => { selectEvent(event); }}
          href={urlEvent(event)} replace={true}
        >
          <i class="icon2-info hover" onclick={() => { selectEvent(event); showDialog("event"); }}></i>
          <small>{event.id} </small>
          <IconSexe sexe={event.sexe} />
          <span>{event.name}</span>
          {/* <small>X click.trigger="eventEditor.remove(event)"</small> */}
        </A>

        <div>
          <For each={event.draws}>{(draw) =>
            <div class="draws px-1"
              aria-selected={draw.id === selection.draw?.id}
              classList={{ error: selection.drawErrors.has(`${draw.id}-${event.id}`) }}
            >
              <A class="[&[aria-selected=true]]:bg-blue-200 block"
                classList={{ "mt-2": !draw.suite }}
                aria-selected={selection.draw?.id === draw.id}
                // onclick={() => selectDraw(event, draw)}
                href={urlDraw(draw, event)} replace={true}
              >
                <i class="icon2-info hover"
                  onclick={() => {
                    selectDraw(event, draw);
                    showDialog("draw");
                  }}
                ></i>
                <small>{draw.id} </small>
                <i class="icon2-draw"></i>
                {draw.name} {draw.suite ? '(c)' : ''}
                {/* TODO list the count of registered players in this draw, by rank */}

                <span class="float-right hover">&Gt;</span>

                {/* <span class=" float-right hover" onClick={() => commandManager.wrap(() => deleteDraw(draw.id))}><i class="icon2-cross"></i></span> */}
              </A>
            </div>
          }</For>
        </div>

        <button type="button" class="rounded-full p-1"
          onclick={() => {
            selectDraw(event, undefined);
            showDialog("draw");
          }}
        >➕ Add draw</button>

        {/* TODO list the count of registered players not in any draw, by rank */}

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