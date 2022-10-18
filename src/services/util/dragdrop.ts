import { selection } from "../../components/util/selection";
import { Player } from "../../domain/player";
import { TEvent } from "../../domain/tournament";
import { byId } from "./find";

// let current: {type: string, id: string}; // TODO use on over to check drop validity

export function dragStart(evt: DragEvent) {
  const source = evt.target as unknown as HTMLOrSVGElement;
  const { type, id } =  source.dataset;
  // const current = { type, id };
  if (evt.dataTransfer && type && id) {
    evt.dataTransfer.setData("text/plain", `${type}-${id}`);
    evt.dataTransfer.dropEffect = "copy";
  }
}

export function dragOver(evt: DragEvent) {
  evt.preventDefault();
  if (evt.dataTransfer) {
    evt.dataTransfer.dropEffect = "copy";
    // evt.dataTransfer.getData return something only at start and drop
  }
}

export function getDragPlayer(evt: DragEvent): Player | undefined {
  if (evt.dataTransfer) {
    const [type, id] = evt.dataTransfer.getData("text/plain").split("-");
    if (type === "player") {
      return byId(selection.tournament.players, id);
    }
  }
}

export function getDropEvent(evt: DragEvent): TEvent | undefined {
  const t = evt.currentTarget as unknown as HTMLOrSVGElement;
  const { type, id } = t.dataset;
  if (id && type === "event") {
    return byId(selection.tournament.events, id);
  }
}

export function getDropPlayer(evt: DragEvent): Player | undefined {
  const t = evt.currentTarget as unknown as
    & HTMLOrSVGElement
    & GlobalEventHandlers;
  if (t.ondrop) {
    const { type, id } = t.dataset;
    if (id && type === "player") {
      return byId(selection.tournament.players, id);
    }
  }
}
