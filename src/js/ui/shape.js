import Colorpicker from './tools/colorpicker';
import Range from './tools/range';
import Submenu from './submenuBase';
import templateHtml from './template/submenu/shape';
import {toInteger} from '../util';
import {defaultShapeStrokeValus} from '../consts';

const SHAPE_DEFAULT_OPTION = {
    stroke: '#ffbb3b',
    fill: '',
    strokeWidth: 3
};

/**
 * Shape ui class
 * @class
 * @ignore
 */
class Shape extends Submenu {
    constructor(subMenuElement, {iconStyle, menuBarPosition}) {
        super(subMenuElement, {
            name: 'shape',
            iconStyle,
            menuBarPosition,
            templateHtml
        });
        this.type = null;
        this.options = SHAPE_DEFAULT_OPTION;

        this._els = {
            shapeSelectButton: this.selector('#tie-shape-button'),
            shapeColorButton: this.selector('#tie-shape-color-button'),
            strokeRange: new Range(this.selector('#tie-stroke-range'), defaultShapeStrokeValus),
            strokeRangeValue: this.selector('#tie-stroke-range-value'),
            fillColorpicker: new Colorpicker(this.selector('#tie-color-fill'), '', this.toggleDirection),
            strokeColorpicker: new Colorpicker(this.selector('#tie-color-stroke'), '#ffbb3b', this.toggleDirection)
        };

        this.colorPickerControls.push(this._els.fillColorpicker);
        this.colorPickerControls.push(this._els.strokeColorpicker);
    }

    /**
     * Add event for shape
     * @param {Object} actions - actions for shape
     *   @param {Function} actions.changeShape - change shape mode
     *   @param {Function} actions.setDrawingShape - set dreawing shape
     */
    addEvent(actions) {
        this.actions = actions;

        this._els.shapeSelectButton.addEventListener('click', this._changeShapeHandler.bind(this));
        this._els.strokeRange.on('change', this._changeStrokeRangeHandler.bind(this));
        this._els.fillColorpicker.on('change', this._changeFillColorHandler.bind(this));
        this._els.strokeColorpicker.on('change', this._changeStrokeColorHandler.bind(this));
        this._els.fillColorpicker.on('changeShow', this.colorPickerChangeShow.bind(this));
        this._els.strokeColorpicker.on('changeShow', this.colorPickerChangeShow.bind(this));
        this._els.strokeRangeValue.value = this._els.strokeRange.value;
        this._els.strokeRangeValue.setAttribute('readonly', true);
    }

    /**
     * Set Shape status
     * @param {Object} options - options of shape status
     *   @param {string} strokeWidth - stroke width
     *   @param {string} strokeColor - stroke color
     *   @param {string} fillColor - fill color
     */
    setShapeStatus({strokeWidth, strokeColor, fillColor}) {
        this._els.strokeRange.value = strokeWidth;
        this._els.strokeRange.trigger('change');

        this._els.strokeColorpicker.color = strokeColor;
        this._els.fillColorpicker.color = fillColor;
        this.options.stroke = strokeColor;
        this.options.fill = fillColor;
        this.options.strokeWidth = strokeWidth;
    }

    /**
     * Executed when the menu starts.
     */
    changeStartMode() {
        this.actions.stopDrawingMode();
    }

    /**
     * Returns the menu to its default state.
     */
    changeStandbyMode() {
        this.type = null;
        this.actions.changeSelectableAll(true);
        this._els.shapeSelectButton.classList.remove('circle');
        this._els.shapeSelectButton.classList.remove('triangle');
        this._els.shapeSelectButton.classList.remove('rect');
    }

    /**
     * set range stroke max value
     * @param {number} maxValue - expect max value for change
     */
    setMaxStrokeValue(maxValue) {
        let strokeMaxValue = maxValue;
        if (strokeMaxValue <= 0) {
            strokeMaxValue = defaultShapeStrokeValus.max;
        }
        this._els.strokeRange.max = strokeMaxValue;
    }

    /**
     * Set stroke value
     * @param {number} value - expect value for strokeRange change
     */
    setStrokeValue(value) {
        this._els.strokeRange.value = value;
        this._els.strokeRange.trigger('change');
    }

    /**
     * Get stroke value
     * @returns {number} - stroke range value
     */
    getStrokeValue() {
        return this._els.strokeRange.value;
    }

    /**
     * Change icon color
     * @param {object} event - add button event object
     * @private
     */
    _changeShapeHandler(event) {
        const button = event.target.closest('.tui-image-editor-button');
        if (button) {
            this.actions.stopDrawingMode();
            this.actions.discardSelection();
            const shapeType = this.getButtonType(button, ['circle', 'triangle', 'rect']);

            if (this.type === shapeType) {
                this.changeStandbyMode();

                return;
            }
            this.changeStandbyMode();
            this.type = shapeType;
            event.currentTarget.classList.add(shapeType);
            this.actions.changeSelectableAll(false);
            this.actions.modeChange('shape');
        }
    }

    /**
     * Change stroke range
     * @param {number} value - stroke range value
     * @private
     */
    _changeStrokeRangeHandler(value) {
        this.options.strokeWidth = toInteger(value);
        this._els.strokeRangeValue.value = toInteger(value);

        this.actions.changeShape({
            strokeWidth: value
        });

        this.actions.setDrawingShape(this.type, this.options);
    }

    /**
     * Change shape color
     * @param {string} color - fill color
     * @private
     */
    _changeFillColorHandler(color) {
        color = color || 'transparent';
        this.options.fill = color;
        this.actions.changeShape({
            fill: color
        });
    }

    /**
     * Change shape stroke color
     * @param {string} color - fill color
     * @private
     */
    _changeStrokeColorHandler(color) {
        color = color || 'transparent';
        this.options.stroke = color;
        this.actions.changeShape({
            stroke: color
        });
    }
}

export default Shape;
