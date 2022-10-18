import { autoinject, bindable } from "aurelia-framework";
import { DialogResult, DialogService } from "aurelia-dialog";
import { DialogInfo } from "./tournament/dialog-info";
import { ModelType, Selection } from "./selection";
import { Guid } from "./util/guid";
import { Undo } from "./util/undo";
import { _newInfo, save } from "../services/tournamentService";
import { Tournament } from "../domain/tournament";

@autoinject
export class TournamentEditor {
  constructor(
    private dialogService: DialogService,
    public selection: Selection,
    private undo: Undo,
  ) {}

  async create(): Promise<Tournament | undefined> {
    //TODO confirmation
    //TODO undo

    const tournament = await this.edit();
    if (tournament) {
      //save current tournament
      save(tournament);

      //reset undo and select the new tournament
      this.undo.reset();
      return this.selection.select(tournament, ModelType.Tournament);
    }
  }

  async edit(tournament?: Tournament): Promise<Tournament | undefined> {
    const title = tournament ? "Edit info" : "New tournament";

    tournament = tournament || {
      id: Guid.create("T"),
      info: {
        name: "",
      },
      players: [],
      events: [],
    };

    var editedInfo = _newInfo(tournament.info);

    const result = await this.dialogService.open({
      viewModel: DialogInfo,
      model: {
        title: title,
        info: editedInfo,
      },
    });
    if ("Ok" === result.output) {
      this.undo.updateProperties(tournament.info, editedInfo, title); //tournament.info.* = editedInfo.*;
      return tournament;
    }
  }
}
