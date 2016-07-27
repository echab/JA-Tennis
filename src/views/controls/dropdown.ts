import { autoinject, bindable } from 'aurelia-framework';

import { Position } from './position';

const appendToOpenClass = 'uib-dropdown-open',
	openClass = 'open';

class DropdownService {

	private openScope: DropdownToggleCustomAttribute = null;

	open(dropdownScope: DropdownToggleCustomAttribute, element: Element) {
		if (!this.openScope) {
			document.addEventListener('click', this.closeDropdown.bind(this));
		}

		if (this.openScope && this.openScope !== dropdownScope) {
			this.openScope.isOpen = false;
		}

		this.openScope = dropdownScope;
	}

	close(dropdownScope: DropdownToggleCustomAttribute, element: Element) {
		if (this.openScope === dropdownScope) {
			this.openScope = null;
			document.removeEventListener('click', this.closeDropdown.bind(this));
			var dropdownMenu = dropdownScope.dropdownElement;
			if (dropdownMenu) {
				dropdownMenu.removeEventListener('keydown', this.keybindFilter.bind(this));
			}
		}
	}

	private closeDropdown(evt?: MouseEvent) {
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

		//  if (!$rootScope.$$phase) {
		//    openScope.$apply();
		//  }
	}

	keybindFilter(evt) {
		if (evt.which === 27) {
			evt.stopPropagation();
			this.openScope.focusToggleElement();
			this.closeDropdown();
		} else if (this.openScope.keynavEnabled && [38, 40].indexOf(evt.which) !== -1 && this.openScope.isOpen) {
			evt.preventDefault();
			evt.stopPropagation();
			this.openScope.focusDropdownEntry(evt.which);
		}
	}
}

@autoinject
export class DropdownToggleCustomAttribute {

	@bindable disabled: boolean = false;
	@bindable isOpen: boolean = false;

	@bindable appendToBody: boolean = true;
	@bindable keynavEnabled: boolean = true;
	@bindable autoClose: 'always' | 'outsideClick' | 'disabled' = 'always';
	@bindable onToggle: Function = () => { };

	private appendTo: HTMLElement;
	public toggleElement: HTMLElement;
	private dropdownMenu: HTMLElement;
	private selectedOption: number;

	constructor(private element: Element,
		private $position: Position,
		private dropdownService: DropdownService) {
		element.classList.add('dropdown-toggle');

		this.toggleElement = <HTMLElement>element;
		this.appendTo = null;
	}

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
	//    this.element.on('$destroy', function handleDestroyEvent() {
	//      this.dropdownMenu.remove();
	//    });
	//  }
	//   };

	get dropdownElement() {
		return this.dropdownMenu;
	}

	attached() {
		this.element.addEventListener('click', this.toggleDropdown.bind(this));

		// WAI-ARIA
		this.element.setAttribute('aria-haspopup', 'true');
		this.element.setAttribute('aria-expanded', 'false');

	}

	private toggleDropdown(event) {
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
			var pos = this.$position.positionElements(this.element, this.dropdownMenu, 'bottom-left', true),
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

		var openContainer = this.appendTo ? this.appendTo : this.element.parentElement;	//TODO parentElement is element with dropdown class
		var hasOpenClass = openContainer.classList.contains(this.appendTo ? appendToOpenClass : openClass);

		if (hasOpenClass === !isOpen) {
			//$animate[isOpen ? 'addClass' : 'removeClass'](openContainer, this.appendTo ? appendToOpenClass : openClass).then(function() {	
			openContainer.classList[isOpen ? 'add' : 'remove'](this.appendTo ? appendToOpenClass : openClass);	//TODO animation
			if ('undefined' !== typeof isOpen && isOpen !== wasOpen) {
				this.onToggle(this, { open: !!isOpen });
			}
			//});
		}

		if (isOpen) {
			// if (this.dropdownMenuTemplateUrl) {
			//   $templateRequest(this.dropdownMenuTemplateUrl).then(function(tplContent) {
			//     templateScope = this.$new();
			//     $compile(tplContent.trim())(templateScope, function(dropdownElement) {
			//       var newEl = dropdownElement;
			//       this.dropdownMenu.replaceWith(newEl);
			//       this.dropdownMenu = newEl;
			//       this.dropdownMenu.on('keydown', uibDropdownService.keybindFilter);
			//     });
			//   });
			// } else {
			if (this.dropdownMenu) {
				this.dropdownMenu.addEventListener('keydown', this.dropdownService.keybindFilter.bind(this.dropdownService));
			}
			// }

			this.focusToggleElement();
			this.dropdownService.open(this, this.element);
		} else {
			this.dropdownService.close(this, this.element);
			// if (this.dropdownMenuTemplateUrl) {
			// 	if (templateScope) {
			// 		templateScope.$destroy();
			// 	}
			// 	var newEl = angular.element('<ul class="dropdown-menu"></ul>');
			// 	this.dropdownMenu.replaceWith(newEl);
			// 	this.dropdownMenu = newEl;
			// }

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
					this.selectedOption = this.selectedOption === elems.length - 1 ?
						this.selectedOption :
						this.selectedOption + 1;
				}
				break;
			}
			case 38: {
				if ('number' !== typeof this.selectedOption) {
					this.selectedOption = elems.length - 1;
				} else {
					this.selectedOption = this.selectedOption === 0 ?
						0 : this.selectedOption - 1;
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

function parseBoolean(b) {
	return 'boolean' === typeof b ? b : /^true|yes|1$/i.test(b);
}

function setCss(elem: HTMLElement, styles) {
	for (let s in styles) {
		elem.style[s] = styles[s];
	}
}