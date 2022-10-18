/**
 * Dropdown is a simple directive which will toggle a dropdown menu on click or programmatically.
 *
 * see https://angular-ui.github.io/bootstrap/#/dropdown
 *  
 * This directive is composed by three parts:
 *
 * uib-dropdown which transforms a node into a dropdown.
 * uib-dropdown-toggle which allows the dropdown to be toggled via click. This directive is optional.
 * uib-dropdown-menu which transforms a node into the popup menu.
 * 
 * Each of these parts need to be used as attribute directives.
 * 
 * == uib-dropdown settings
 * 
 * auto-close (Default: always) - Controls the behavior of the menu when clicked.
 * 	always - Automatically closes the dropdown when any of its elements is clicked.
 * 	disabled - Disables the auto close. You can control it manually with is-open. It still gets closed if the toggle is clicked, esc is pressed or another dropdown is open.
 * 	outsideClick - Closes the dropdown automatically only when the user clicks any element outside the dropdown.
 * 
 * append-to  (Default: null) - Appends the inner dropdown-menu to an arbitrary DOM element.
 * 
 * append-to-body  (Default: false) - Appends the inner dropdown-menu to the body element.
 * 
 * is-open   (Default: false) - Defines whether or not the dropdown-menu is open. The uib-dropdown-toggle will toggle this attribute on click.
 * 
 * keyboard-nav:  (Default: false) - Enables navigation of dropdown list elements with the arrow keys.
 * 
 * on-toggle(open)  - An optional expression called when the dropdown menu is opened or closed.
 * 
 * == uib-dropdown-menu settings
 * 
 * //TODO use: as-element="compose" view='./myDropdownMenu.html' to specify a template for the dropdown menu.
 * 
 * == Additional settings uibDropdownConfig
 * 
 * appendToOpenClass (Default: uib-dropdown-open) - Class to apply when the dropdown is open and appended to a different DOM element.
 * openClass (Default: open) - Class to apply when the dropdown is open.
 * 
 * Known issues
 *
 * For usage with ngTouch, it is recommended to use the programmatic is-open trigger with ng-click - this is due to ngTouch decorating ng-click to prevent propagation of the event.
 */
import { autoinject, bindable } from 'aurelia-framework';
//import { Animator } from 'aurelia-templating';
//import {CssAnimator} from 'aurelia-animator-css';  
//import { View } from 'aurelia-templating';

import { Position } from './position';

const appendToOpenClass = 'uib-dropdown-open',
	openClass = 'open';

export class DropdownCustomAttribute {
	
	@bindable isOpen: boolean = false;
	
	// constructor(private element: Element) {
	// }
}

@autoinject
export class DropdownToggleCustomAttribute {

	@bindable disabled: boolean = false;
	@bindable isOpen: boolean = false;

	@bindable appendToBody: boolean = true;
	@bindable keyboardNav: boolean = false;
	@bindable autoClose: 'always' | 'outsideClick' | 'disabled' = 'always';
	@bindable onToggle: Function = () => { };

	get toggleElement() { return <HTMLElement>this.element; }
	get dropdownElement() { return this.dropdownMenu; }

	private appendTo: HTMLElement;
	private dropdownMenu: HTMLElement;
	private selectedOption: number;

	private dropdownService = new DropdownService();

	constructor(private element: Element,
		//private animator: Animator,
		private $position: Position
		) {
		element.classList.add('dropdown-toggle');
		this.appendTo = null;
		//TODO find parent element with drop-down custom attribute ($parent ?)
	}

	// created(owningView: View, myView: View) {
	// }

	// bind(bindingContext: Object, overrideContext: Object) {
	// }

	//   init() {

	//  if ('undefined' !== typeof (this.dropdownAppendTo)) {
	//    var appendToEl = $parse(this.dropdownAppendTo)(this);
	//    if (appendToEl) {
	//      this.appendTo = angular.element(appendToEl);
	//    }
	//  }

