import {autoinject} from 'aurelia-framework';
import {Router, RouterConfiguration} from 'aurelia-router';

import { Knockout } from './services/draw/knockout';
import { Roundrobin } from './services/draw/roundrobin';

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
