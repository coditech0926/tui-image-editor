import Range from './tools/range';
import Submenu from './submenuBase';
import templateHtml from './template/submenu/rotate';
import {toInteger} from '../util';
import {defaultRotateRangeValus} from '../consts';

const CLOCKWISE = 30;
const COUNTERCLOCKWISE = -30;

/**
 * Rotate ui class
 * @class
 * @ignore
 */
class Rotate extends Submenu {
    constructor(subMenuElement, {iconStyle, menuBarPosition}) {
        super(subMenuElement, {
            name: 'rotate',
            iconStyle,
            menuBarPosition,
            templateHtml
        });

        this._els = {
            rotateButton: this.selector('#tie-retate-button'),
            rotateRange: new Range(this.selector('#tie-rotate-range'), defaultRotateRangeValus),
            rotateRangeValue: this.selector('#tie-ratate-range-value')
        };
    }

    /**
     * Add event for rotate
     * @param {Object} actions - actions for crop
     *   @param {Function} actions.rotate - rotate action
     *   @param {Function} actions.setAngle - set angle action
     */
    addEvent(actions) {
        // {rotate, setAngle}
        this.actions = actions;
        this._els.rotateButton.addEventListener('click', this._changeRotateForButton.bind(this));
        this._els.rotateRange.on('change', this._changeRotateForRange.bind(this));
        this._els.rotateRangeValue.setAttribute('readonly', true);
    }

    /**
     * Change rotate for range
     * @param {number} value - angle value
     * @private
     */
    _changeRotateForRange(value) {
        const angle = toInteger(value);
        this._els.rotateRangeValue.value = angle;
        this.actions.setAngle(angle);
    }

    /**
     * Change rotate for button
     * @param {object} event - add button event object
     * @private
     */
    _changeRotateForButton(event) {
        const button = event.target.closest('.tui-image-editor-button');
        if (button) {
            const rotateType = this.getButtonType(button, ['counterclockwise', 'clockwise']);
            const rotateAngle = {
                clockwise: CLOCKWISE,
                counterclockwise: COUNTERCLOCKWISE
            }[rotateType];
            this.actions.rotate(rotateAngle);
        }
    }
}

export default Rotate;
