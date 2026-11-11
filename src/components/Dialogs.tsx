import { type Component, createSignal, Match as Case, Switch } from "solid-js";
import { commandManager } from "../services/util/commandManager";
import { DialogInfo } from "./tournament/DialogInfo";
import { DialogPlayer } from "./player/DialogPlayer";
import { drawById, selDraw, selection, selEvent, selTournament } from "./util/selection";
import { createTournament, updateInfo } from "../services/tournamentService";
import { updatePlayer } from "../services/playerService";
import { DialogEvent } from "./event/DialogEvent";
import { isMatch, updateDraws, updateMatch } from "../services/drawService";
import { updateEvent } from "../services/eventService";
import { DialogDraw } from "./draw/DialogDraw";
import { DialogMatch } from "./draw/DialogMatch";
import { DialogPlace } from "./planning/DialogPlace";
import { updatePlace } from "../services/planningService";
import type { Tournament } from "../domain/tournament";
import type { Match } from "../domain/draw";

export type DialogName = 'new' | 'info' | 'place' | 'player' | 'event' | 'draw' | 'match';
export type DialogProps<T> = {
    name: DialogName,
    onOk?(data: T): void,
};

export const [dialog, showDialog] = createSignal<DialogProps<unknown> | undefined>(undefined, { name: 'dialog' });

export const Dialogs: Component = () => {
    return <Switch>
        <Case when={dialog()?.name === "new"}>
            <DialogInfo info={{ name: '', slotLength: selTournament.info.slotLength, _typeName: selTournament.types.name, _new: true }}
                onOk={commandManager.wrap(createTournament(dialog()?.onOk as (t: Tournament) => void))}
                onClose={showDialog}
            />
        </Case>
        <Case when={dialog()?.name === "info"}>
            <DialogInfo info={{...selTournament.info, _typeName: selTournament.types.name }}
                onOk={commandManager.wrap(updateInfo)}
                onClose={showDialog}
            />
        </Case>
        <Case when={dialog()?.name === "player"}>
            <DialogPlayer
                player={selection.player}
                tournament={selTournament}
                onOk={commandManager.wrap(updatePlayer)}
                onClose={showDialog}
            />
        </Case>
        <Case when={dialog()?.name === "place" && selection.place}>
            <DialogPlace
                place={selection.place!}
                onOk={commandManager.wrap(updatePlace)}
                onClose={showDialog}
            />
        </Case>
        <Case when={dialog()?.name === "event"}>
            <DialogEvent
                _types={selTournament._types}
                event={selEvent()}
                onOk={commandManager.wrap(updateEvent)}
                onClose={showDialog}
            />
        </Case>
        <Case when={dialog()?.name === "draw" && selEvent()}>{(event) =>
            <DialogDraw event={event()} draw={selDraw()}
                tournament={selTournament}

                onOk={commandManager.wrap(updateDraws)}
                onClose={showDialog}
            />
        }</Case>
        <Case when={dialog()?.name === "match" && isMatch(selection.box) && drawById(selection.drawId, selection.eventId)}>{(sel) =>
            <DialogMatch event={sel().event} draw={sel().draw} tournament={selTournament}
                match={selection.box as Match}

                onOk={commandManager.wrap(updateMatch)}
                onClose={showDialog}
            />
        }</Case>
    </Switch>
}