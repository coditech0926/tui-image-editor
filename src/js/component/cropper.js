/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Image crop module (start cropping, end cropping)
 */
import Component from '../interface/component';
import Cropzone from '../extension/cropzone';
import consts from '../consts';
import util from '../util';

const MOUSE_MOVE_THRESHOLD = 10;
const abs = Math.abs;
const clamp = util.clamp;
const keyCodes = consts.keyCodes;
const bind = tui.util.bind;

/**
 * Cropper components
 * @param {Component} parent - parent component
 * @extends {Component}
 * @class Cropper
 * @ignore
 */
class Cropper extends Component {
    constructor(parent) {
        super();

        this.setParent(parent);

        /**
         * Component name
         * @type {string}
         */
        this.name = consts.componentNames.CROPPER;

        /**
         * Cropzone
         * @type {Cropzone}
         * @private
         */
        this._cropzone = null;

        /**
         * StartX of Cropzone
         * @type {number}
         * @private
         */
        this._startX = null;

        /**
         * StartY of Cropzone
         * @type {number}
         * @private
         */
        this._startY = null;

        /**
         * State whether shortcut key is pressed or not
         * @type {boolean}
         * @private
         */
        this._withShiftKey = false;

        /**
         * Listeners
         * @type {object.<string, function>}
         * @private
         */
        this._listeners = {
            keydown: bind(this._onKeyDown, this),
            keyup: bind(this._onKeyUp, this),
            mousedown: bind(this._onFabricMouseDown, this),
            mousemove: bind(this._onFabricMouseMove, this),
            mouseup: bind(this._onFabricMouseUp, this)
        };
    }

    /**
     * Start cropping
     */
    start() {
        if (this._cropzone) {
            return;
        }
        const canvas = this.getCanvas();
        canvas.forEachObject(obj => { // {@link http://fabricjs.com/docs/fabric.Object.html#evented}
            obj.evented = false;
        });
        this._cropzone = new Cropzone({
            left: -10,
            top: -10,
            width: 1,
            height: 1,
            strokeWidth: 0, // {@link https://github.com/kangax/fabric.js/issues/2860}
            cornerSize: 10,
            cornerColor: 'black',
            fill: 'transparent',
            hasRotatingPoint: false,
            hasBorders: false,
            lockScalingFlip: true,
            lockRotation: true
        });
        canvas.deactivateAll();
        canvas.add(this._cropzone);
        canvas.on('mouse:down', this._listeners.mousedown);
        canvas.selection = false;
        canvas.defaultCursor = 'crosshair';

        fabric.util.addListener(document, 'keydown', this._listeners.keydown);
        fabric.util.addListener(document, 'keyup', this._listeners.keyup);
    }

    /**
     * End cropping
     * @param {boolean} isApplying - Is applying or not
     * @returns {?{imageName: string, url: string}} cropped Image data
     */
    end(isApplying) {
        const canvas = this.getCanvas();
        const cropzone = this._cropzone;
        let data;

        if (!cropzone) {
            return null;
        }
        cropzone.remove();
        canvas.selection = true;
        canvas.defaultCursor = 'default';
        canvas.off('mouse:down', this._listeners.mousedown);
        canvas.forEachObject(obj => {
            obj.evented = true;
        });
        if (isApplying) {
            data = this._getCroppedImageData();
        }
        this._cropzone = null;

        fabric.util.removeListener(document, 'keydown', this._listeners.keydown);
        fabric.util.removeListener(document, 'keyup', this._listeners.keyup);

        return data;
    }

    /**
     * onMousedown handler in fabric canvas
     * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event
     * @private
     */
    _onFabricMouseDown(fEvent) {
        const canvas = this.getCanvas();

        if (fEvent.target) {
            return;
        }

        canvas.selection = false;
        const coord = canvas.getPointer(fEvent.e);

        this._startX = coord.x;
        this._startY = coord.y;

        canvas.on({
            'mouse:move': this._listeners.mousemove,
            'mouse:up': this._listeners.mouseup
        });
    }

    /**
     * onMousemove handler in fabric canvas
     * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event
     * @private
     */
    _onFabricMouseMove(fEvent) {
        const canvas = this.getCanvas();
        const pointer = canvas.getPointer(fEvent.e);
        const x = pointer.x;
        const y = pointer.y;
        const cropzone = this._cropzone;

        if (abs(x - this._startX) + abs(y - this._startY) > MOUSE_MOVE_THRESHOLD) {
            cropzone.remove();
            cropzone.set(this._calcRectDimensionFromPoint(x, y));

            canvas.add(cropzone);
        }
    }

    /**
     * Get rect dimension setting from Canvas-Mouse-Position(x, y)
     * @param {number} x - Canvas-Mouse-Position x
     * @param {number} y - Canvas-Mouse-Position Y
     * @returns {{left: number, top: number, width: number, height: number}}
     * @private
     */
    _calcRectDimensionFromPoint(x, y) {
        const canvas = this.getCanvas();
        const canvasWidth = canvas.getWidth();
        const canvasHeight = canvas.getHeight();
        const startX = this._startX;
        const startY = this._startY;
        let left = clamp(x, 0, startX);
        let top = clamp(y, 0, startY);
        let width = clamp(x, startX, canvasWidth) - left; // (startX <= x(mouse) <= canvasWidth) - left
        let height = clamp(y, startY, canvasHeight) - top; // (startY <= y(mouse) <= canvasHeight) - top

        if (this._withShiftKey) { // make fixed ratio cropzone
            if (width > height) {
                height = width;
            } else if (height > width) {
                width = height;
            }

            if (startX >= x) {
                left = startX - width;
            }

            if (startY >= y) {
                top = startY - height;
            }
        }

        return {
            left,
            top,
            width,
            height
        };
    }

    /**
     * onMouseup handler in fabric canvas
     * @private
     */
    _onFabricMouseUp() {
        const cropzone = this._cropzone;
        const listeners = this._listeners;
        const canvas = this.getCanvas();

        canvas.setActiveObject(cropzone);
        canvas.off({
            'mouse:move': listeners.mousemove,
            'mouse:up': listeners.mouseup
        });
    }

    /**
     * Get cropped image data
     * @returns {?{imageName: string, url: string}} cropped Image data
     * @private
     */
    _getCroppedImageData() {
        const cropzone = this._cropzone;

        if (!cropzone.isValid()) {
            return null;
        }

        const cropInfo = {
            left: cropzone.getLeft(),
            top: cropzone.getTop(),
            width: cropzone.getWidth(),
            height: cropzone.getHeight()
        };

        return {
            imageName: this.getImageName(),
            url: this.getCanvas().toDataURL(cropInfo)
        };
    }

    /**
     * Keydown event handler
     * @param {KeyboardEvent} e - Event object
     * @private
     */
    _onKeyDown(e) {
        if (e.keyCode === keyCodes.SHIFT) {
            this._withShiftKey = true;
        }
    }

    /**
     * Keyup event handler
     * @param {KeyboardEvent} e - Event object
     * @private
     */
    _onKeyUp(e) {
        if (e.keyCode === keyCodes.SHIFT) {
            this._withShiftKey = false;
        }
    }
}

module.exports = Cropper;
