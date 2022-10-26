import { Component, createSignal, Match, Switch } from "solid-js";
import { commandManager } from "../services/util/commandManager";
import { DialogInfo } from "./tournament/DialogInfo";
import { DialogPlayer } from "./player/DialogPlayer";
import { selection } from "./util/selection";
import { updateInfo } from "../services/tournamentService";
import { updatePlayer } from "../services/playerService";
import { DialogEvent } from "./event/DialogEvent";
import { updateDraws, updateMatch } from "../services/drawService";
import { updateEvent } from "../services/eventService";
import { DialogDraw } from "./draw/DialogDraw";
import { DialogMatch } from "./draw/DialogMatch";
import { Match as MatchBox } from "../domain/draw";

export type DialogName = 'info' | 'player' | 'event' | 'draw' | 'match';

export const [dialog, showDialog] = createSignal<DialogName>();

export const Dialogs: Component = () => {
    return <Switch>
        <Match when={dialog() === "info"}>
            <DialogInfo info={selection.tournament.info}
                onOk={commandManager.wrap(updateInfo)}
                onClose={() => showDialog()}
            />
        </Match>
        <Match when={dialog() === "player"}>
            <DialogPlayer events={selection.tournament.events} player={selection.player}
                onOk={commandManager.wrap(updatePlayer)}
                onClose={() => showDialog()}
            />
        </Match>
        <Match when={dialog() === "event"}>
            <DialogEvent event={selection.event}
                onOk={commandManager.wrap(updateEvent)}
                onClose={() => showDialog()}
            />
        </Match>
        <Match when={dialog() === "draw"}>
            <DialogDraw event={selection.event!} draw={selection.draw}
                allPlayers={selection.tournament.players}

                onOk={commandManager.wrap(updateDraws)}
                onClose={() => showDialog()}
            />
        </Match>
        <Match when={dialog() === "match" && selection.event && selection.draw}>
            <DialogMatch event={selection.event!} draw={selection.draw!}
                players={selection.tournament.players} places={selection.tournament.places ?? []}
                match={selection.box as MatchBox}
                
                onOk={commandManager.wrap(updateMatch)}
                onClose={() => showDialog()}
            />
        </Match>
    </Switch>
}