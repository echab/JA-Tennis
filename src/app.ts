import {autoinject} from 'aurelia-framework';
import {Router, RouterConfiguration} from 'aurelia-router';
import { Selection,ModelType } from './services/util/selection';
import { Undo } from './services/util/undo';

import { MainLib } from './services/mainLib';
import { TournamentLib } from './services/tournamentLib';

// export var selection = new Selection(); //TODO use DI
// export var undo = new Undo(); //TODO use DI

@autoinject
export class App {
  router: Router;
  
  //public static selection = new Selection(); //TODO use DI

  constructor(public selection:Selection, private undo:Undo) {

        //TODO refactor. For initial test only    
        this.selection.tournament = TournamentLib.newTournament();
        var filename = 'data/tournament8.json';
        //var filename = '/data/to2006.json';
        MainLib.loadTournament(filename).then(tournament => {
            this.selection.select(tournament, ModelType.Tournament);
        });
  }

  configureRouter(config: RouterConfiguration, router: Router) {
    config.title = 'Aurelia';
    config.map([
      { route: ['', 'welcome'], name: 'welcome',      moduleId: 'welcome',      nav: true, title: 'Welcome' },
      { route: 'users',         name: 'users',        moduleId: 'users',        nav: true, title: 'Github Users' },
      { route: 'child-router',  name: 'child-router', moduleId: 'child-router', nav: true, title: 'Child Router' }
    ]);

    this.router = router;
  }
}