	//  if (appendToBody && !appendTo) {
	//    this.appendTo = document.body;
	//  }

	//  if (this.appendTo && this.dropdownMenu) {
	//    this.appendTo.appendChild(this.dropdownMenu);
	//    this.element.on('$destroy', () => this.dropdownMenu.remove());
	//  }
	//   };

	attached() {
		this.element.addEventListener('click', this.toggleDropdown);

		// WAI-ARIA
		this.element.setAttribute('aria-haspopup', 'true');
		this.element.setAttribute('aria-expanded', 'false');

	}

	private toggleDropdown = this._toggleDropdown.bind(this);
	private _toggleDropdown(event) {
		event.preventDefault();

		if (!this.element.classList.contains('disabled') && !this.disabled) {
			this.toggle();
		}
	}

	disabledChanged(disabled: string) {
		this.disabled = parseBoolean(disabled);
	}

	isOpenChanged(isOpen: boolean, wasOpen: boolean) {
		this.isOpen = isOpen = parseBoolean(isOpen);
		wasOpen = parseBoolean(wasOpen);
		this.element.setAttribute('aria-expanded', this.isOpen ? 'true' : 'false');

		if (this.appendTo && this.dropdownMenu) {
			var pos = this.$position.positionElements(<HTMLElement>this.element, this.dropdownMenu, 'bottom-left', true),
				css,
				rightalign,
				scrollbarPadding,
				scrollbarWidth = 0;

			css = {
				top: pos.top + 'px',
				display: isOpen ? 'block' : 'none'
			};

			rightalign = this.dropdownMenu.classList.contains('dropdown-menu-right');
			if (!rightalign) {
				css.left = pos.left + 'px';
				css.right = 'auto';
			} else {
				css.left = 'auto';
				scrollbarPadding = this.$position.scrollbarPadding(this.appendTo);

				if (scrollbarPadding.heightOverflow && scrollbarPadding.scrollbarWidth) {
					scrollbarWidth = scrollbarPadding.scrollbarWidth;
				}

				css.right = window.innerWidth - scrollbarWidth -
					(pos.left + (<HTMLElement>this.element).offsetWidth) + 'px';
			}

			// Need to adjust our positioning to be relative to the appendTo container
			// if it's not the body element
			if (!this.appendToBody) {
				var appendOffset = this.$position.offset(this.appendTo);

				css.top = pos.top - appendOffset.top + 'px';

				if (!rightalign) {
					css.left = pos.left - appendOffset.left + 'px';
				} else {
					css.right = window.innerWidth -
						(pos.left - appendOffset.left + (<HTMLElement>this.element).offsetWidth) + 'px';
				}
			}

			setCss(this.dropdownMenu, css);
		}

		var openContainer = this.appendTo ? this.appendTo : this.element.parentElement;	//TODO parentElement is element with dropdown attribute
		var hasOpenClass = openContainer.classList.contains(this.appendTo ? appendToOpenClass : openClass);

		if (hasOpenClass === !isOpen) {
			openContainer.classList[isOpen ? 'add' : 'remove'](this.appendTo ? appendToOpenClass : openClass);	//TODO animation
			//this.animator[isOpen ? 'addClass' : 'removeClass'](openContainer, this.appendTo ? appendToOpenClass : openClass).then(() => {
				if ('undefined' !== typeof isOpen && isOpen !== wasOpen) {
					this.onToggle(this, { open: !!isOpen });
				}
			//});
		}

		if (isOpen) {
			if (this.dropdownMenu) {
				this.dropdownMenu.addEventListener('keydown', this.dropdownService.keybindFilter);
			}
			this.focusToggleElement();
			this.dropdownService.open(this, this.element);
		} else {
			this.dropdownService.close(this, this.element);
			this.selectedOption = null;
		}

		// if (angular.isFunction(setIsOpen)) {
		// 	setIsOpen($this, isOpen);
		// }
	}

