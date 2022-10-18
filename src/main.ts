import 'bootstrap';
import {Aurelia} from 'aurelia-framework';

export function configure(aurelia: Aurelia) {
  aurelia.use
    .standardConfiguration()
    .developmentLogging()
    .plugin('aurelia-dialog');

  //Uncomment the line below to enable animation.
  aurelia.use.plugin('aurelia-animator-css');

  //TODO dev only
  //aurelia.use.plugin('aurelia-stats', {debugDirtyChecker:true});

  //Anyone wanting to use HTMLImports to load views, will need to install the following plugin.
  //aurelia.use.plugin('aurelia-html-import-template-loader')

  aurelia.start().then(() => aurelia.setRoot());
}
