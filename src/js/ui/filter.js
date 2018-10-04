import snippet from 'tui-code-snippet';
import Colorpicker from './tools/colorpicker';
import Range from './tools/range';
import Submenu from './submenuBase';
import templateHtml from './template/submenu/filter';
import {toInteger, toCamelCase} from '../util';
import {defaultFilterRangeValus as FILTER_RANGE} from '../consts';

const PICKER_CONTROL_HEIGHT = '130px';
const BLEND_OPTIONS = ['add', 'diff', 'subtract', 'multiply', 'screen', 'lighten', 'darken'];
const FILTER_OPTIONS = [
    'grayscale',
    'invert',
    'sepia',
    'sepia2',
    'blur',
    'sharpen',
    'emboss',
    'remove-white',
    'gradient-transparency',
    'brightness',
    'noise',
    'pixelate',
    'color-filter',
    'tint',
    'multiply',
    'blend'
];

/**
 * Filter ui class
 * @class
 * @ignore
 */
class Filter extends Submenu {
    constructor(subMenuElement, {iconStyle, menuBarPosition}) {
        super(subMenuElement, {
            name: 'filter',
            iconStyle,
            menuBarPosition,
            templateHtml
        });

        this.selectBoxShow = false;

        this.checkedMap = {};
        this._makeControlElement();
    }

    /**
     * Add event for filter
     * @param {Object} actions - actions for crop
     *   @param {Function} actions.applyFilter - apply filter option
     */
    addEvent({applyFilter}) {
        const changeRangeValue = this._changeRangeValue.bind(this, applyFilter);

        snippet.forEach(FILTER_OPTIONS, filterName => {
            const filterCheckElement = this.selector(`#tie-${filterName}`);
            const filterNameCamelCase = toCamelCase(filterName);
            this.checkedMap[filterNameCamelCase] = filterCheckElement;

            filterCheckElement.addEventListener('change', () => changeRangeValue(filterNameCamelCase));
        });

        this._els.removewhiteThresholdRange.on('change', () => changeRangeValue('removeWhite'));
        this._els.removewhiteDistanceRange.on('change', () => changeRangeValue('removeWhite'));
        this._els.gradientTransparencyRange.on('change', () => changeRangeValue('gradientTransparency'));
        this._els.colorfilterThresholeRange.on('change', () => changeRangeValue('colorFilter'));
        this._els.pixelateRange.on('change', () => changeRangeValue('pixelate'));
        this._els.noiseRange.on('change', () => changeRangeValue('noise'));
        this._els.brightnessRange.on('change', () => changeRangeValue('brightness'));
        this._els.blendType.addEventListener('change', () => changeRangeValue('blend'));
        this._els.filterBlendColor.on('change', () => changeRangeValue('blend'));
        this._els.filterMultiplyColor.on('change', () => changeRangeValue('multiply'));
        this._els.tintOpacity.on('change', () => changeRangeValue('tint'));
        this._els.filterTintColor.on('change', () => changeRangeValue('tint'));
        this._els.blendType.addEventListener('click', event => event.stopPropagation());
        this._els.filterMultiplyColor.on('changeShow', this.colorPickerChangeShow.bind(this));
        this._els.filterTintColor.on('changeShow', this.colorPickerChangeShow.bind(this));
        this._els.filterBlendColor.on('changeShow', this.colorPickerChangeShow.bind(this));
    }

    /**
     * Add event for filter
     * @param {Function} applyFilter - actions for firter
     * @param {string} filterName - filter name
     */
    _changeRangeValue(applyFilter, filterName) {
        const apply = this.checkedMap[filterName].checked;
        const type = filterName;

        const checkboxGroup = this.checkedMap[filterName].closest('.tui-image-editor-checkbox-group');
        if (checkboxGroup) {
            if (apply) {
                checkboxGroup.classList.remove('tui-image-editor-disabled');
            } else {
                checkboxGroup.classList.add('tui-image-editor-disabled');
            }
        }
        applyFilter(apply, type, this._getFilterOption(type));
    }

    /**
     * Get filter option
     * @param {String} type - filter type
     * @returns {Object} filter option object
     * @private
     */
    _getFilterOption(type) { // eslint-disable-line
        const option = {};
        switch (type) {
            case 'removeWhite':
                option.threshold = toInteger(this._els.removewhiteThresholdRange.value);
                option.distance = toInteger(this._els.removewhiteDistanceRange.value);
                break;
            case 'gradientTransparency':
                option.threshold = toInteger(this._els.gradientTransparencyRange.value);
                break;
            case 'colorFilter':
                option.color = '#FFFFFF';
                option.threshold = this._els.colorfilterThresholeRange.value;
                break;
            case 'pixelate':
                option.blocksize = toInteger(this._els.pixelateRange.value);
                break;
            case 'noise':
                option.noise = toInteger(this._els.noiseRange.value);
                break;
            case 'brightness':
                option.brightness = toInteger(this._els.brightnessRange.value);
                break;
            case 'blend':
                option.color = this._els.filterBlendColor.color;
                option.mode = this._els.blendType.value;
                break;
            case 'multiply':
                option.color = this._els.filterMultiplyColor.color;
                break;
            case 'tint':
                option.color = this._els.filterTintColor.color;
                option.opacity = this._els.tintOpacity.value;
                break;
            default:
                break;
        }

        return option;
    }

