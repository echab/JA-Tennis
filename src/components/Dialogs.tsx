import { Component, createSignal, Match as Case, Switch } from "solid-js";
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
import { Match } from "../domain/draw";
import { DialogPlace } from "./planning/DialogPlace";
import { updatePlace } from "../services/planningService";

export type DialogName = 'info' | 'place' | 'player' | 'event' | 'draw' | 'match';

export const [dialog, showDialog] = createSignal<DialogName>();

export const Dialogs: Component = () => {
    return <Switch>
        <Case when={dialog() === "info"}>
            <DialogInfo info={selection.tournament.info}
                onOk={commandManager.wrap(updateInfo)}
                onClose={() => showDialog()}
            />
        </Case>
        <Case when={dialog() === "player"}>
            <DialogPlayer
                player={selection.player}
                tournament={selection.tournament}
                onOk={commandManager.wrap(updatePlayer)}
                onClose={() => showDialog()}
            />
        </Case>
        <Case when={dialog() === "place" && selection.place}>
            <DialogPlace
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                place={selection.place!}
                onOk={commandManager.wrap(updatePlace)}
                onClose={() => showDialog()}
            />
        </Case>
        <Case when={dialog() === "event"}>
            <DialogEvent
                event={selection.event}
                onOk={commandManager.wrap(updateEvent)}
                onClose={() => showDialog()}
            />
        </Case>
        <Case when={dialog() === "draw"}>
            {/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */}
            <DialogDraw event={selection.event!} draw={selection.draw}
                tournament={selection.tournament}

                onOk={commandManager.wrap(updateDraws)}
                onClose={() => showDialog()}
            />
        </Case>
        <Case when={dialog() === "match" && selection.event && selection.draw}>
            {/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */}
            <DialogMatch event={selection.event!} draw={selection.draw!} tournament={selection.tournament}
                match={selection.box as Match}

                onOk={commandManager.wrap(updateMatch)}
                onClose={() => showDialog()}
            />
        </Case>
    </Switch>
}