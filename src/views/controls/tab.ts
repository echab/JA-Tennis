import { bindable, autoinject } from 'aurelia-framework';

import { Tabset } from './tabset';

// https://github.com/angular-ui/bootstrap/blob/master/src/tabs/tabs.js

/**
 * uib-tab settings
 * 
 * heading - Heading text.
 * 
 * index - Tab index. Must be unique number or string.
 * 
 * classes  - An optional string of space-separated CSS classes.
 * 
 * disabled   (Default: false) - Whether tab is clickable and can be activated.
 * 
 * onSelect()  - An optional expression called when tab is activated. Supports $event in template for expression.
 * 
 * onDeselect()  - An optional expression called when tab is deactivated. 
 * 	Supports $event and $selectedIndex in template for expression. 
 * 	You may call $event.preventDefault() in this event handler to prevent a tab change from occurring. 
 * 	The $selectedIndex can be used to determine which tab was attempted to be opened.
 */
@autoinject
export class Tab {

	@bindable classes: string = '';
	@bindable heading;
	@bindable index: number;
	@bindable onSelect: (evt:Event)=>void = () => {};
	@bindable onDeselect: (evt:Event, selectedIndex:number)=>void= () => {};

	@bindable active: boolean = false;
	@bindable disabled: boolean = false;

	private tabset: Tabset;

	constructor(private element: Element) {	// Inject the instance of this element
	}

	created(owningView /*: View*/, myView /*: View */) {
		this.tabset = myView.container.parent.viewModel;
	}

	bind(bindingContext: Object, overrideContext: Object) {
		if ('undefined' === typeof this.index) {
			if (this.tabset.tabs && this.tabset.tabs.length) {
				this.index = Math.max.apply(null, this.tabset.tabs.map(t => t.index)) + 1;
			} else {
				this.index = 0;
			}
		}

		this.tabset.addTab(this);
	}

	// headingChanged(heading) {
	// 	if (heading) {
	// 		//  elm.html('');
	// 		//  elm.append(heading);
	// 	}
	// }

	select(evt: Event) {
		if (!this.disabled) {
			var index;
			for (var i = 0; i < this.tabset.tabs.length; i++) {
				if (this.tabset.tabs[i].tab === this) {
					index = i;
					break;
				}
			}

			this.tabset.select(index, evt);
		}
	}

	unbind() {
		this.tabset.removeTab(this);
	}
}

// .directive('uibTabContentTransclude', function() {
//   return {
//     restrict: 'A',
//     require: '^uibTabset',
//     link: function(scope, elm, attrs) {
//       var tab = scope.$eval(attrs.uibTabContentTransclude).tab;

//       //Now our tab is ready to be transcluded: both the tab heading area
//       //and the tab content area are loaded.  Transclude 'em both.
//       tab.$transcludeFn(tab.$parent, function(contents) {
//         angular.forEach(contents, function(node) {
//           if (isTabHeading(node)) {
//             //Let tabHeadingTransclude know.
//             tab.headingElement = node;
//           } else {
//             elm.append(node);
//           }
//         });
//       });
//     }
//   };

// function isTabHeading(node) {
// 	return node.tagName && (
// 		node.hasAttribute('uib-tab-heading') ||
// 		node.hasAttribute('data-uib-tab-heading') ||
// 		node.hasAttribute('x-uib-tab-heading') ||
// 		node.tagName.toLowerCase() === 'uib-tab-heading' ||
// 		node.tagName.toLowerCase() === 'data-uib-tab-heading' ||
// 		node.tagName.toLowerCase() === 'x-uib-tab-heading' ||
// 		node.tagName.toLowerCase() === 'uib:tab-heading'
// 	);
// }
