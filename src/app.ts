import {autoinject} from 'aurelia-framework';
import {Router, RouterConfiguration} from 'aurelia-router';

import { Selection,ModelType } from './services/util/selection';
import { Undo } from './services/util/undo';

import { MainLib } from './services/mainLib';
import { TournamentLib } from './services/tournamentLib';

import { Knockout } from './services/draw/knockout';
import { Roundrobin } from './services/draw/roundrobin';

// import {DialogService,DialogResult} from 'aurelia-dialog';  //for quick test
// import {DialogInfo} from './views/tournament/dialog-info';

// import {ListPlayers} from './views/player/list-players';  //for quick test

@autoinject
export class App {

   router: Router;
  
   constructor(
      private knockout:Knockout, 
      private roundrobin:Roundrobin 
   ) {
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
