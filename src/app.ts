import {autoinject} from 'aurelia-framework';
import {Router, RouterConfiguration} from 'aurelia-router';

import { Selection,ModelType } from './services/util/selection';
import { Undo } from './services/util/undo';

import { MainLib } from './services/mainLib';
import { TournamentLib } from './services/tournamentLib';

// import {DialogService,DialogResult} from 'aurelia-dialog';  //for quick test
// import {DialogInfo} from './views/tournament/dialog-info';

// import {ListPlayers} from './views/player/list-players';  //for quick test

@autoinject
export class App {

   router: Router;
  
//    constructor(
//     private mainLib:MainLib, public selection:Selection, private undo:Undo,
//      private dialogService:DialogService
//    ) {

//       //TODO refactor. For initial test only    
//        this.loadTournament('data/tournament8.json');
//    }

   configureRouter(config: RouterConfiguration, router: Router) {
      config.title = 'Aurelia';
      config.map([
         { route: ['', 'welcome'], name: 'welcome',      moduleId: 'welcome',      nav: true, title: 'Welcome' },
         { route: 'users',         name: 'users',        moduleId: 'users',        nav: true, title: 'Github Users' },
         { route: 'child-router',  name: 'child-router', moduleId: 'child-router', nav: true, title: 'Child Router' }
      ]);

      this.router = router;
   }

//    loadTournament(filename: File|string): void {
//         this.mainLib.loadTournament(filename).then(tournament => {
//             this.selection.select(tournament, ModelType.Tournament);
//         });
//     }

//    editTournament(tournament: Tournament): void {

//         var editedInfo = TournamentLib.newInfo(this.selection.tournament.info);

//         this.dialogService.open({
//             viewModel: DialogInfo, 
//             model: {
//                 title: "Edit info",
//                 info: editedInfo
//             }
//         }).then((result: DialogResult) => {
//             if ('Ok' === result.output) {
//                 //MainLib.editInfo(editedInfo, this.selection.tournament.info);
//                 var c = this.selection.tournament;
//                 this.undo.update(this.selection.tournament, 'info', editedInfo, "Edit info"); //c.info = editedInfo;
//             }
//         });
//     }
  
}
