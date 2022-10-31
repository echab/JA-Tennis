import { selection, update } from "../components/util/selection";
import { Place } from "../domain/tournament";
import { Command } from "./util/commandManager";

export function updatePlace(place: Place) : Command {
    const prev = selection.place && {...selection.place};
  
    const act = () => update((sel) => {
      sel.place = place;
    });
    act();
  
    const undo = () => update((sel) => {
      sel.place = prev;
    });
  
    return {name:'Update place', act, undo};
  }
  