	toggle(open?: boolean): boolean {
		this.isOpen = arguments.length ? !!open : !this.isOpen;
		//  if ('function' === typeof this.setIsOpen) {
		//    this.setIsOpen(this, this.isOpen);
		//  }

		return this.isOpen;
	}

	focusDropdownEntry(keyCode: number) {
		var elems: NodeListOf<HTMLElement> = this.dropdownMenu ? //If append to body is used.
			<NodeListOf<HTMLElement>>this.dropdownMenu.querySelectorAll('a') :
			<NodeListOf<HTMLElement>>this.element.querySelectorAll('ul[0] a');

		switch (keyCode) {
			case 40: {
				if ('number' !== typeof this.selectedOption) {
					this.selectedOption = 0;
				} else {
					this.selectedOption = this.selectedOption === elems.length - 1 
						? this.selectedOption 
						: this.selectedOption + 1;
				}
				break;
			}
			case 38: {
				if ('number' !== typeof this.selectedOption) {
					this.selectedOption = elems.length - 1;
				} else {
					this.selectedOption = this.selectedOption === 0 
						? 0 
						: this.selectedOption - 1;
				}
				break;
			}
		}
		elems[this.selectedOption].focus();
	}

	focusToggleElement() {
		if (this.toggleElement) {
			this.toggleElement.focus();
		}
	};

	detach() {
		this.element.removeEventListener('click', this.toggleDropdown);
	}

}

class DropdownService {

	private openScope: DropdownToggleCustomAttribute = null;

	open(dropdownScope: DropdownToggleCustomAttribute, element: Element) {
		if (!this.openScope) {
			//differ the attachement to skip current click event
			setTimeout( () => document.addEventListener('click', this.closeDropdown), 0);			
		}

		if (this.openScope && this.openScope !== dropdownScope) {
			this.openScope.isOpen = false;
		}

		this.openScope = dropdownScope;
	}

	close(dropdownScope: DropdownToggleCustomAttribute, element: Element) {
		if (this.openScope === dropdownScope) {
			document.removeEventListener('click', this.closeDropdown);
			this.openScope = null;
			var dropdownMenu = dropdownScope.dropdownElement;
			if (dropdownMenu) {
				dropdownMenu.removeEventListener('keydown', this.keybindFilter);
			}
		}
	}

	closeDropdown = this._closeDropdown.bind(this);
	private _closeDropdown(evt?: MouseEvent) {
		// This method may still be called during the same mouse event that
		// unbound this event handler. So check openScope before proceeding.
		if (!this.openScope) { return; }

		if (evt && this.openScope.autoClose === 'disabled') { return; }

		if (evt && evt.which === 3) { return; }

		var toggleElement = this.openScope.toggleElement;
		if (evt && toggleElement && toggleElement === evt.target) {
			return;
		}

		var dropdownElement = this.openScope.dropdownElement;
		if (evt && this.openScope.autoClose === 'outsideClick' &&
			dropdownElement && dropdownElement === evt.target) {
			return;
		}

		this.openScope.isOpen = false;
		this.openScope.focusToggleElement();
	}

	keybindFilter = this._keybindFilter.bind(this);
	private _keybindFilter(evt) {
		if (evt.which === 27) {
			evt.stopPropagation();
			this.openScope.focusToggleElement();
			this.closeDropdown();
		} else if (this.openScope.keyboardNav && [38, 40].indexOf(evt.which) !== -1 && this.openScope.isOpen) {
			evt.preventDefault();
			evt.stopPropagation();
			this.openScope.focusDropdownEntry(evt.which);
		}
	}
}

function parseBoolean(b) {
	return 'boolean' === typeof b ? b : /^\s*(true|yes|1)\s*$/i.test(b);
}

function setCss(elem: HTMLElement, styles) {
	for (let s in styles) {
		elem.style[s] = styles[s];
	}
}