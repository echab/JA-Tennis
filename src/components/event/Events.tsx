import { Component, For, JSX, Show } from 'solid-js';
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
      <div class="flex justify-between items-center px-2">
        <h3>Draws</h3>

        <button type="button" class="rounded-full p-2 hover"
          onclick={() => {
            selectEvent(undefined);
            showDialog("event");
          }}
        >➕ Add an event</button>

        {/* <button type="button" class="p-2 rounded-full">&Gt;</button> */}
      </div>
    <For each={props.events} fallback={<div>No event</div>}>{(event) =>
      <div
        aria-selected={event.id === selection.event?.id}
        class="border-l-8 m-2"
        style={{ "border-color": event.color ?? 'transparent' }}
        ondrop={drop_handler} ondragover={dragOver} data-type='event' data-id={event.id}
      >
        <div class="flex justify-between items-center [&[aria-selected=true]]:bg-blue-200 bg-slate-200"
          aria-selected={selection.event === event}
        >
          {/* <input type="checkbox" /> */}
          <A href={urlEvent(event)} replace>
            <i class="icon2-info hover" onclick={() => { selectEvent(event); showDialog("event"); }}/>
            {/* <small>{event.id} </small> */}
            <IconSexe sexe={event.sexe} double={event.typeDouble} />
            <span>{event.name}</span>
            {/* <small>X click.trigger="eventEditor.remove(event)"</small> */}
          </A>

          <button type="button" class="rounded-full p-[.125rem] px-1 hover" title="Add a draw"
            onclick={() => {
              selectDraw(event, undefined);
              showDialog("draw");
            }}
          >➕ Draw</button>
        </div>

        <div>
          <For each={event.draws}>{(draw) =>
            <div class="draws px-1"
              aria-selected={draw.id === selection.draw?.id}
              classList={{ error: selection.drawProblems.has(`${draw.id}-${event.id}`) }}
            >
              <A class="[&[aria-selected=true]]:bg-blue-200 block"
                classList={{ "mt-2": !draw.cont }}
                aria-selected={selection.draw?.id === draw.id}
                // onclick={() => selectDraw(event, draw)}
                href={urlDraw(draw, event)} replace
              >
                <i class="icon2-info hover"
                  onclick={() => {
                    selectDraw(event, draw);
                    showDialog("draw");
                  }}
                />
                {/* <small>{draw.id} </small> */}
                <i class="icon2-draw" />
                <Show when={draw.lock}><i class="icon2-locker opacity-60 mr-1" /></Show>
                {draw.name} {draw.cont ? '(c)' : ''}
                {/* TODO list the count of registered players in this draw, by rank */}

                <span class="float-right hover">&Gt;</span>

                {/* <span class=" float-right hover" onClick={() => commandManager.wrap(() => deleteDraw(draw.id))}><i class="icon2-cross" /></span> */}
              </A>
            </div>
          }</For>
        </div>

        {/* TODO list the count of registered players not in any draw, by rank */}

      </div>
    }</For>

    <button type="button" class="rounded-full p-1"
      onclick={() => {
        selectEvent(undefined);
        showDialog("event");
      }}
    >➕ Add an event</button>
  </>
}