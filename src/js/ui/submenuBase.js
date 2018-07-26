/**
 * Submenu Base Class
 * @class
 * @ignore
 */
class Submenu {
    constructor(subMenuElement, {name, iconStyle, menuBarPosition, templateHtml}) {
        this.selector = str => subMenuElement.querySelector(str);
        this.menuBarPosition = menuBarPosition;
        this.toggleDirection = menuBarPosition === 'top' ? 'down' : 'up';
        this.colorPickerControls = [];
        this._makeSubMenuElement(subMenuElement, {
            name,
            iconStyle,
            templateHtml
        });
    }

    colorPickerChangeShow(occurredControl) {
        this.colorPickerControls.forEach(pickerControl => {
            if (occurredControl !== pickerControl) {
                pickerControl.hide();
            }
        });
    }

    /**
     * Get butten type
     * @param {HTMLElement} button - event target element
     * @param {array} buttonNames - Array of button names
     * @returns {string} - button type
     */
    getButtonType(button, buttonNames) {
        return button.className.match(RegExp(`(${buttonNames.join('|')})`))[0];
    }

    /**
     * Get butten type
     * @param {HTMLElement} target - event target element
     * @param {string} removeClass - remove class name
     * @param {string} addClass - add class name
     */
    changeClass(target, removeClass, addClass) {
        target.classList.remove(removeClass);
        target.classList.add(addClass);
    }

    /**
     * Interface method whose implementation is optional.
     * Returns the menu to its default state.
     */
    changeStandbyMode() {}

    /**
     * Interface method whose implementation is optional.
     * Executed when the menu starts.
     */
    changeStartMode() {}

    /**
     * Make submenu dom element
     * @param {HTMLElement} subMenuElement - subment dom element
     * @param {Object} iconStyle -  icon style
     * @private
     */
    _makeSubMenuElement(subMenuElement, {name, iconStyle, templateHtml}) {
        const iconSubMenu = document.createElement('div');
        iconSubMenu.className = `tui-image-editor-menu-${name}`;
        iconSubMenu.innerHTML = templateHtml({iconStyle});

        subMenuElement.appendChild(iconSubMenu);
    }
}

export default Submenu;
