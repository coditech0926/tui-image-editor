import util from '../util';
import Colorpicker from './tools/colorpicker';
import Range from './tools/range';
import Submenu from './submenuBase';
import templateHtml from './template/submenu/draw';

/**
 * Draw ui class
 * @class
 */
export default class Draw extends Submenu {
    constructor(subMenuElement, {iconStyle}) {
        super(subMenuElement, {
            name: 'draw',
            iconStyle,
            templateHtml
        });

        this._el = {
            lineSelectButton: this.selector('#draw-line-select-button'),
            drawColorpicker: new Colorpicker(this.selector('#draw-color')),
            drawRange: new Range(this.selector('#draw-range'), {
                min: 5,
                max: 30,
                value: 12
            }),
            drawRangeValue: this.selector('#draw-range-value')
        };

        this.type = 'line';
        this.color = this._el.drawColorpicker.getColor();
        this.width = this._el.drawRange.getValue();
    }

    /**
     * Add event for draw
     * @param {Object} actions - actions for crop
     *   @param {Function} actions.setDrawMode - set draw mode
     */
    addEvent(actions) {
        this.actions = actions;

        this._el.lineSelectButton.addEventListener('click', this._changeDrawType.bind(this));
        this._el.drawColorpicker.on('change', this._changeDrawColor.bind(this));
        this._el.drawRange.on('change', this._changeDrawRange.bind(this));
        this._el.drawRangeValue.value = this._el.drawRange.getValue();
    }

    /**
     * set draw mode - action runner
     */
    setDrawMode() {
        this.actions.setDrawMode(this.type, {
            width: this.width,
            color: util.getRgb(this.color, 0.7)
        });
    }

    /**
     * Change draw type event
     * @param {object} event - line select event
     */
    _changeDrawType(event) {
        const button = event.target.closest('.button');
        if (button) {
            const lineType = this.getButtonType(button, ['free', 'line']);
            this.changeClass(this._el.lineSelectButton, this.type, lineType);

            this.type = lineType;
            this.setDrawMode();
        }
    }

    /**
     * Change drawing color
     * @param {string} color - select drawing color
     */
    _changeDrawColor(color) {
        color = color || 'transparent';
        this.color = color;
        this.setDrawMode();
    }

    /**
     * Change drawing Range
     * @param {number} value - select drawing range
     */
    _changeDrawRange(value) {
        value = util.toInteger(value);
        this._el.drawRangeValue.value = value;
        this.width = value;
        this.setDrawMode();
    }
}
