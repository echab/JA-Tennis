import { autoinject, bindable } from 'aurelia-framework';
import { Scope } from 'aurelia-binding';
import { Tab } from './tab';

interface TabItem { tab: Tab, index: number };

/**
 * Aurelia.io version of the tabs directive.
 *
 * Inspired by https://angular-ui.github.io/bootstrap/#/tabs
 * https://github.com/angular-ui/bootstrap/blob/master/src/tabs/tabs.js
 * 
 * uib-tabset settings
 * 
 * type (Defaults: tabs) - Navigation type. Possible values are 'tabs' and 'pills'.
 * 
 * active  (Default: Index of first tab) - Active index of tab. Setting this to an existing tab index will make that tab active.
 * 
 * justified (Default: false) - Whether tabs fill the container and have a consistent width.
 * 
 * vertical (Default: false) - Whether tabs appear vertically stacked. * 
 */
@autoinject
export class Tabset {

  @bindable tabs: Array<TabItem> = [];
  @bindable active: number;
  @bindable justified: boolean = false;
  @bindable type: 'tabs' | 'pills' = 'tabs';
  @bindable vertical: boolean = false;

  private oldIndex: number;
  private destroyed: boolean = false;

  verticalChanged(value) {
    this.vertical = parseBoolean( value);
  }
  justifiedChanged(value) {
    this.justified = parseBoolean( value);
  }

  select(index: number, evt?: Event) {
    if (this.destroyed) {
      return;
    }
    var previousIndex = this.findTabIndex(this.oldIndex);
    var previousSelected: TabItem = this.tabs[previousIndex];
    if (previousSelected) {
      previousSelected.tab.onDeselect(evt, index);
      if (evt && evt.defaultPrevented) {
        return;
      }
      previousSelected.tab.active = false;
    }

    var selected = this.tabs[index];
    if (selected) {
      selected.tab.onSelect(evt);
      selected.tab.active = true;
      this.active = this.oldIndex = selected.index;
    } else if (!selected && 'undefined' !== typeof this.oldIndex) {
      this.active = this.oldIndex = null;
    }
  };

  addTab(tab: Tab) {
    this.tabs.push({
      tab: tab,
      index: tab.index
    });
    this.tabs.sort(byIndex);

    if (tab.index === this.active 
    || ('undefined' === typeof this.active && this.tabs.length === 1)) {
      var newActiveIndex = this.findTabIndex(tab.index);
      this.select(newActiveIndex);
    }
  };

  removeTab(tab) {
    var index
    for (var i = 0; i < this.tabs.length; i++) {
      if (this.tabs[i].tab === tab) {
        index = i;
        break;
      }
    }

    if (this.tabs[index].index === this.active) {
      var newActiveTabIndex = index === this.tabs.length - 1 ?
        index - 1 : index + 1 % this.tabs.length;
      this.select(newActiveTabIndex);
    }

    this.tabs.splice(index, 1);
  };

  activeChanged(val) {
    if ('undefined' !== typeof val && val !== this.oldIndex) {
      this.select(this.findTabIndex(val));
    }
  }

  detached() {
    this.destroyed = true;
  }

  private findTabIndex(index: number): number {
    for (var i = 0; i < this.tabs.length; i++) {
      if (this.tabs[i].index === index) {
        return i;
      }
    }
  }
}

function parseBoolean( b) {
  return 'boolean' === typeof b ? b : /^true|yes|1$/i.test(b);
}

function byIndex(t1:TabItem, t2:TabItem) {
  return t1.index > t2.index ? 1 : t1.index < t2.index ? -1 : 0;
}