    /**
     * Make submenu range and colorpicker control
     * @private
     */
    _makeControlElement() {
        const {selector} = this;
        this._els = {
            removewhiteThresholdRange: new Range(
                selector('#tie-removewhite-threshold-range'),
                FILTER_RANGE.removewhiteThresholdRange
            ),
            removewhiteDistanceRange: new Range(
                selector('#tie-removewhite-distance-range'),
                FILTER_RANGE.removewhiteDistanceRange
            ),
            gradientTransparencyRange: new Range(
                selector('#tie-gradient-transparency-range'),
                FILTER_RANGE.gradientTransparencyRange
            ),
            brightnessRange: new Range(
                selector('#tie-brightness-range'),
                FILTER_RANGE.brightnessRange
            ),
            noiseRange: new Range(
                selector('#tie-noise-range'),
                FILTER_RANGE.noiseRange
            ),
            pixelateRange: new Range(
                selector('#tie-pixelate-range'),
                FILTER_RANGE.pixelateRange
            ),
            colorfilterThresholeRange: new Range(
                selector('#tie-colorfilter-threshole-range'),
                FILTER_RANGE.colorfilterThresholeRange
            ),
            filterTintColor: new Colorpicker(selector('#tie-filter-tint-color'), '#03bd9e', this.toggleDirection),
            filterMultiplyColor: new Colorpicker(selector('#tie-filter-multiply-color'), '#515ce6', this.toggleDirection),
            filterBlendColor: new Colorpicker(selector('#tie-filter-blend-color'), '#ffbb3b', this.toggleDirection)
        };

        this._els.tintOpacity = this._pickerWithRange(this._els.filterTintColor.pickerControl);
        this._els.blendType = this._pickerWithSelectbox(this._els.filterBlendColor.pickerControl);

        this.colorPickerControls.push(this._els.filterTintColor);
        this.colorPickerControls.push(this._els.filterMultiplyColor);
        this.colorPickerControls.push(this._els.filterBlendColor);
    }

    /**
     * Make submenu control for picker & range mixin
     * @param {HTMLElement} pickerControl - pickerControl dom element
     * @returns {Range}
     * @private
     */
    _pickerWithRange(pickerControl) {
        const rangeWrap = document.createElement('div');
        const rangelabel = document.createElement('label');
        const range = document.createElement('div');

        range.id = 'tie-filter-tint-opacity';
        rangelabel.innerHTML = 'Opacity';
        rangeWrap.appendChild(rangelabel);
        rangeWrap.appendChild(range);
        pickerControl.appendChild(rangeWrap);
        pickerControl.style.height = PICKER_CONTROL_HEIGHT;

        return new Range(range, FILTER_RANGE.tintOpacityRange);
    }

    /**
     * Make submenu control for picker & selectbox
     * @param {HTMLElement} pickerControl - pickerControl dom element
     * @returns {HTMLElement}
     * @private
     */
    _pickerWithSelectbox(pickerControl) {
        const selectlistWrap = document.createElement('div');
        const selectlist = document.createElement('select');
        const optionlist = document.createElement('ul');

        selectlistWrap.className = 'tui-image-editor-selectlist-wrap';
        optionlist.className = 'tui-image-editor-selectlist';

        selectlistWrap.appendChild(selectlist);
        selectlistWrap.appendChild(optionlist);

        this._makeSelectOptionList(selectlist);

        pickerControl.appendChild(selectlistWrap);
        pickerControl.style.height = PICKER_CONTROL_HEIGHT;

        this._drawSelectOptionList(selectlist, optionlist);
        this._pickerWithSelectboxForAddEvent(selectlist, optionlist);

        return selectlist;
    }

    /**
     * Make selectbox option list custom style
     * @param {HTMLElement} selectlist - selectbox element
     * @param {HTMLElement} optionlist - custom option list item element
     * @private
     */
    _drawSelectOptionList(selectlist, optionlist) {
        const options = selectlist.querySelectorAll('option');
        snippet.forEach(options, option => {
            const optionElement = document.createElement('li');
            optionElement.innerHTML = option.innerHTML;
            optionElement.setAttribute('data-item', option.value);
            optionlist.appendChild(optionElement);
        });
    }

    /**
     * custome selectbox custom event
     * @param {HTMLElement} selectlist - selectbox element
     * @param {HTMLElement} optionlist - custom option list item element
     * @private
     */
    _pickerWithSelectboxForAddEvent(selectlist, optionlist) {
        optionlist.addEventListener('click', event => {
            const optionValue = event.target.getAttribute('data-item');
            const fireEvent = document.createEvent('HTMLEvents');

            selectlist.querySelector(`[value="${optionValue}"]`).selected = true;
            fireEvent.initEvent('change', true, true);

            selectlist.dispatchEvent(fireEvent);

            this.selectBoxShow = false;
            optionlist.style.display = 'none';
        });

        selectlist.addEventListener('mousedown', event => {
            event.preventDefault();
            this.selectBoxShow = !this.selectBoxShow;
            optionlist.style.display = this.selectBoxShow ? 'block' : 'none';
            optionlist.setAttribute('data-selectitem', selectlist.value);
            optionlist.querySelector(`[data-item='${selectlist.value}']`).classList.add('active');
        });
    }

    /**
     * Make option list for select control
     * @param {HTMLElement} selectlist - blend option select list element
     * @private
     */
    _makeSelectOptionList(selectlist) {
        snippet.forEach(BLEND_OPTIONS, option => {
            const selectOption = document.createElement('option');
            selectOption.setAttribute('value', option);
            selectOption.innerHTML = option.replace(/^[a-z]/, $0 => $0.toUpperCase());
            selectlist.appendChild(selectOption);
        });
    }
}

export default Filter;
