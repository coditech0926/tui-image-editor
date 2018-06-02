import Range from './tools/range';
import Colorpicker from './tools/colorpicker';
import Submenu from './submenuBase';
import templateHtml from './template/submenu/text';
import {toInteger} from '../util';

/**
 * Crop ui class
 * @class
 */
export default class Text extends Submenu {
    constructor(subMenuElement, {iconStyle}) {
        super(subMenuElement, {
            name: 'text',
            iconStyle,
            templateHtml
        });
        this.effect = {
            bold: false,
            italic: false,
            underline: false
        };
        this.align = 'left';
        this._el = {
            textEffectButton: this.selector('#text-effect-button'),
            textAlignButton: this.selector('#text-align-button'),
            textColorpicker: new Colorpicker(this.selector('#text-color'), '#ffbb3b'),
            textRange: new Range(this.selector('#text-range'), {
                min: 10,
                max: 100,
                value: 50
            }),
            textRangeValue: this.selector('#text-range-value')
        };
    }

    /**
     * Add event for text
     * @param {Object} actions - actions for text
     *   @param {Function} actions.changeTextStyle - change text style
     */
    addEvent(actions) {
        this.actions = actions;
        this._el.textEffectButton.addEventListener('click', this._setTextEffectHandler.bind(this));
        this._el.textAlignButton.addEventListener('click', this._setTextAlignHandler.bind(this));
        this._el.textRange.on('change', this._changeTextRnageHandler.bind(this));
        this._el.textRangeValue.value = this._el.textRange.value;
        this._el.textColorpicker.on('change', this._changeColorHandler.bind(this));
    }

    /**
     * Get text color
     * @returns {string} - text color
     */
    get textColor() {
        return this._el.textColorpicker.color;
    }

    /**
     * Get text size
     * @returns {string} - text size
     */
    get fontSize() {
        return this._el.textRange.value;
    }

    /**
     * Set text size
     * @param {Number} value - text size
     */
    set fontSize(value) {
        this._el.textRange.value = value;
        this._el.textRangeValue.value = value;
    }

    /**
     * text effect set handler
     * @param {object} event - add button event object
     */
    _setTextEffectHandler(event) {
        const button = event.target.closest('.button');
        const [styleType] = button.className.match(/(bold|italic|underline)/);
        const styleObj = {
            'bold': {fontWeight: 'bold'},
            'italic': {fontStyle: 'italic'},
            'underline': {textDecoration: 'underline'}
        }[styleType];

        this.effect[styleType] = !this.effect[styleType];
        button.classList.toggle('active');

        this.actions.changeTextStyle(styleObj);
    }

    /**
     * text effect set handler
     * @param {object} event - add button event object
     */
    _setTextAlignHandler(event) {
        const button = event.target.closest('.button');
        if (button) {
            const styleType = this.getButtonType(button, ['left', 'center', 'right']);

            event.currentTarget.classList.remove(this.align);
            if (this.align !== styleType) {
                event.currentTarget.classList.add(styleType);
            }
            this.actions.changeTextStyle({textAlign: styleType});

            this.align = styleType;
        }
    }

    /**
     * text align set handler
     * @param {number} value - range value
     */
    _changeTextRnageHandler(value) {
        value = toInteger(value);
        this._el.textRangeValue.value = value;

        this.actions.changeTextStyle({
            fontSize: toInteger(value)
        });
    }

    /**
     * change color handler
     * @param {string} color - change color string
     */
    _changeColorHandler(color) {
        color = color || 'transparent';
        this.actions.changeTextStyle({
            'fill': color
        });
    }
}
