import { Component } from "solid-js";
import { showDialog } from "../Dialogs";
import { selection } from "../util/selection";

export const Tournament: Component = () => {
    return <div>
        <h3>Tournmanent</h3>
        <span>
          <button type="button" onclick={[showDialog,"info"]}><i class="icon2-info"></i></button>
          {selection.tournament.info.name}
        </span>

        {/* TODO New, Recent, Load, Save, etc... */}
    </div>
}
