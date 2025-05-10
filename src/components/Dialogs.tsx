import { Component, createSignal, Match as Case, Switch } from "solid-js";
import { commandManager } from "../services/util/commandManager";
import { DialogInfo } from "./tournament/DialogInfo";
import { DialogPlayer } from "./player/DialogPlayer";
import { selection } from "./util/selection";
import { createTournament, updateInfo } from "../services/tournamentService";
import { updatePlayer } from "../services/playerService";
import { DialogEvent } from "./event/DialogEvent";
import { updateDraws, updateMatch } from "../services/drawService";
import { updateEvent } from "../services/eventService";
import { DialogDraw } from "./draw/DialogDraw";
import { DialogMatch } from "./draw/DialogMatch";
import { Match } from "../domain/draw";
import { DialogPlace } from "./planning/DialogPlace";
import { updatePlace } from "../services/planningService";
import type { Tournament } from "../domain/tournament";

export type DialogName = 'new' | 'info' | 'place' | 'player' | 'event' | 'draw' | 'match';
export type DialogProps<T> = {
    name: DialogName,
    onOk?(data: T): void,
};

export const [dialog, showDialog] = createSignal<DialogProps<unknown>>();

export const Dialogs: Component = () => {
    return <Switch>
        <Case when={dialog()?.name === "new"}>
            <DialogInfo info={{ name: '', slotLength: selection.tournament.info.slotLength, _typeName: selection.tournament.types.name, _new: true }}
                onOk={commandManager.wrap(createTournament(dialog()?.onOk as (t: Tournament) => void))}
                onClose={() => showDialog()}
            />
        </Case>
        <Case when={dialog()?.name === "info"}>
            <DialogInfo info={{...selection.tournament.info, _typeName: selection.tournament.types.name }}
                onOk={commandManager.wrap(updateInfo)}
                onClose={() => showDialog()}
            />
        </Case>
        <Case when={dialog()?.name === "player"}>
            <DialogPlayer
                player={selection.player}
                tournament={selection.tournament}
                onOk={commandManager.wrap(updatePlayer)}
                onClose={() => showDialog()}
            />
        </Case>
        <Case when={dialog()?.name === "place" && selection.place}>
            <DialogPlace
                place={selection.place!}
                onOk={commandManager.wrap(updatePlace)}
                onClose={() => showDialog()}
            />
        </Case>
        <Case when={dialog()?.name === "event"}>
            <DialogEvent
                _types={selection.tournament._types}
                event={selection.event}
                onOk={commandManager.wrap(updateEvent)}
                onClose={() => showDialog()}
            />
        </Case>
        <Case when={dialog()?.name === "draw"}>
            <DialogDraw event={selection.event!} draw={selection.draw}
                tournament={selection.tournament}

                onOk={commandManager.wrap(updateDraws)}
                onClose={() => showDialog()}
            />
        </Case>
        <Case when={dialog()?.name === "match" && selection.event && selection.draw}>
            <DialogMatch event={selection.event!} draw={selection.draw!} tournament={selection.tournament}
                match={selection.box as Match}

                onOk={commandManager.wrap(updateMatch)}
                onClose={() => showDialog()}
            />
        </Case>
    </Switch>
}