(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
tui.util.defineNamespace('tui.component.ImageEditor', require('./src/js/imageEditor'), true);

},{"./src/js/imageEditor":9}],2:[function(require,module,exports){
'use strict';
var Component = require('../interface/component');
var Cropzone = require('../extension/cropzone');
var consts = require('../consts');
var util = require('../util');

var MOUSE_MOVE_THRESHOLD = 10;

var abs = Math.abs;
var clamp = util.clamp;

/**
 * Cropper components
 * @param {Component} parent - parent component
 * @extends {Component}
 * @class Cropper
 */
var Cropper = tui.util.defineClass(Component, /* @lends Cropper.prototype */{
    init: function(parent) {
        this.setParent(parent);

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
         * listeners
         * @type {object.<string, function>} Handler hash for fabric canvas
         * @private
         */
        this._listeners = {
            mousedown: $.proxy(this._onFabricMouseDown, this),
            mousemove: $.proxy(this._onFabricMouseMove, this),
            mouseup: $.proxy(this._onFabricMouseUp, this)
        };
    },

    /**
     * Component name
     * @type {string}
     */
    name: consts.componentNames.CROPPER,

    /**
     * Start cropping
     */
    start: function() {
        var canvas;

        if (this._cropzone) {
            return;
        }

        this._cropzone = new Cropzone({
            left: -10,
            top: -10,
            width: 1,
            height: 1,
            cornerSize: 10,
            cornerColor: 'black',
            fill: 'transparent',
            hasRotatingPoint: false,
            hasBorders: false,
            lockScalingFlip: true,
            lockRotation: true
        });
        canvas = this.getCanvas();
        canvas.add(this._cropzone);
        canvas.on('mouse:down', this._listeners.mousedown);
        canvas.defaultCursor = 'crosshair';
    },

    /**
     * End cropping
     * @param {boolean} isApplying - Is applying or not
     * @returns {?{imageName: string, url: string}} cropped Image data
     */
    end: function(isApplying) {
        var canvas = this.getCanvas();
        var cropzone = this._cropzone;
        var data;

        if (!cropzone) {
            return null;
        }
        canvas.selection = true;
        canvas.defaultCursor = 'default';
        canvas.discardActiveObject();
        canvas.off('mouse:down', this._listeners.mousedown);

        cropzone.remove();
        if (isApplying) {
            data = this._getCroppedImageData();
        }
        this._cropzone = null;

        return data;
    },


    /**
     * onMousedown handler in fabric canvas
     * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event
     * @private
     */
    _onFabricMouseDown: function(fEvent) {
        var canvas = this.getCanvas();
        var coord;

        if (fEvent.target) {
            return;
        }

        canvas.selection = false;
        coord = canvas.getPointer(fEvent.e);

        this._startX = coord.x;
        this._startY = coord.y;

        canvas.on({
            'mouse:move': this._listeners.mousemove,
            'mouse:up': this._listeners.mouseup
        });
    },

    /**
     * onMousemove handler in fabric canvas
     * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event
     * @private
     */
    _onFabricMouseMove: function(fEvent) {
        var canvas = this.getCanvas();
        var pointer = canvas.getPointer(fEvent.e);
        var x = pointer.x;
        var y = pointer.y;
        var cropzone = this._cropzone;

        if (abs(x - this._startX) + abs(y - this._startY) > MOUSE_MOVE_THRESHOLD) {
            cropzone.remove();
            cropzone.set(this._calcRectDimensionFromPoint(x, y));

            canvas.add(cropzone);
        }
    },

    /**
     * Get rect dimension setting from Canvas-Mouse-Position(x, y)
     * @param {number} x - Canvas-Mouse-Position x
     * @param {number} y - Canvas-Mouse-Position Y
     * @returns {{left: number, top: number, width: number, height: number}}
     * @private
     */
    _calcRectDimensionFromPoint: function(x, y) {
        var canvas = this.getCanvas();
        var width = canvas.getWidth();
        var height = canvas.getHeight();
        var startX = this._startX;
        var startY = this._startY;
        var left = clamp(x, 0, startX);
        var top = clamp(y, 0, startY);

        return {
            left: left,
            top: top,
            width: clamp(x, startX, width) - left, // (startX <= x(mouse) <= canvasWidth) - left,
            height: clamp(y, startY, height) - top // (startY <= y(mouse) <= canvasHeight) - top
        };
    },

    /**
     * onMouseup handler in fabric canvas
     * @private
     */
    _onFabricMouseUp: function() {
        var cropzone = this._cropzone;
        var listeners = this._listeners;
        var canvas = this.getCanvas();

        canvas.setActiveObject(cropzone);
        canvas.off({
            'mouse:move': listeners.mousemove,
            'mouse:up': listeners.mouseup
        });
    },

    /**
     * Get cropped image data
     * @returns {?{imageName: string, url: string}} cropped Image data
     * @private
     */
    _getCroppedImageData: function() {
        var cropzone = this._cropzone;
        var cropInfo;

        if (!cropzone.isValid()) {
            return null;
        }

        cropInfo = {
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
});

module.exports = Cropper;

},{"../consts":5,"../extension/cropzone":6,"../interface/component":11,"../util":13}],3:[function(require,module,exports){
'use strict';

var Component = require('../interface/component');
var consts = require('../consts');

var crossOrigin = {crossOrigin: ''};
var cssOnly = {cssOnly: true};
var backstoreOnly = {backstoreOnly: true};

/**
 * ImageLoader components
 * @extends {Component}
 * @class ImageLoader
 * @param {Component} parent - parent component
 */
var ImageLoader = tui.util.defineClass(Component, /* @lends ImageLoader.prototype */{
    init: function(parent) {
        this.setParent(parent);
    },

    /**
     * Component name
     * @type {string}
     */
    name: consts.componentNames.IMAGE_LOADER,

    /**
     * Load image from url
     * @param {?string} imageName - File name
     * @param {?(fabric.Image|string)} img - fabric.Image instance or URL of an image
     * @returns {jQuery.Deferred} deferred
     */
    load: function(imageName, img) {
        var self = this;
        var dfd;

        if (!imageName && !img) { // Back to the initial state, not error.
            this.getCanvas().backgroundImage = null;
            this.getCanvas().renderAll();

            dfd = $.Deferred(function() {
                self.setCanvasImage('', null);
            }).resolve();
        } else {
            dfd = this._setBackgroundImage(img).done(function(oImage) {
                self._onSuccessImageLoad(oImage);
                self.setCanvasImage(imageName, oImage);
            });
        }

        return dfd;
    },

    /**
     * Set background image
     * @param {?(fabric.Image|String)} img fabric.Image instance or URL of an image to set background to
     * @returns {*}
     * @private
     */
    _setBackgroundImage: function(img) {
        var dfd = $.Deferred();
        var canvas;

        if (!img) {
            return dfd.reject();
        }
        canvas = this.getCanvas();
        canvas.setBackgroundImage(img, function() {
            var oImage = canvas.backgroundImage;

            if (oImage.getElement()) {
                dfd.resolve(oImage);
            } else {
                dfd.reject();
            }
        }, crossOrigin);

        return dfd;
    },

    /**
     * onSuccess callback
     * @param {fabric.Image} oImage - Fabric image instance
     * @private
     */
    _onSuccessImageLoad: function(oImage) {
        var canvas = this.getCanvas();
        var maxWidth = Math.min(
            Math.floor(1000),
            oImage.width
        );

        canvas.setDimensions({
            margin: 'auto',
            width: '100%',
            height: '',  // No inline-css "height" for IE9
            'max-width': maxWidth + 'px'
        }, cssOnly);

        canvas.setDimensions({
            width: oImage.width,
            height: oImage.height
        }, backstoreOnly);
    }
});

module.exports = ImageLoader;

},{"../consts":5,"../interface/component":11}],4:[function(require,module,exports){
'use strict';

var Component = require('../interface/component');
var consts = require('../consts');

/**
 * Main component
 * @extends Component
 * @class
 */
var Main = tui.util.defineClass(Component, /* @lends Main.prototype */{
    init: function() {
        /**
         * Fabric canvas instance
         * @type {fabric.Canvas}
         */
        this.canvas = null;

        /**
         * Fabric image instance
         * @type {fabric.Image}
         */
        this.oImage = null;

        /**
         * Image name
         * @type {string}
         */
        this.imageName = '';
    },

    /**
     * Component name
     * @type {string}
     */
    name: consts.componentNames.MAIN,

    /**
     * To data url from canvas
     * @param {string} type - A DOMString indicating the image format. The default type is image/png.
     * @returns {string} A DOMString containing the requested data URI.
     */
    toDataURL: function(type) {
        return this.canvas && this.canvas.toDataURL(type);
    },

    /**
     * Save image(background) of canvas
     * @param {string} name - Name of image
     * @param {fabric.Image} oImage - Fabric image instance
     * @override
     */
    setCanvasImage: function(name, oImage) {
        this.imageName = name;
        this.oImage = oImage;
    },

    /**
     * Set canvas element to fabric.Canvas
     * @param {jQuery|Element|string} canvasElement - Canvas element or selector
     * @override
     */
    setCanvasElement: function(canvasElement) {
        this.canvas = new fabric.Canvas($(canvasElement)[0], {
            containerClass: 'tui-component-imageEditor-canvasContainer'
        });
    },

    /**
     * Returns canvas element of fabric.Canvas[[lower-canvas]]
     * @returns {HTMLCanvasElement}
     * @override
     */
    getCanvasElement: function() {
        return this.canvas.getElement();
    },

    /**
     * Get fabric.Canvas instance
     * @override
     * @returns {fabric.Canvas}
     */
    getCanvas: function() {
        return this.canvas;
    },

    /**
     * Get canvasImage (fabric.Image instance)
     * @override
     * @returns {fabric.Image}
     */
    getCanvasImage: function() {
        return this.oImage;
    },

    /**
     * Get image name
     * @override
     * @returns {string}
     */
    getImageName: function() {
        return this.imageName;
    }
});

module.exports = Main;

},{"../consts":5,"../interface/component":11}],5:[function(require,module,exports){
'use strict';

var util = require('./util');

module.exports = {
    componentNames: util.keyMirror(
        'MAIN',
        'IMAGE_LOADER',
        'CROPPER'
    ),

    eventNames: {
        LOAD_IMAGE: 'loadImage',
        CLEAR_IMAGE: 'clearImage',
        START_CROPPING: 'startCropping',
        END_CROPPING: 'endCropping',
        EMPTY_REDO_STACK: 'emptyRedoStack',
        EMPTY_UNDO_STACK: 'emptyUndoStack',
        PUSH_UNDO_STACK: 'pushUndoStack',
        PUSH_REDO_STACK: 'pushRedoStack'
    },

    IS_SUPPORT_FILE_API: !!(window.File && window.FileList && window.FileReader)
};

},{"./util":13}],6:[function(require,module,exports){
'use strict';

var clamp = require('../util').clamp;

var CORNER_TYPE_TOP_LEFT = 'tl';
var CORNER_TYPE_TOP_RIGHT = 'tr';
var CORNER_TYPE_MIDDLE_TOP = 'mt';
var CORNER_TYPE_MIDDLE_LEFT = 'ml';
var CORNER_TYPE_MIDDLE_RIGHT = 'mr';
var CORNER_TYPE_MIDDLE_BOTTOM = 'mb';
var CORNER_TYPE_BOTTOM_LEFT = 'bl';
var CORNER_TYPE_BOTTOM_RIGHT = 'br';

/**
 * Cropzone object
 * Issue: IE7, 8(with excanvas)
 *  - Cropzone is a black zone without transparency.
 * @class Cropzone
 * @extends {fabric.Rect}
 */
var Cropzone = fabric.util.createClass(fabric.Rect, {
    /**
     * Constructor
     * @param {Object} [options] Options object
     * @override
     */
    initialize: function(options) {
        this.callSuper('initialize', options);
        this.on({
            'moving': this._onMoving,
            'scaling': this._onScaling
        });
    },

    /**
     * Render Crop-zone
     * @param {CanvasRenderingContext2D} ctx - Context
     * @private
     * @override
     */
    _render: function(ctx) {
        var originalFlipX, originalFlipY,
            originalScaleX, originalScaleY,
            cropzoneDashLineWidth = 7,
            cropzoneDashLineOffset = 7;
        this.callSuper('_render', ctx);

        // Calc original scale
        originalFlipX = this.flipX ? -1 : 1;
        originalFlipY = this.flipY ? -1 : 1;
        originalScaleX = originalFlipX / this.scaleX;
        originalScaleY = originalFlipY / this.scaleY;

        // Set original scale
        ctx.scale(originalScaleX, originalScaleY);

        // Render outer rect
        this._fillOuterRect(ctx, 'rgba(0, 0, 0, 0.55)');

        // Black dash line
        this._strokeBorder(ctx, 'rgb(0, 0, 0)', cropzoneDashLineWidth);

        // White dash line
        this._strokeBorder(ctx, 'rgb(255, 255, 255)', cropzoneDashLineWidth, cropzoneDashLineOffset);

        // Reset scale
        ctx.scale(1 / originalScaleX, 1 / originalScaleY);
    },

    /**
     * Cropzone-coordinates with outer rectangle
     *
     *     x0     x1         x2      x3
     *  y0 +--------------------------+
     *     |///////|//////////|///////|    // <--- "Outer-rectangle"
     *     |///////|//////////|///////|
     *  y1 +-------+----------+-------+
     *     |///////| Cropzone |///////|    Cropzone is the "Inner-rectangle"
     *     |///////|  (0, 0)  |///////|    Center point (0, 0)
     *  y2 +-------+----------+-------+
     *     |///////|//////////|///////|
     *     |///////|//////////|///////|
     *  y3 +--------------------------+
     *
     * @typedef {{x: Array<number>, y: Array<number>}} cropzoneCoordinates
     */

    /**
     * Fill outer rectangle
     * @param {CanvasRenderingContext2D} ctx - Context
     * @param {string|CanvasGradient|CanvasPattern} fillStyle - Fill-style
     * @private
     */
    _fillOuterRect: function(ctx, fillStyle) {
        var coordinates = this._getCoordinates(ctx),
            x = coordinates.x,
            y = coordinates.y;

        ctx.save();
        ctx.fillStyle = fillStyle;
        ctx.beginPath();

        // Outer rectangle
        // Numbers are +/-1 so that overlay edges don't get blurry.
        ctx.moveTo(x[0] - 1, y[0] - 1);
        ctx.lineTo(x[3] + 1, y[0] - 1);
        ctx.lineTo(x[3] + 1, y[3] + 1);
        ctx.lineTo(x[0] - 1, y[3] - 1);
        ctx.lineTo(x[0] - 1, y[0] - 1);
        ctx.closePath();

        // Inner rectangle
        ctx.moveTo(x[1], y[1]);
        ctx.lineTo(x[1], y[2]);
        ctx.lineTo(x[2], y[2]);
        ctx.lineTo(x[2], y[1]);
        ctx.lineTo(x[1], y[1]);
        ctx.closePath();

        ctx.fill();
        ctx.restore();
    },

    /**
     * Get coordinates
     * @param {CanvasRenderingContext2D} ctx - Context
     * @returns {cropzoneCoordinates} - {@link cropzoneCoordinates}
     * @private
     */
    _getCoordinates: function(ctx) {
        var ceil = Math.ceil,
            width = this.getWidth(),
            height = this.getHeight(),
            halfWidth = width / 2,
            halfHeight = height / 2,
            left = this.getLeft(),
            top = this.getTop(),
            canvasEl = ctx.canvas; // canvas element, not fabric object

        return {
            x: tui.util.map([
                -(halfWidth + left),                        // x0
                -(halfWidth),                               // x1
                halfWidth,                                  // x2
                halfWidth + (canvasEl.width - left - width) // x3
            ], ceil),
            y: tui.util.map([
                -(halfHeight + top),                            // y0
                -(halfHeight),                                  // y1
                halfHeight,                                     // y2
                halfHeight + (canvasEl.height - top - height)   // y3
            ], ceil)
        };
    },

    /**
     * Stroke border
     * @param {CanvasRenderingContext2D} ctx - Context
     * @param {string|CanvasGradient|CanvasPattern} strokeStyle - Stroke-style
     * @param {number} lineDashWidth - Dash width
     * @param {number} [lineDashOffset] - Dash offset
     * @private
     */
    _strokeBorder: function(ctx, strokeStyle, lineDashWidth, lineDashOffset) {
        var halfWidth = this.getWidth() / 2,
            halfHeight = this.getHeight() / 2;

        ctx.save();
        ctx.strokeStyle = strokeStyle;
        if (ctx.setLineDash) {
            ctx.setLineDash([lineDashWidth, lineDashWidth]);
        }
        if (lineDashOffset) {
            ctx.lineDashOffset = lineDashOffset;
        }

        ctx.beginPath();
        ctx.moveTo(-halfWidth, -halfHeight);
        ctx.lineTo(halfWidth, -halfHeight);
        ctx.lineTo(halfWidth, halfHeight);
        ctx.lineTo(-halfWidth, halfHeight);
        ctx.lineTo(-halfWidth, -halfHeight);
        ctx.stroke();

        ctx.restore();
    },

    /**
     * onMoving event listener
     * @private
     */
    _onMoving: function() {
        var canvas = this.canvas,
            left = this.getLeft(),
            top = this.getTop(),
            width = this.getWidth(),
            height = this.getHeight(),
            maxLeft = canvas.getWidth() - width,
            maxTop = canvas.getHeight() - height;

        this.setLeft(clamp(left, 0, maxLeft));
        this.setTop(clamp(top, 0, maxTop));
    },

    /**
     * onScaling event listener
     * @param {{e: MouseEvent}} fEvent - Fabric event
     * @private
     */
    _onScaling: function(fEvent) {
        var pointer = this.canvas.getPointer(fEvent.e),
            settings = this._calcScalingSizeFromPointer(pointer);

        // On scaling cropzone,
        // change real width and height and fix scaleFactor to 1
        this.scale(1).set(settings);
    },

    /**
     * Calc scaled size from mouse pointer with selected corner
     * @param {{x: number, y: number}} pointer - Mouse position
     * @returns {object} Having left or(and) top or(and) width or(and) height.
     * @private
     */
    _calcScalingSizeFromPointer: function(pointer) {
        var pointerX = pointer.x,
            pointerY = pointer.y,
            tlScalingSize = this._calcTopLeftScalingSizeFromPointer(pointerX, pointerY),
            brScalingSize = this._calcBottomRightScalingSizeFromPointer(pointerX, pointerY);

        /*
         * @todo: 일반 객체에서 shift 조합키를 누르면 free size scaling이 됨 --> 확인해볼것
         *      canvas.class.js // _scaleObject: function(...){...}
         */
        return this._makeScalingSettings(tlScalingSize, brScalingSize);
    },

    /**
     * Calc scaling size(position + dimension) from left-top corner
     * @param {number} x - Mouse position X
     * @param {number} y - Mouse position Y
     * @returns {{top: number, left: number, width: number, height: number}}
     * @private
     */
    _calcTopLeftScalingSizeFromPointer: function(x, y) {
        var bottom = this.getHeight() + this.top,
            right = this.getWidth() + this.left,
            top = clamp(y, 0, bottom - 1),  // 0 <= top <= (bottom - 1)
            left = clamp(x, 0, right - 1);  // 0 <= left <= (right - 1)

        // When scaling "Top-Left corner": It fixes right and bottom coordinates
        return {
            top: top,
            left: left,
            width: right - left,
            height: bottom - top
        };
    },

    /**
     * Calc scaling size from right-bottom corner
     * @param {number} x - Mouse position X
     * @param {number} y - Mouse position Y
     * @returns {{width: number, height: number}}
     * @private
     */
    _calcBottomRightScalingSizeFromPointer: function(x, y) {
        var canvas = this.canvas,
            maxX = canvas.width,
            maxY = canvas.height,
            left = this.left,
            top = this.top;

        // When scaling "Bottom-Right corner": It fixes left and top coordinates
        return {
            width: clamp(x, (left + 1), maxX) - left,    // (width = x - left), (left + 1 <= x <= maxX)
            height: clamp(y, (top + 1), maxY) - top      // (height = y - top), (top + 1 <= y <= maxY)
        };
    },

    /*eslint-disable complexity*/
    /**
     * Make scaling settings
     * @param {{width: number, height: number, left: number, top: number}} tl - Top-Left setting
     * @param {{width: number, height: number}} br - Bottom-Right setting
     * @returns {{width: ?number, height: ?number, left: ?number, top: ?number}} Position setting
     * @private
     */
    _makeScalingSettings: function(tl, br) {
        var tlWidth = tl.width,
            tlHeight = tl.height,
            brHeight = br.height,
            brWidth = br.width,
            tlLeft = tl.left,
            tlTop = tl.top,
            settings;

        switch (this.__corner) {
            case CORNER_TYPE_TOP_LEFT:
                settings = tl;
                break;
            case CORNER_TYPE_TOP_RIGHT:
                settings = {
                    width: brWidth,
                    height: tlHeight,
                    top: tlTop
                };
                break;
            case CORNER_TYPE_BOTTOM_LEFT:
                settings = {
                    width: tlWidth,
                    height: brHeight,
                    left: tlLeft
                };
                break;
            case CORNER_TYPE_BOTTOM_RIGHT:
                settings = br;
                break;
            case CORNER_TYPE_MIDDLE_LEFT:
                settings = {
                    width: tlWidth,
                    left: tlLeft
                };
                break;
            case CORNER_TYPE_MIDDLE_TOP:
                settings = {
                    height: tlHeight,
                    top: tlTop
                };
                break;
            case CORNER_TYPE_MIDDLE_RIGHT:
                settings = {
                    width: brWidth
                };
                break;
            case CORNER_TYPE_MIDDLE_BOTTOM:
                settings = {
                    height: brHeight
                };
                break;
            default:
                break;
        }

        return settings;
    }, /*eslint-enable complexity*/

    /**
     * Return the whether this cropzone is valid
     * @returns {boolean}
     */
    isValid: function() {
        return (
            this.left >= 0 &&
            this.top >= 0 &&
            this.width > 0 &&
            this.height > 0
        );
    }
});

module.exports = Cropzone;

},{"../util":13}],7:[function(require,module,exports){
'use strict';

var Command = require('../interface/command');
var componentNames = require('../consts').componentNames;

var IMAGE_LOADER = componentNames.IMAGE_LOADER;

/**
 * @param {string} imageName - Image name
 * @param {string} url - Image url
 * @returns {Command}
 */
function createLoadCommand(imageName, url) {
    return new Command({
        execute: function(compMap) {
            var loader = compMap[IMAGE_LOADER];

            this.store = {
                prevName: loader.getImageName(),
                prevImage: loader.getCanvasImage()
            };

            return loader.load(imageName, url);
        },
        undo: function(compMap) {
            var loader = compMap[IMAGE_LOADER];
            var store = this.store;

            return loader.load(store.prevName, store.prevImage);
        }
    });
}

module.exports = {
    createLoadCommand: createLoadCommand
};

},{"../consts":5,"../interface/command":10}],8:[function(require,module,exports){
'use strict';

var keyMirror = require('../util').keyMirror;

var types = keyMirror(
    'UN_IMPLEMENTATION',
    'NO_COMPONENT_NAME',
    'UNKNOWN'
);

var messages = {
    UN_IMPLEMENTATION: 'Should implement a method: ',
    NO_COMPONENT_NAME: 'Should set a component name',
    UNKNOWN: 'Unknown: '
};


var map = {
    UN_IMPLEMENTATION: function(methodName) {
        return messages.UN_IMPLEMENTATION + methodName;
    },

    NO_COMPONENT_NAME: function() {
        return messages.NO_COMPONENT_NAME;
    },

    UNKNOWN: function(msg) {
        return messages.UNKNOWN + msg;
    }
};

module.exports = {
    types: tui.util.extend({}, types),

    create: function(type) {
        var func;

        type = type.toLowerCase();
        func = map[type] || map.unknown;
        Array.prototype.shift.apply(arguments);

        return func.apply(null, arguments);
    }
};

},{"../util":13}],9:[function(require,module,exports){
'use strict';

var Invoker = require('./invoker');
var commandFactory = require('./factory/command');
var consts = require('./consts');

var eventNames = consts.eventNames;
var compNames = consts.componentNames;

/**
 * Image editor
 * @class
 * @param {string|jQuery|HTMLElement} canvasElement - Canvas element or selector
 */
var ImageEditor = tui.util.defineClass(/* @lends ImageEditor.prototype */{
    static: {
        eventNames: tui.util.extend({}, eventNames)
    },

    init: function(canvasElement) {
        /**
         * Inovker
         * @private
         * @type {Invoker}
         */
        this._invoker = new Invoker();

        this._setCanvasElement($(canvasElement)[0]);
    },

    /**
     * Set canvas element
     * @param {jQuery|Element|string} canvasElement - Canvas element or selector
     * @private
     */
    _setCanvasElement: function(canvasElement) {
        this._invoker.get(compNames.MAIN).setCanvasElement(canvasElement);
    },

    /**
     * Clear all actions
     */
    clear: function() {
        this.endCropping();
    },

    /**
     * Invoke command
     * @param {Command} command - Command
     */
    execute: function(command) {
        var self = this;

        this.clear();
        this._invoker.invoke(command).done(function() {
            self.fire(eventNames.PUSH_UNDO_STACK);
            self.fire(eventNames.EMPTY_REDO_STACK);
        });
    },

    /**
     * Undo
     */
    undo: function() {
        var invoker = this._invoker;
        var self = this;

        this.clear();
        invoker.undo().done(function() {
            if (invoker.isEmptyUndoStack()) {
                self.fire(eventNames.EMPTY_UNDO_STACK);
            }
            self.fire(eventNames.PUSH_REDO_STACK);
        });
    },

    /**
     * Redo
     */
    redo: function() {
        var invoker = this._invoker;
        var self = this;

        this.clear();
        invoker.redo().done(function() {
            if (invoker.isEmptyRedoStack()) {
                self.fire(eventNames.EMPTY_REDO_STACK);
            }
            self.fire(eventNames.PUSH_UNDO_STACK);
        });
    },

    /**
     * Load image from file
     * @param {File} imgFile - Image file
     */
    loadImageFromFile: function(imgFile) {
        if (!imgFile) {
            return;
        }

        this.loadImageFromURL(
            imgFile.name,
            URL.createObjectURL(imgFile)
        );
    },

    /**
     * Load image from url
     * @param {string} imageName - imageName
     * @param {string} url - File url
     */
    loadImageFromURL: function(imageName, url) {
        var callback, command;
        if (!imageName || !url) {
            return;
        }

        callback = $.proxy(this._callbackAfterImageLoading, this);
        command = commandFactory.createLoadCommand(imageName, url)
            .setExecutionCallback(callback)
            .setUndoerCallback(callback);

        this.execute(command);
    },

    /**
     * Callback after image loading
     * @param {?fabric.Image} oImage - Image instance
     */
    _callbackAfterImageLoading: function(oImage) {
        var mainComponent = this._invoker.get(compNames.MAIN);
        var $canvasElement = $(mainComponent.getCanvasElement());

        if (oImage) {
            this.fire(eventNames.LOAD_IMAGE, {
                originalWidth: oImage.width,
                originalHeight: oImage.height,
                currentWidth: $canvasElement.width(),
                currentHeight: $canvasElement.height()
            });
        } else {
            this.fire(eventNames.CLEAR_IMAGE);
        }
    },

    /**
     * Start cropping
     */
    startCropping: function() {
        var cropper = this._invoker.get(compNames.CROPPER);

        cropper.start();
        this.fire(eventNames.START_CROPPING);
    },

    /**
     * Apply cropping
     * @param {boolean} [isApplying] - Whether the cropping is applied or canceled
     */
    endCropping: function(isApplying) {
        var cropper = this._invoker.get(compNames.CROPPER);
        var data = cropper.end(isApplying);

        this.fire(eventNames.END_CROPPING);
        if (data) {
            this.loadImageFromURL(data.imageName, data.url);
        }
    },

    /**
     * Get data url
     * @param {string} type - A DOMString indicating the image format. The default type is image/png.
     * @returns {string} A DOMString containing the requested data URI.
     */
    toDataURL: function(type) {
        return this._invoker.get(compNames.MAIN).toDataURL(type);
    },

    /**
     * Get image name
     * @returns {string}
     */
    getImageName: function() {
        return this._invoker.get(compNames.MAIN).getImageName();
    },

    /**
     * Clear undoStack
     */
    clearUndoStack: function() {
        this._invoker.clearUndoStack();
        this.fire(eventNames.EMPTY_UNDO_STACK);
    },

    /**
     * Clear redoStack
     */
    clearRedoStack: function() {
        this._invoker.clearRedoStack();
        this.fire(eventNames.EMPTY_REDO_STACK);
    }
});

tui.util.CustomEvents.mixin(ImageEditor);
module.exports = ImageEditor;

},{"./consts":5,"./factory/command":7,"./invoker":12}],10:[function(require,module,exports){
'use strict';

var errorMessage = require('../factory/errorMessage');

var createMessage = errorMessage.create,
    errorTypes = errorMessage.types;

/**
 * Command class
 * @class
 * @param {{execute: function, undo: function}} actions - Command actions
 */
var Command = tui.util.defineClass({
    init: function(actions) {
        /**
         * Execute function
         * @type {function}
         */
        this.execute = actions.execute;

        /**
         * Undo function
         * @type {function}
         */
        this.undo = actions.undo;

        /**
         * After execution callback
         * @type {null}
         */
        this.executionCallback = null;

        /**
         * After undo callback
         * @type {null}
         */
        this.undoerCallback = null;
    },

    /**
     * Execute action
     * @abstract
     */
    execute: function() {
        throw new Error(createMessage(errorTypes.UN_IMPLEMENTATION, 'execute'));
    },

    /**
     * Undo action
     * @abstract
     */
    undo: function() {
        throw new Error(createMessage(errorTypes.UN_IMPLEMENTATION, 'undo'));
    },

    /**
     * Attach after execute callback
     * @param {function} callback - Execute callback
     * @returns {Command} this
     */
    setExecutionCallback: function(callback) {
        this.executionCallback = callback;

        return this;
    },

    /**
     * Attach after undo callback
     * @param {function} callback - Execute callback
     * @returns {Command} this
     */
    setUndoerCallback: function(callback) {
        this.undoerCallback = callback;

        return this;
    }
});

module.exports = Command;

},{"../factory/errorMessage":8}],11:[function(require,module,exports){
'use strict';

/**
 * Component interface
 * @class
 */
var Component = tui.util.defineClass({
    init: function() {},

    /**
     * Save image(background) of canvas
     * @param {string} name - Name of image
     * @param {fabric.Image} oImage - Fabric image instance
     */
    setCanvasImage: function(name, oImage) {
        this.getRoot().setCanvasImage(name, oImage);
    },

    /**
     * Returns canvas element of fabric.Canvas[[lower-canvas]]
     * @returns {HTMLCanvasElement}
     */
    getCanvasElement: function() {
        return this.getRoot().getCanvasElement();
    },

    /**
     * Get fabric.Canvas instance
     * @returns {fabric.Canvas}
     */
    getCanvas: function() {
        return this.getRoot().getCanvas();
    },

    /**
     * Get canvasImage (fabric.Image instance)
     * @returns {fabric.Image}
     */
    getCanvasImage: function() {
        return this.getRoot().getCanvasImage();
    },

    /**
     * Get image name
     * @returns {string}
     */
    getImageName: function() {
        return this.getRoot().getImageName();
    },

    /**
     * Get image editor
     * @returns {ImageEditor}
     */
    getEditor: function() {
        return this.getRoot().getEditor();
    },

    /**
     * Return component name
     * @returns {string}
     */
    getName: function() {
        return this.name;
    },

    /**
     * Set parent
     * @param {Component|null} parent - Parent
     */
    setParent: function(parent) {
        this._parent = parent || null;
    },

    /**
     * Return parent.
     * If the view is root, return null
     * @returns {Component|null}
     */
    getParent: function() {
        return this._parent;
    },

    /**
     * Return root
     * @returns {Component}
     */
    getRoot: function() {
        var next = this.getParent(),
        /* eslint-disable consistent-this */
            current = this;
        /* eslint-enable consistent-this */

        while (next) {
            current = next;
            next = current.getParent();
        }

        return current;
    }
});

module.exports = Component;

},{}],12:[function(require,module,exports){
'use strict';

var ImageLoader = require('./component/imageLoader');
var Cropper = require('./component/cropper');
var MainComponent = require('./component/main');

/**
 * Invoker
 * @class
 */
var Invoker = tui.util.defineClass(/* @lends Invoker.prototype */{
    init: function() {
        /**
         * Undo stack
         * @type {Array.<Command>}
         */
        this.undoStack = [];

        /**
         * Redo stack
         * @type {Array.<Command>}
         */
        this.redoStack = [];

        /**
         * Component map
         * @type {Object.<string, Component>}
         */
        this.componentMap = {};

        this._createComponents();
    },

    /**
     * Create components
     * @private
     */
    _createComponents: function() {
        var main = new MainComponent();

        this._register(main);
        this._register(new ImageLoader(main));
        this._register(new Cropper(main));
    },

    /**
     * Register component
     * @param {Component} component - Component handling the canvas
     * @private
     */
    _register: function(component) {
        this.componentMap[component.getName()] = component;
    },

    /**
     * Get component
     * @param {string} name - Component name
     * @returns {Component}
     */
    get: function(name) {
        return this.componentMap[name];
    },

    /**
     * Invoke command
     * Store the command to the undoStack
     * Clear the redoStack
     * @param {Command} command - Command
     * @returns {jQuery.Deferred}
     */
    invoke: function(command) {
        var self = this;

        return $.when(command.execute(this.componentMap))
            .done(command.executionCallback)
            .done(function() {
                self.undoStack.push(command);
                self.clearRedoStack();
            });
    },

    /**
     * Undo command
     * @returns {jQuery.Deferred}
     */
    undo: function() {
        var command = this.undoStack.pop();
        var self = this;
        var dfd;

        if (command) {
            dfd = $.when(command.undo(this.componentMap))
                .done(command.undoerCallback)
                .done(function() {
                    self.redoStack.push(command);
                });
        } else {
            dfd = $.Deferred().reject();
        }

        return dfd;
    },

    /**
     * Redo command
     * @returns {jQuery.Deferred}
     */
    redo: function() {
        var command = this.redoStack.pop();
        var self = this;
        var dfd;

        if (command) {
            dfd = $.when(command.execute(this.componentMap))
                .done(command.executionCallback)
                .done(function() {
                    self.undoStack.push(command);
                });
        } else {
            dfd = $.Deferred().reject();
        }

        return dfd;
    },

    /**
     * Return whether the redoStack is empty
     * @returns {boolean}
     */
    isEmptyRedoStack: function() {
        return this.redoStack.length === 0;
    },

    /**
     * Return whether the undoStack is empty
     * @returns {boolean}
     */
    isEmptyUndoStack: function() {
        return this.undoStack.length === 0;
    },

    /**
     * Clear undoStack
     */
    clearUndoStack: function() {
        this.undoStack = [];
    },

    /**
     * Clear redoStack
     */
    clearRedoStack: function() {
        this.redoStack = [];
    }
});

module.exports = Invoker;

},{"./component/cropper":2,"./component/imageLoader":3,"./component/main":4}],13:[function(require,module,exports){
'use strict';

var min = Math.min,
    max = Math.max;

module.exports = {
    /**
     * Clamp value
     * @param {number} value - Value
     * @param {number} minValue - Minimum value
     * @param {number} maxValue - Maximum value
     * @returns {number} clamped value
     */
    clamp: function(value, minValue, maxValue) {
        var temp;
        if (minValue > maxValue) {
            temp = minValue;
            minValue = maxValue;
            maxValue = temp;
        }

        return max(minValue, min(value, maxValue));
    },

    /**
     * Make key-value object from arguments
     * @returns {object.<string, string>}
     */
    keyMirror: function() {
        var obj = {};

        tui.util.forEach(arguments, function(key) {
            obj[key] = key;
        });

        return obj;
    }
};

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsInNyYy9qcy9jb21wb25lbnQvY3JvcHBlci5qcyIsInNyYy9qcy9jb21wb25lbnQvaW1hZ2VMb2FkZXIuanMiLCJzcmMvanMvY29tcG9uZW50L21haW4uanMiLCJzcmMvanMvY29uc3RzLmpzIiwic3JjL2pzL2V4dGVuc2lvbi9jcm9wem9uZS5qcyIsInNyYy9qcy9mYWN0b3J5L2NvbW1hbmQuanMiLCJzcmMvanMvZmFjdG9yeS9lcnJvck1lc3NhZ2UuanMiLCJzcmMvanMvaW1hZ2VFZGl0b3IuanMiLCJzcmMvanMvaW50ZXJmYWNlL2NvbW1hbmQuanMiLCJzcmMvanMvaW50ZXJmYWNlL2NvbXBvbmVudC5qcyIsInNyYy9qcy9pbnZva2VyLmpzIiwic3JjL2pzL3V0aWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0T0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFXQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOU1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ0dWkudXRpbC5kZWZpbmVOYW1lc3BhY2UoJ3R1aS5jb21wb25lbnQuSW1hZ2VFZGl0b3InLCByZXF1aXJlKCcuL3NyYy9qcy9pbWFnZUVkaXRvcicpLCB0cnVlKTtcbiIsIid1c2Ugc3RyaWN0JztcbnZhciBDb21wb25lbnQgPSByZXF1aXJlKCcuLi9pbnRlcmZhY2UvY29tcG9uZW50Jyk7XG52YXIgQ3JvcHpvbmUgPSByZXF1aXJlKCcuLi9leHRlbnNpb24vY3JvcHpvbmUnKTtcbnZhciBjb25zdHMgPSByZXF1aXJlKCcuLi9jb25zdHMnKTtcbnZhciB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xuXG52YXIgTU9VU0VfTU9WRV9USFJFU0hPTEQgPSAxMDtcblxudmFyIGFicyA9IE1hdGguYWJzO1xudmFyIGNsYW1wID0gdXRpbC5jbGFtcDtcblxuLyoqXG4gKiBDcm9wcGVyIGNvbXBvbmVudHNcbiAqIEBwYXJhbSB7Q29tcG9uZW50fSBwYXJlbnQgLSBwYXJlbnQgY29tcG9uZW50XG4gKiBAZXh0ZW5kcyB7Q29tcG9uZW50fVxuICogQGNsYXNzIENyb3BwZXJcbiAqL1xudmFyIENyb3BwZXIgPSB0dWkudXRpbC5kZWZpbmVDbGFzcyhDb21wb25lbnQsIC8qIEBsZW5kcyBDcm9wcGVyLnByb3RvdHlwZSAqL3tcbiAgICBpbml0OiBmdW5jdGlvbihwYXJlbnQpIHtcbiAgICAgICAgdGhpcy5zZXRQYXJlbnQocGFyZW50KTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQ3JvcHpvbmVcbiAgICAgICAgICogQHR5cGUge0Nyb3B6b25lfVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fY3JvcHpvbmUgPSBudWxsO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTdGFydFggb2YgQ3JvcHpvbmVcbiAgICAgICAgICogQHR5cGUge251bWJlcn1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX3N0YXJ0WCA9IG51bGw7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFN0YXJ0WSBvZiBDcm9wem9uZVxuICAgICAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fc3RhcnRZID0gbnVsbDtcblxuICAgICAgICAvKipcbiAgICAgICAgICogbGlzdGVuZXJzXG4gICAgICAgICAqIEB0eXBlIHtvYmplY3QuPHN0cmluZywgZnVuY3Rpb24+fSBIYW5kbGVyIGhhc2ggZm9yIGZhYnJpYyBjYW52YXNcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX2xpc3RlbmVycyA9IHtcbiAgICAgICAgICAgIG1vdXNlZG93bjogJC5wcm94eSh0aGlzLl9vbkZhYnJpY01vdXNlRG93biwgdGhpcyksXG4gICAgICAgICAgICBtb3VzZW1vdmU6ICQucHJveHkodGhpcy5fb25GYWJyaWNNb3VzZU1vdmUsIHRoaXMpLFxuICAgICAgICAgICAgbW91c2V1cDogJC5wcm94eSh0aGlzLl9vbkZhYnJpY01vdXNlVXAsIHRoaXMpXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENvbXBvbmVudCBuYW1lXG4gICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgKi9cbiAgICBuYW1lOiBjb25zdHMuY29tcG9uZW50TmFtZXMuQ1JPUFBFUixcblxuICAgIC8qKlxuICAgICAqIFN0YXJ0IGNyb3BwaW5nXG4gICAgICovXG4gICAgc3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgY2FudmFzO1xuXG4gICAgICAgIGlmICh0aGlzLl9jcm9wem9uZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fY3JvcHpvbmUgPSBuZXcgQ3JvcHpvbmUoe1xuICAgICAgICAgICAgbGVmdDogLTEwLFxuICAgICAgICAgICAgdG9wOiAtMTAsXG4gICAgICAgICAgICB3aWR0aDogMSxcbiAgICAgICAgICAgIGhlaWdodDogMSxcbiAgICAgICAgICAgIGNvcm5lclNpemU6IDEwLFxuICAgICAgICAgICAgY29ybmVyQ29sb3I6ICdibGFjaycsXG4gICAgICAgICAgICBmaWxsOiAndHJhbnNwYXJlbnQnLFxuICAgICAgICAgICAgaGFzUm90YXRpbmdQb2ludDogZmFsc2UsXG4gICAgICAgICAgICBoYXNCb3JkZXJzOiBmYWxzZSxcbiAgICAgICAgICAgIGxvY2tTY2FsaW5nRmxpcDogdHJ1ZSxcbiAgICAgICAgICAgIGxvY2tSb3RhdGlvbjogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgY2FudmFzID0gdGhpcy5nZXRDYW52YXMoKTtcbiAgICAgICAgY2FudmFzLmFkZCh0aGlzLl9jcm9wem9uZSk7XG4gICAgICAgIGNhbnZhcy5vbignbW91c2U6ZG93bicsIHRoaXMuX2xpc3RlbmVycy5tb3VzZWRvd24pO1xuICAgICAgICBjYW52YXMuZGVmYXVsdEN1cnNvciA9ICdjcm9zc2hhaXInO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBFbmQgY3JvcHBpbmdcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlzQXBwbHlpbmcgLSBJcyBhcHBseWluZyBvciBub3RcbiAgICAgKiBAcmV0dXJucyB7P3tpbWFnZU5hbWU6IHN0cmluZywgdXJsOiBzdHJpbmd9fSBjcm9wcGVkIEltYWdlIGRhdGFcbiAgICAgKi9cbiAgICBlbmQ6IGZ1bmN0aW9uKGlzQXBwbHlpbmcpIHtcbiAgICAgICAgdmFyIGNhbnZhcyA9IHRoaXMuZ2V0Q2FudmFzKCk7XG4gICAgICAgIHZhciBjcm9wem9uZSA9IHRoaXMuX2Nyb3B6b25lO1xuICAgICAgICB2YXIgZGF0YTtcblxuICAgICAgICBpZiAoIWNyb3B6b25lKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBjYW52YXMuc2VsZWN0aW9uID0gdHJ1ZTtcbiAgICAgICAgY2FudmFzLmRlZmF1bHRDdXJzb3IgPSAnZGVmYXVsdCc7XG4gICAgICAgIGNhbnZhcy5kaXNjYXJkQWN0aXZlT2JqZWN0KCk7XG4gICAgICAgIGNhbnZhcy5vZmYoJ21vdXNlOmRvd24nLCB0aGlzLl9saXN0ZW5lcnMubW91c2Vkb3duKTtcblxuICAgICAgICBjcm9wem9uZS5yZW1vdmUoKTtcbiAgICAgICAgaWYgKGlzQXBwbHlpbmcpIHtcbiAgICAgICAgICAgIGRhdGEgPSB0aGlzLl9nZXRDcm9wcGVkSW1hZ2VEYXRhKCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fY3JvcHpvbmUgPSBudWxsO1xuXG4gICAgICAgIHJldHVybiBkYXRhO1xuICAgIH0sXG5cblxuICAgIC8qKlxuICAgICAqIG9uTW91c2Vkb3duIGhhbmRsZXIgaW4gZmFicmljIGNhbnZhc1xuICAgICAqIEBwYXJhbSB7e3RhcmdldDogZmFicmljLk9iamVjdCwgZTogTW91c2VFdmVudH19IGZFdmVudCAtIEZhYnJpYyBldmVudFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX29uRmFicmljTW91c2VEb3duOiBmdW5jdGlvbihmRXZlbnQpIHtcbiAgICAgICAgdmFyIGNhbnZhcyA9IHRoaXMuZ2V0Q2FudmFzKCk7XG4gICAgICAgIHZhciBjb29yZDtcblxuICAgICAgICBpZiAoZkV2ZW50LnRhcmdldCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY2FudmFzLnNlbGVjdGlvbiA9IGZhbHNlO1xuICAgICAgICBjb29yZCA9IGNhbnZhcy5nZXRQb2ludGVyKGZFdmVudC5lKTtcblxuICAgICAgICB0aGlzLl9zdGFydFggPSBjb29yZC54O1xuICAgICAgICB0aGlzLl9zdGFydFkgPSBjb29yZC55O1xuXG4gICAgICAgIGNhbnZhcy5vbih7XG4gICAgICAgICAgICAnbW91c2U6bW92ZSc6IHRoaXMuX2xpc3RlbmVycy5tb3VzZW1vdmUsXG4gICAgICAgICAgICAnbW91c2U6dXAnOiB0aGlzLl9saXN0ZW5lcnMubW91c2V1cFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogb25Nb3VzZW1vdmUgaGFuZGxlciBpbiBmYWJyaWMgY2FudmFzXG4gICAgICogQHBhcmFtIHt7dGFyZ2V0OiBmYWJyaWMuT2JqZWN0LCBlOiBNb3VzZUV2ZW50fX0gZkV2ZW50IC0gRmFicmljIGV2ZW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfb25GYWJyaWNNb3VzZU1vdmU6IGZ1bmN0aW9uKGZFdmVudCkge1xuICAgICAgICB2YXIgY2FudmFzID0gdGhpcy5nZXRDYW52YXMoKTtcbiAgICAgICAgdmFyIHBvaW50ZXIgPSBjYW52YXMuZ2V0UG9pbnRlcihmRXZlbnQuZSk7XG4gICAgICAgIHZhciB4ID0gcG9pbnRlci54O1xuICAgICAgICB2YXIgeSA9IHBvaW50ZXIueTtcbiAgICAgICAgdmFyIGNyb3B6b25lID0gdGhpcy5fY3JvcHpvbmU7XG5cbiAgICAgICAgaWYgKGFicyh4IC0gdGhpcy5fc3RhcnRYKSArIGFicyh5IC0gdGhpcy5fc3RhcnRZKSA+IE1PVVNFX01PVkVfVEhSRVNIT0xEKSB7XG4gICAgICAgICAgICBjcm9wem9uZS5yZW1vdmUoKTtcbiAgICAgICAgICAgIGNyb3B6b25lLnNldCh0aGlzLl9jYWxjUmVjdERpbWVuc2lvbkZyb21Qb2ludCh4LCB5KSk7XG5cbiAgICAgICAgICAgIGNhbnZhcy5hZGQoY3JvcHpvbmUpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCByZWN0IGRpbWVuc2lvbiBzZXR0aW5nIGZyb20gQ2FudmFzLU1vdXNlLVBvc2l0aW9uKHgsIHkpXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHggLSBDYW52YXMtTW91c2UtUG9zaXRpb24geFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB5IC0gQ2FudmFzLU1vdXNlLVBvc2l0aW9uIFlcbiAgICAgKiBAcmV0dXJucyB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXIsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jYWxjUmVjdERpbWVuc2lvbkZyb21Qb2ludDogZnVuY3Rpb24oeCwgeSkge1xuICAgICAgICB2YXIgY2FudmFzID0gdGhpcy5nZXRDYW52YXMoKTtcbiAgICAgICAgdmFyIHdpZHRoID0gY2FudmFzLmdldFdpZHRoKCk7XG4gICAgICAgIHZhciBoZWlnaHQgPSBjYW52YXMuZ2V0SGVpZ2h0KCk7XG4gICAgICAgIHZhciBzdGFydFggPSB0aGlzLl9zdGFydFg7XG4gICAgICAgIHZhciBzdGFydFkgPSB0aGlzLl9zdGFydFk7XG4gICAgICAgIHZhciBsZWZ0ID0gY2xhbXAoeCwgMCwgc3RhcnRYKTtcbiAgICAgICAgdmFyIHRvcCA9IGNsYW1wKHksIDAsIHN0YXJ0WSk7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGxlZnQ6IGxlZnQsXG4gICAgICAgICAgICB0b3A6IHRvcCxcbiAgICAgICAgICAgIHdpZHRoOiBjbGFtcCh4LCBzdGFydFgsIHdpZHRoKSAtIGxlZnQsIC8vIChzdGFydFggPD0geChtb3VzZSkgPD0gY2FudmFzV2lkdGgpIC0gbGVmdCxcbiAgICAgICAgICAgIGhlaWdodDogY2xhbXAoeSwgc3RhcnRZLCBoZWlnaHQpIC0gdG9wIC8vIChzdGFydFkgPD0geShtb3VzZSkgPD0gY2FudmFzSGVpZ2h0KSAtIHRvcFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBvbk1vdXNldXAgaGFuZGxlciBpbiBmYWJyaWMgY2FudmFzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfb25GYWJyaWNNb3VzZVVwOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGNyb3B6b25lID0gdGhpcy5fY3JvcHpvbmU7XG4gICAgICAgIHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnM7XG4gICAgICAgIHZhciBjYW52YXMgPSB0aGlzLmdldENhbnZhcygpO1xuXG4gICAgICAgIGNhbnZhcy5zZXRBY3RpdmVPYmplY3QoY3JvcHpvbmUpO1xuICAgICAgICBjYW52YXMub2ZmKHtcbiAgICAgICAgICAgICdtb3VzZTptb3ZlJzogbGlzdGVuZXJzLm1vdXNlbW92ZSxcbiAgICAgICAgICAgICdtb3VzZTp1cCc6IGxpc3RlbmVycy5tb3VzZXVwXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgY3JvcHBlZCBpbWFnZSBkYXRhXG4gICAgICogQHJldHVybnMgez97aW1hZ2VOYW1lOiBzdHJpbmcsIHVybDogc3RyaW5nfX0gY3JvcHBlZCBJbWFnZSBkYXRhXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0Q3JvcHBlZEltYWdlRGF0YTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjcm9wem9uZSA9IHRoaXMuX2Nyb3B6b25lO1xuICAgICAgICB2YXIgY3JvcEluZm87XG5cbiAgICAgICAgaWYgKCFjcm9wem9uZS5pc1ZhbGlkKCkpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgY3JvcEluZm8gPSB7XG4gICAgICAgICAgICBsZWZ0OiBjcm9wem9uZS5nZXRMZWZ0KCksXG4gICAgICAgICAgICB0b3A6IGNyb3B6b25lLmdldFRvcCgpLFxuICAgICAgICAgICAgd2lkdGg6IGNyb3B6b25lLmdldFdpZHRoKCksXG4gICAgICAgICAgICBoZWlnaHQ6IGNyb3B6b25lLmdldEhlaWdodCgpXG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGltYWdlTmFtZTogdGhpcy5nZXRJbWFnZU5hbWUoKSxcbiAgICAgICAgICAgIHVybDogdGhpcy5nZXRDYW52YXMoKS50b0RhdGFVUkwoY3JvcEluZm8pXG4gICAgICAgIH07XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQ3JvcHBlcjtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIENvbXBvbmVudCA9IHJlcXVpcmUoJy4uL2ludGVyZmFjZS9jb21wb25lbnQnKTtcbnZhciBjb25zdHMgPSByZXF1aXJlKCcuLi9jb25zdHMnKTtcblxudmFyIGNyb3NzT3JpZ2luID0ge2Nyb3NzT3JpZ2luOiAnJ307XG52YXIgY3NzT25seSA9IHtjc3NPbmx5OiB0cnVlfTtcbnZhciBiYWNrc3RvcmVPbmx5ID0ge2JhY2tzdG9yZU9ubHk6IHRydWV9O1xuXG4vKipcbiAqIEltYWdlTG9hZGVyIGNvbXBvbmVudHNcbiAqIEBleHRlbmRzIHtDb21wb25lbnR9XG4gKiBAY2xhc3MgSW1hZ2VMb2FkZXJcbiAqIEBwYXJhbSB7Q29tcG9uZW50fSBwYXJlbnQgLSBwYXJlbnQgY29tcG9uZW50XG4gKi9cbnZhciBJbWFnZUxvYWRlciA9IHR1aS51dGlsLmRlZmluZUNsYXNzKENvbXBvbmVudCwgLyogQGxlbmRzIEltYWdlTG9hZGVyLnByb3RvdHlwZSAqL3tcbiAgICBpbml0OiBmdW5jdGlvbihwYXJlbnQpIHtcbiAgICAgICAgdGhpcy5zZXRQYXJlbnQocGFyZW50KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ29tcG9uZW50IG5hbWVcbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAqL1xuICAgIG5hbWU6IGNvbnN0cy5jb21wb25lbnROYW1lcy5JTUFHRV9MT0FERVIsXG5cbiAgICAvKipcbiAgICAgKiBMb2FkIGltYWdlIGZyb20gdXJsXG4gICAgICogQHBhcmFtIHs/c3RyaW5nfSBpbWFnZU5hbWUgLSBGaWxlIG5hbWVcbiAgICAgKiBAcGFyYW0gez8oZmFicmljLkltYWdlfHN0cmluZyl9IGltZyAtIGZhYnJpYy5JbWFnZSBpbnN0YW5jZSBvciBVUkwgb2YgYW4gaW1hZ2VcbiAgICAgKiBAcmV0dXJucyB7alF1ZXJ5LkRlZmVycmVkfSBkZWZlcnJlZFxuICAgICAqL1xuICAgIGxvYWQ6IGZ1bmN0aW9uKGltYWdlTmFtZSwgaW1nKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdmFyIGRmZDtcblxuICAgICAgICBpZiAoIWltYWdlTmFtZSAmJiAhaW1nKSB7IC8vIEJhY2sgdG8gdGhlIGluaXRpYWwgc3RhdGUsIG5vdCBlcnJvci5cbiAgICAgICAgICAgIHRoaXMuZ2V0Q2FudmFzKCkuYmFja2dyb3VuZEltYWdlID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMuZ2V0Q2FudmFzKCkucmVuZGVyQWxsKCk7XG5cbiAgICAgICAgICAgIGRmZCA9ICQuRGVmZXJyZWQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5zZXRDYW52YXNJbWFnZSgnJywgbnVsbCk7XG4gICAgICAgICAgICB9KS5yZXNvbHZlKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkZmQgPSB0aGlzLl9zZXRCYWNrZ3JvdW5kSW1hZ2UoaW1nKS5kb25lKGZ1bmN0aW9uKG9JbWFnZSkge1xuICAgICAgICAgICAgICAgIHNlbGYuX29uU3VjY2Vzc0ltYWdlTG9hZChvSW1hZ2UpO1xuICAgICAgICAgICAgICAgIHNlbGYuc2V0Q2FudmFzSW1hZ2UoaW1hZ2VOYW1lLCBvSW1hZ2UpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZGZkO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgYmFja2dyb3VuZCBpbWFnZVxuICAgICAqIEBwYXJhbSB7PyhmYWJyaWMuSW1hZ2V8U3RyaW5nKX0gaW1nIGZhYnJpYy5JbWFnZSBpbnN0YW5jZSBvciBVUkwgb2YgYW4gaW1hZ2UgdG8gc2V0IGJhY2tncm91bmQgdG9cbiAgICAgKiBAcmV0dXJucyB7Kn1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXRCYWNrZ3JvdW5kSW1hZ2U6IGZ1bmN0aW9uKGltZykge1xuICAgICAgICB2YXIgZGZkID0gJC5EZWZlcnJlZCgpO1xuICAgICAgICB2YXIgY2FudmFzO1xuXG4gICAgICAgIGlmICghaW1nKSB7XG4gICAgICAgICAgICByZXR1cm4gZGZkLnJlamVjdCgpO1xuICAgICAgICB9XG4gICAgICAgIGNhbnZhcyA9IHRoaXMuZ2V0Q2FudmFzKCk7XG4gICAgICAgIGNhbnZhcy5zZXRCYWNrZ3JvdW5kSW1hZ2UoaW1nLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBvSW1hZ2UgPSBjYW52YXMuYmFja2dyb3VuZEltYWdlO1xuXG4gICAgICAgICAgICBpZiAob0ltYWdlLmdldEVsZW1lbnQoKSkge1xuICAgICAgICAgICAgICAgIGRmZC5yZXNvbHZlKG9JbWFnZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGRmZC5yZWplY3QoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgY3Jvc3NPcmlnaW4pO1xuXG4gICAgICAgIHJldHVybiBkZmQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIG9uU3VjY2VzcyBjYWxsYmFja1xuICAgICAqIEBwYXJhbSB7ZmFicmljLkltYWdlfSBvSW1hZ2UgLSBGYWJyaWMgaW1hZ2UgaW5zdGFuY2VcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9vblN1Y2Nlc3NJbWFnZUxvYWQ6IGZ1bmN0aW9uKG9JbWFnZSkge1xuICAgICAgICB2YXIgY2FudmFzID0gdGhpcy5nZXRDYW52YXMoKTtcbiAgICAgICAgdmFyIG1heFdpZHRoID0gTWF0aC5taW4oXG4gICAgICAgICAgICBNYXRoLmZsb29yKDEwMDApLFxuICAgICAgICAgICAgb0ltYWdlLndpZHRoXG4gICAgICAgICk7XG5cbiAgICAgICAgY2FudmFzLnNldERpbWVuc2lvbnMoe1xuICAgICAgICAgICAgbWFyZ2luOiAnYXV0bycsXG4gICAgICAgICAgICB3aWR0aDogJzEwMCUnLFxuICAgICAgICAgICAgaGVpZ2h0OiAnJywgIC8vIE5vIGlubGluZS1jc3MgXCJoZWlnaHRcIiBmb3IgSUU5XG4gICAgICAgICAgICAnbWF4LXdpZHRoJzogbWF4V2lkdGggKyAncHgnXG4gICAgICAgIH0sIGNzc09ubHkpO1xuXG4gICAgICAgIGNhbnZhcy5zZXREaW1lbnNpb25zKHtcbiAgICAgICAgICAgIHdpZHRoOiBvSW1hZ2Uud2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQ6IG9JbWFnZS5oZWlnaHRcbiAgICAgICAgfSwgYmFja3N0b3JlT25seSk7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gSW1hZ2VMb2FkZXI7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBDb21wb25lbnQgPSByZXF1aXJlKCcuLi9pbnRlcmZhY2UvY29tcG9uZW50Jyk7XG52YXIgY29uc3RzID0gcmVxdWlyZSgnLi4vY29uc3RzJyk7XG5cbi8qKlxuICogTWFpbiBjb21wb25lbnRcbiAqIEBleHRlbmRzIENvbXBvbmVudFxuICogQGNsYXNzXG4gKi9cbnZhciBNYWluID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoQ29tcG9uZW50LCAvKiBAbGVuZHMgTWFpbi5wcm90b3R5cGUgKi97XG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBGYWJyaWMgY2FudmFzIGluc3RhbmNlXG4gICAgICAgICAqIEB0eXBlIHtmYWJyaWMuQ2FudmFzfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5jYW52YXMgPSBudWxsO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBGYWJyaWMgaW1hZ2UgaW5zdGFuY2VcbiAgICAgICAgICogQHR5cGUge2ZhYnJpYy5JbWFnZX1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMub0ltYWdlID0gbnVsbDtcblxuICAgICAgICAvKipcbiAgICAgICAgICogSW1hZ2UgbmFtZVxuICAgICAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5pbWFnZU5hbWUgPSAnJztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ29tcG9uZW50IG5hbWVcbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAqL1xuICAgIG5hbWU6IGNvbnN0cy5jb21wb25lbnROYW1lcy5NQUlOLFxuXG4gICAgLyoqXG4gICAgICogVG8gZGF0YSB1cmwgZnJvbSBjYW52YXNcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZSAtIEEgRE9NU3RyaW5nIGluZGljYXRpbmcgdGhlIGltYWdlIGZvcm1hdC4gVGhlIGRlZmF1bHQgdHlwZSBpcyBpbWFnZS9wbmcuXG4gICAgICogQHJldHVybnMge3N0cmluZ30gQSBET01TdHJpbmcgY29udGFpbmluZyB0aGUgcmVxdWVzdGVkIGRhdGEgVVJJLlxuICAgICAqL1xuICAgIHRvRGF0YVVSTDogZnVuY3Rpb24odHlwZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5jYW52YXMgJiYgdGhpcy5jYW52YXMudG9EYXRhVVJMKHR5cGUpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTYXZlIGltYWdlKGJhY2tncm91bmQpIG9mIGNhbnZhc1xuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIC0gTmFtZSBvZiBpbWFnZVxuICAgICAqIEBwYXJhbSB7ZmFicmljLkltYWdlfSBvSW1hZ2UgLSBGYWJyaWMgaW1hZ2UgaW5zdGFuY2VcbiAgICAgKiBAb3ZlcnJpZGVcbiAgICAgKi9cbiAgICBzZXRDYW52YXNJbWFnZTogZnVuY3Rpb24obmFtZSwgb0ltYWdlKSB7XG4gICAgICAgIHRoaXMuaW1hZ2VOYW1lID0gbmFtZTtcbiAgICAgICAgdGhpcy5vSW1hZ2UgPSBvSW1hZ2U7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBjYW52YXMgZWxlbWVudCB0byBmYWJyaWMuQ2FudmFzXG4gICAgICogQHBhcmFtIHtqUXVlcnl8RWxlbWVudHxzdHJpbmd9IGNhbnZhc0VsZW1lbnQgLSBDYW52YXMgZWxlbWVudCBvciBzZWxlY3RvclxuICAgICAqIEBvdmVycmlkZVxuICAgICAqL1xuICAgIHNldENhbnZhc0VsZW1lbnQ6IGZ1bmN0aW9uKGNhbnZhc0VsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5jYW52YXMgPSBuZXcgZmFicmljLkNhbnZhcygkKGNhbnZhc0VsZW1lbnQpWzBdLCB7XG4gICAgICAgICAgICBjb250YWluZXJDbGFzczogJ3R1aS1jb21wb25lbnQtaW1hZ2VFZGl0b3ItY2FudmFzQ29udGFpbmVyJ1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBjYW52YXMgZWxlbWVudCBvZiBmYWJyaWMuQ2FudmFzW1tsb3dlci1jYW52YXNdXVxuICAgICAqIEByZXR1cm5zIHtIVE1MQ2FudmFzRWxlbWVudH1cbiAgICAgKiBAb3ZlcnJpZGVcbiAgICAgKi9cbiAgICBnZXRDYW52YXNFbGVtZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2FudmFzLmdldEVsZW1lbnQoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGZhYnJpYy5DYW52YXMgaW5zdGFuY2VcbiAgICAgKiBAb3ZlcnJpZGVcbiAgICAgKiBAcmV0dXJucyB7ZmFicmljLkNhbnZhc31cbiAgICAgKi9cbiAgICBnZXRDYW52YXM6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jYW52YXM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBjYW52YXNJbWFnZSAoZmFicmljLkltYWdlIGluc3RhbmNlKVxuICAgICAqIEBvdmVycmlkZVxuICAgICAqIEByZXR1cm5zIHtmYWJyaWMuSW1hZ2V9XG4gICAgICovXG4gICAgZ2V0Q2FudmFzSW1hZ2U6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5vSW1hZ2U7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBpbWFnZSBuYW1lXG4gICAgICogQG92ZXJyaWRlXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBnZXRJbWFnZU5hbWU6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pbWFnZU5hbWU7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gTWFpbjtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgY29tcG9uZW50TmFtZXM6IHV0aWwua2V5TWlycm9yKFxuICAgICAgICAnTUFJTicsXG4gICAgICAgICdJTUFHRV9MT0FERVInLFxuICAgICAgICAnQ1JPUFBFUidcbiAgICApLFxuXG4gICAgZXZlbnROYW1lczoge1xuICAgICAgICBMT0FEX0lNQUdFOiAnbG9hZEltYWdlJyxcbiAgICAgICAgQ0xFQVJfSU1BR0U6ICdjbGVhckltYWdlJyxcbiAgICAgICAgU1RBUlRfQ1JPUFBJTkc6ICdzdGFydENyb3BwaW5nJyxcbiAgICAgICAgRU5EX0NST1BQSU5HOiAnZW5kQ3JvcHBpbmcnLFxuICAgICAgICBFTVBUWV9SRURPX1NUQUNLOiAnZW1wdHlSZWRvU3RhY2snLFxuICAgICAgICBFTVBUWV9VTkRPX1NUQUNLOiAnZW1wdHlVbmRvU3RhY2snLFxuICAgICAgICBQVVNIX1VORE9fU1RBQ0s6ICdwdXNoVW5kb1N0YWNrJyxcbiAgICAgICAgUFVTSF9SRURPX1NUQUNLOiAncHVzaFJlZG9TdGFjaydcbiAgICB9LFxuXG4gICAgSVNfU1VQUE9SVF9GSUxFX0FQSTogISEod2luZG93LkZpbGUgJiYgd2luZG93LkZpbGVMaXN0ICYmIHdpbmRvdy5GaWxlUmVhZGVyKVxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGNsYW1wID0gcmVxdWlyZSgnLi4vdXRpbCcpLmNsYW1wO1xuXG52YXIgQ09STkVSX1RZUEVfVE9QX0xFRlQgPSAndGwnO1xudmFyIENPUk5FUl9UWVBFX1RPUF9SSUdIVCA9ICd0cic7XG52YXIgQ09STkVSX1RZUEVfTUlERExFX1RPUCA9ICdtdCc7XG52YXIgQ09STkVSX1RZUEVfTUlERExFX0xFRlQgPSAnbWwnO1xudmFyIENPUk5FUl9UWVBFX01JRERMRV9SSUdIVCA9ICdtcic7XG52YXIgQ09STkVSX1RZUEVfTUlERExFX0JPVFRPTSA9ICdtYic7XG52YXIgQ09STkVSX1RZUEVfQk9UVE9NX0xFRlQgPSAnYmwnO1xudmFyIENPUk5FUl9UWVBFX0JPVFRPTV9SSUdIVCA9ICdicic7XG5cbi8qKlxuICogQ3JvcHpvbmUgb2JqZWN0XG4gKiBJc3N1ZTogSUU3LCA4KHdpdGggZXhjYW52YXMpXG4gKiAgLSBDcm9wem9uZSBpcyBhIGJsYWNrIHpvbmUgd2l0aG91dCB0cmFuc3BhcmVuY3kuXG4gKiBAY2xhc3MgQ3JvcHpvbmVcbiAqIEBleHRlbmRzIHtmYWJyaWMuUmVjdH1cbiAqL1xudmFyIENyb3B6b25lID0gZmFicmljLnV0aWwuY3JlYXRlQ2xhc3MoZmFicmljLlJlY3QsIHtcbiAgICAvKipcbiAgICAgKiBDb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc10gT3B0aW9ucyBvYmplY3RcbiAgICAgKiBAb3ZlcnJpZGVcbiAgICAgKi9cbiAgICBpbml0aWFsaXplOiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICAgIHRoaXMuY2FsbFN1cGVyKCdpbml0aWFsaXplJywgb3B0aW9ucyk7XG4gICAgICAgIHRoaXMub24oe1xuICAgICAgICAgICAgJ21vdmluZyc6IHRoaXMuX29uTW92aW5nLFxuICAgICAgICAgICAgJ3NjYWxpbmcnOiB0aGlzLl9vblNjYWxpbmdcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBDcm9wLXpvbmVcbiAgICAgKiBAcGFyYW0ge0NhbnZhc1JlbmRlcmluZ0NvbnRleHQyRH0gY3R4IC0gQ29udGV4dFxuICAgICAqIEBwcml2YXRlXG4gICAgICogQG92ZXJyaWRlXG4gICAgICovXG4gICAgX3JlbmRlcjogZnVuY3Rpb24oY3R4KSB7XG4gICAgICAgIHZhciBvcmlnaW5hbEZsaXBYLCBvcmlnaW5hbEZsaXBZLFxuICAgICAgICAgICAgb3JpZ2luYWxTY2FsZVgsIG9yaWdpbmFsU2NhbGVZLFxuICAgICAgICAgICAgY3JvcHpvbmVEYXNoTGluZVdpZHRoID0gNyxcbiAgICAgICAgICAgIGNyb3B6b25lRGFzaExpbmVPZmZzZXQgPSA3O1xuICAgICAgICB0aGlzLmNhbGxTdXBlcignX3JlbmRlcicsIGN0eCk7XG5cbiAgICAgICAgLy8gQ2FsYyBvcmlnaW5hbCBzY2FsZVxuICAgICAgICBvcmlnaW5hbEZsaXBYID0gdGhpcy5mbGlwWCA/IC0xIDogMTtcbiAgICAgICAgb3JpZ2luYWxGbGlwWSA9IHRoaXMuZmxpcFkgPyAtMSA6IDE7XG4gICAgICAgIG9yaWdpbmFsU2NhbGVYID0gb3JpZ2luYWxGbGlwWCAvIHRoaXMuc2NhbGVYO1xuICAgICAgICBvcmlnaW5hbFNjYWxlWSA9IG9yaWdpbmFsRmxpcFkgLyB0aGlzLnNjYWxlWTtcblxuICAgICAgICAvLyBTZXQgb3JpZ2luYWwgc2NhbGVcbiAgICAgICAgY3R4LnNjYWxlKG9yaWdpbmFsU2NhbGVYLCBvcmlnaW5hbFNjYWxlWSk7XG5cbiAgICAgICAgLy8gUmVuZGVyIG91dGVyIHJlY3RcbiAgICAgICAgdGhpcy5fZmlsbE91dGVyUmVjdChjdHgsICdyZ2JhKDAsIDAsIDAsIDAuNTUpJyk7XG5cbiAgICAgICAgLy8gQmxhY2sgZGFzaCBsaW5lXG4gICAgICAgIHRoaXMuX3N0cm9rZUJvcmRlcihjdHgsICdyZ2IoMCwgMCwgMCknLCBjcm9wem9uZURhc2hMaW5lV2lkdGgpO1xuXG4gICAgICAgIC8vIFdoaXRlIGRhc2ggbGluZVxuICAgICAgICB0aGlzLl9zdHJva2VCb3JkZXIoY3R4LCAncmdiKDI1NSwgMjU1LCAyNTUpJywgY3JvcHpvbmVEYXNoTGluZVdpZHRoLCBjcm9wem9uZURhc2hMaW5lT2Zmc2V0KTtcblxuICAgICAgICAvLyBSZXNldCBzY2FsZVxuICAgICAgICBjdHguc2NhbGUoMSAvIG9yaWdpbmFsU2NhbGVYLCAxIC8gb3JpZ2luYWxTY2FsZVkpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDcm9wem9uZS1jb29yZGluYXRlcyB3aXRoIG91dGVyIHJlY3RhbmdsZVxuICAgICAqXG4gICAgICogICAgIHgwICAgICB4MSAgICAgICAgIHgyICAgICAgeDNcbiAgICAgKiAgeTAgKy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tK1xuICAgICAqICAgICB8Ly8vLy8vL3wvLy8vLy8vLy8vfC8vLy8vLy98ICAgIC8vIDwtLS0gXCJPdXRlci1yZWN0YW5nbGVcIlxuICAgICAqICAgICB8Ly8vLy8vL3wvLy8vLy8vLy8vfC8vLy8vLy98XG4gICAgICogIHkxICstLS0tLS0tKy0tLS0tLS0tLS0rLS0tLS0tLStcbiAgICAgKiAgICAgfC8vLy8vLy98IENyb3B6b25lIHwvLy8vLy8vfCAgICBDcm9wem9uZSBpcyB0aGUgXCJJbm5lci1yZWN0YW5nbGVcIlxuICAgICAqICAgICB8Ly8vLy8vL3wgICgwLCAwKSAgfC8vLy8vLy98ICAgIENlbnRlciBwb2ludCAoMCwgMClcbiAgICAgKiAgeTIgKy0tLS0tLS0rLS0tLS0tLS0tLSstLS0tLS0tK1xuICAgICAqICAgICB8Ly8vLy8vL3wvLy8vLy8vLy8vfC8vLy8vLy98XG4gICAgICogICAgIHwvLy8vLy8vfC8vLy8vLy8vLy98Ly8vLy8vL3xcbiAgICAgKiAgeTMgKy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tK1xuICAgICAqXG4gICAgICogQHR5cGVkZWYge3t4OiBBcnJheTxudW1iZXI+LCB5OiBBcnJheTxudW1iZXI+fX0gY3JvcHpvbmVDb29yZGluYXRlc1xuICAgICAqL1xuXG4gICAgLyoqXG4gICAgICogRmlsbCBvdXRlciByZWN0YW5nbGVcbiAgICAgKiBAcGFyYW0ge0NhbnZhc1JlbmRlcmluZ0NvbnRleHQyRH0gY3R4IC0gQ29udGV4dFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfENhbnZhc0dyYWRpZW50fENhbnZhc1BhdHRlcm59IGZpbGxTdHlsZSAtIEZpbGwtc3R5bGVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9maWxsT3V0ZXJSZWN0OiBmdW5jdGlvbihjdHgsIGZpbGxTdHlsZSkge1xuICAgICAgICB2YXIgY29vcmRpbmF0ZXMgPSB0aGlzLl9nZXRDb29yZGluYXRlcyhjdHgpLFxuICAgICAgICAgICAgeCA9IGNvb3JkaW5hdGVzLngsXG4gICAgICAgICAgICB5ID0gY29vcmRpbmF0ZXMueTtcblxuICAgICAgICBjdHguc2F2ZSgpO1xuICAgICAgICBjdHguZmlsbFN0eWxlID0gZmlsbFN0eWxlO1xuICAgICAgICBjdHguYmVnaW5QYXRoKCk7XG5cbiAgICAgICAgLy8gT3V0ZXIgcmVjdGFuZ2xlXG4gICAgICAgIC8vIE51bWJlcnMgYXJlICsvLTEgc28gdGhhdCBvdmVybGF5IGVkZ2VzIGRvbid0IGdldCBibHVycnkuXG4gICAgICAgIGN0eC5tb3ZlVG8oeFswXSAtIDEsIHlbMF0gLSAxKTtcbiAgICAgICAgY3R4LmxpbmVUbyh4WzNdICsgMSwgeVswXSAtIDEpO1xuICAgICAgICBjdHgubGluZVRvKHhbM10gKyAxLCB5WzNdICsgMSk7XG4gICAgICAgIGN0eC5saW5lVG8oeFswXSAtIDEsIHlbM10gLSAxKTtcbiAgICAgICAgY3R4LmxpbmVUbyh4WzBdIC0gMSwgeVswXSAtIDEpO1xuICAgICAgICBjdHguY2xvc2VQYXRoKCk7XG5cbiAgICAgICAgLy8gSW5uZXIgcmVjdGFuZ2xlXG4gICAgICAgIGN0eC5tb3ZlVG8oeFsxXSwgeVsxXSk7XG4gICAgICAgIGN0eC5saW5lVG8oeFsxXSwgeVsyXSk7XG4gICAgICAgIGN0eC5saW5lVG8oeFsyXSwgeVsyXSk7XG4gICAgICAgIGN0eC5saW5lVG8oeFsyXSwgeVsxXSk7XG4gICAgICAgIGN0eC5saW5lVG8oeFsxXSwgeVsxXSk7XG4gICAgICAgIGN0eC5jbG9zZVBhdGgoKTtcblxuICAgICAgICBjdHguZmlsbCgpO1xuICAgICAgICBjdHgucmVzdG9yZSgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgY29vcmRpbmF0ZXNcbiAgICAgKiBAcGFyYW0ge0NhbnZhc1JlbmRlcmluZ0NvbnRleHQyRH0gY3R4IC0gQ29udGV4dFxuICAgICAqIEByZXR1cm5zIHtjcm9wem9uZUNvb3JkaW5hdGVzfSAtIHtAbGluayBjcm9wem9uZUNvb3JkaW5hdGVzfVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldENvb3JkaW5hdGVzOiBmdW5jdGlvbihjdHgpIHtcbiAgICAgICAgdmFyIGNlaWwgPSBNYXRoLmNlaWwsXG4gICAgICAgICAgICB3aWR0aCA9IHRoaXMuZ2V0V2lkdGgoKSxcbiAgICAgICAgICAgIGhlaWdodCA9IHRoaXMuZ2V0SGVpZ2h0KCksXG4gICAgICAgICAgICBoYWxmV2lkdGggPSB3aWR0aCAvIDIsXG4gICAgICAgICAgICBoYWxmSGVpZ2h0ID0gaGVpZ2h0IC8gMixcbiAgICAgICAgICAgIGxlZnQgPSB0aGlzLmdldExlZnQoKSxcbiAgICAgICAgICAgIHRvcCA9IHRoaXMuZ2V0VG9wKCksXG4gICAgICAgICAgICBjYW52YXNFbCA9IGN0eC5jYW52YXM7IC8vIGNhbnZhcyBlbGVtZW50LCBub3QgZmFicmljIG9iamVjdFxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB4OiB0dWkudXRpbC5tYXAoW1xuICAgICAgICAgICAgICAgIC0oaGFsZldpZHRoICsgbGVmdCksICAgICAgICAgICAgICAgICAgICAgICAgLy8geDBcbiAgICAgICAgICAgICAgICAtKGhhbGZXaWR0aCksICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHgxXG4gICAgICAgICAgICAgICAgaGFsZldpZHRoLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB4MlxuICAgICAgICAgICAgICAgIGhhbGZXaWR0aCArIChjYW52YXNFbC53aWR0aCAtIGxlZnQgLSB3aWR0aCkgLy8geDNcbiAgICAgICAgICAgIF0sIGNlaWwpLFxuICAgICAgICAgICAgeTogdHVpLnV0aWwubWFwKFtcbiAgICAgICAgICAgICAgICAtKGhhbGZIZWlnaHQgKyB0b3ApLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB5MFxuICAgICAgICAgICAgICAgIC0oaGFsZkhlaWdodCksICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHkxXG4gICAgICAgICAgICAgICAgaGFsZkhlaWdodCwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8geTJcbiAgICAgICAgICAgICAgICBoYWxmSGVpZ2h0ICsgKGNhbnZhc0VsLmhlaWdodCAtIHRvcCAtIGhlaWdodCkgICAvLyB5M1xuICAgICAgICAgICAgXSwgY2VpbClcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU3Ryb2tlIGJvcmRlclxuICAgICAqIEBwYXJhbSB7Q2FudmFzUmVuZGVyaW5nQ29udGV4dDJEfSBjdHggLSBDb250ZXh0XG4gICAgICogQHBhcmFtIHtzdHJpbmd8Q2FudmFzR3JhZGllbnR8Q2FudmFzUGF0dGVybn0gc3Ryb2tlU3R5bGUgLSBTdHJva2Utc3R5bGVcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbGluZURhc2hXaWR0aCAtIERhc2ggd2lkdGhcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW2xpbmVEYXNoT2Zmc2V0XSAtIERhc2ggb2Zmc2V0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc3Ryb2tlQm9yZGVyOiBmdW5jdGlvbihjdHgsIHN0cm9rZVN0eWxlLCBsaW5lRGFzaFdpZHRoLCBsaW5lRGFzaE9mZnNldCkge1xuICAgICAgICB2YXIgaGFsZldpZHRoID0gdGhpcy5nZXRXaWR0aCgpIC8gMixcbiAgICAgICAgICAgIGhhbGZIZWlnaHQgPSB0aGlzLmdldEhlaWdodCgpIC8gMjtcblxuICAgICAgICBjdHguc2F2ZSgpO1xuICAgICAgICBjdHguc3Ryb2tlU3R5bGUgPSBzdHJva2VTdHlsZTtcbiAgICAgICAgaWYgKGN0eC5zZXRMaW5lRGFzaCkge1xuICAgICAgICAgICAgY3R4LnNldExpbmVEYXNoKFtsaW5lRGFzaFdpZHRoLCBsaW5lRGFzaFdpZHRoXSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGxpbmVEYXNoT2Zmc2V0KSB7XG4gICAgICAgICAgICBjdHgubGluZURhc2hPZmZzZXQgPSBsaW5lRGFzaE9mZnNldDtcbiAgICAgICAgfVxuXG4gICAgICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgY3R4Lm1vdmVUbygtaGFsZldpZHRoLCAtaGFsZkhlaWdodCk7XG4gICAgICAgIGN0eC5saW5lVG8oaGFsZldpZHRoLCAtaGFsZkhlaWdodCk7XG4gICAgICAgIGN0eC5saW5lVG8oaGFsZldpZHRoLCBoYWxmSGVpZ2h0KTtcbiAgICAgICAgY3R4LmxpbmVUbygtaGFsZldpZHRoLCBoYWxmSGVpZ2h0KTtcbiAgICAgICAgY3R4LmxpbmVUbygtaGFsZldpZHRoLCAtaGFsZkhlaWdodCk7XG4gICAgICAgIGN0eC5zdHJva2UoKTtcblxuICAgICAgICBjdHgucmVzdG9yZSgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBvbk1vdmluZyBldmVudCBsaXN0ZW5lclxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX29uTW92aW5nOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGNhbnZhcyA9IHRoaXMuY2FudmFzLFxuICAgICAgICAgICAgbGVmdCA9IHRoaXMuZ2V0TGVmdCgpLFxuICAgICAgICAgICAgdG9wID0gdGhpcy5nZXRUb3AoKSxcbiAgICAgICAgICAgIHdpZHRoID0gdGhpcy5nZXRXaWR0aCgpLFxuICAgICAgICAgICAgaGVpZ2h0ID0gdGhpcy5nZXRIZWlnaHQoKSxcbiAgICAgICAgICAgIG1heExlZnQgPSBjYW52YXMuZ2V0V2lkdGgoKSAtIHdpZHRoLFxuICAgICAgICAgICAgbWF4VG9wID0gY2FudmFzLmdldEhlaWdodCgpIC0gaGVpZ2h0O1xuXG4gICAgICAgIHRoaXMuc2V0TGVmdChjbGFtcChsZWZ0LCAwLCBtYXhMZWZ0KSk7XG4gICAgICAgIHRoaXMuc2V0VG9wKGNsYW1wKHRvcCwgMCwgbWF4VG9wKSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIG9uU2NhbGluZyBldmVudCBsaXN0ZW5lclxuICAgICAqIEBwYXJhbSB7e2U6IE1vdXNlRXZlbnR9fSBmRXZlbnQgLSBGYWJyaWMgZXZlbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9vblNjYWxpbmc6IGZ1bmN0aW9uKGZFdmVudCkge1xuICAgICAgICB2YXIgcG9pbnRlciA9IHRoaXMuY2FudmFzLmdldFBvaW50ZXIoZkV2ZW50LmUpLFxuICAgICAgICAgICAgc2V0dGluZ3MgPSB0aGlzLl9jYWxjU2NhbGluZ1NpemVGcm9tUG9pbnRlcihwb2ludGVyKTtcblxuICAgICAgICAvLyBPbiBzY2FsaW5nIGNyb3B6b25lLFxuICAgICAgICAvLyBjaGFuZ2UgcmVhbCB3aWR0aCBhbmQgaGVpZ2h0IGFuZCBmaXggc2NhbGVGYWN0b3IgdG8gMVxuICAgICAgICB0aGlzLnNjYWxlKDEpLnNldChzZXR0aW5ncyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENhbGMgc2NhbGVkIHNpemUgZnJvbSBtb3VzZSBwb2ludGVyIHdpdGggc2VsZWN0ZWQgY29ybmVyXG4gICAgICogQHBhcmFtIHt7eDogbnVtYmVyLCB5OiBudW1iZXJ9fSBwb2ludGVyIC0gTW91c2UgcG9zaXRpb25cbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSBIYXZpbmcgbGVmdCBvcihhbmQpIHRvcCBvcihhbmQpIHdpZHRoIG9yKGFuZCkgaGVpZ2h0LlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2NhbGNTY2FsaW5nU2l6ZUZyb21Qb2ludGVyOiBmdW5jdGlvbihwb2ludGVyKSB7XG4gICAgICAgIHZhciBwb2ludGVyWCA9IHBvaW50ZXIueCxcbiAgICAgICAgICAgIHBvaW50ZXJZID0gcG9pbnRlci55LFxuICAgICAgICAgICAgdGxTY2FsaW5nU2l6ZSA9IHRoaXMuX2NhbGNUb3BMZWZ0U2NhbGluZ1NpemVGcm9tUG9pbnRlcihwb2ludGVyWCwgcG9pbnRlclkpLFxuICAgICAgICAgICAgYnJTY2FsaW5nU2l6ZSA9IHRoaXMuX2NhbGNCb3R0b21SaWdodFNjYWxpbmdTaXplRnJvbVBvaW50ZXIocG9pbnRlclgsIHBvaW50ZXJZKTtcblxuICAgICAgICAvKlxuICAgICAgICAgKiBAdG9kbzog7J2867CYIOqwneyytOyXkOyEnCBzaGlmdCDsobDtlantgqTrpbwg64iE66W066m0IGZyZWUgc2l6ZSBzY2FsaW5n7J20IOuQqCAtLT4g7ZmV7J247ZW067O86rKDXG4gICAgICAgICAqICAgICAgY2FudmFzLmNsYXNzLmpzIC8vIF9zY2FsZU9iamVjdDogZnVuY3Rpb24oLi4uKXsuLi59XG4gICAgICAgICAqL1xuICAgICAgICByZXR1cm4gdGhpcy5fbWFrZVNjYWxpbmdTZXR0aW5ncyh0bFNjYWxpbmdTaXplLCBiclNjYWxpbmdTaXplKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2FsYyBzY2FsaW5nIHNpemUocG9zaXRpb24gKyBkaW1lbnNpb24pIGZyb20gbGVmdC10b3AgY29ybmVyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHggLSBNb3VzZSBwb3NpdGlvbiBYXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHkgLSBNb3VzZSBwb3NpdGlvbiBZXG4gICAgICogQHJldHVybnMge3t0b3A6IG51bWJlciwgbGVmdDogbnVtYmVyLCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfY2FsY1RvcExlZnRTY2FsaW5nU2l6ZUZyb21Qb2ludGVyOiBmdW5jdGlvbih4LCB5KSB7XG4gICAgICAgIHZhciBib3R0b20gPSB0aGlzLmdldEhlaWdodCgpICsgdGhpcy50b3AsXG4gICAgICAgICAgICByaWdodCA9IHRoaXMuZ2V0V2lkdGgoKSArIHRoaXMubGVmdCxcbiAgICAgICAgICAgIHRvcCA9IGNsYW1wKHksIDAsIGJvdHRvbSAtIDEpLCAgLy8gMCA8PSB0b3AgPD0gKGJvdHRvbSAtIDEpXG4gICAgICAgICAgICBsZWZ0ID0gY2xhbXAoeCwgMCwgcmlnaHQgLSAxKTsgIC8vIDAgPD0gbGVmdCA8PSAocmlnaHQgLSAxKVxuXG4gICAgICAgIC8vIFdoZW4gc2NhbGluZyBcIlRvcC1MZWZ0IGNvcm5lclwiOiBJdCBmaXhlcyByaWdodCBhbmQgYm90dG9tIGNvb3JkaW5hdGVzXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0b3A6IHRvcCxcbiAgICAgICAgICAgIGxlZnQ6IGxlZnQsXG4gICAgICAgICAgICB3aWR0aDogcmlnaHQgLSBsZWZ0LFxuICAgICAgICAgICAgaGVpZ2h0OiBib3R0b20gLSB0b3BcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2FsYyBzY2FsaW5nIHNpemUgZnJvbSByaWdodC1ib3R0b20gY29ybmVyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHggLSBNb3VzZSBwb3NpdGlvbiBYXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHkgLSBNb3VzZSBwb3NpdGlvbiBZXG4gICAgICogQHJldHVybnMge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfY2FsY0JvdHRvbVJpZ2h0U2NhbGluZ1NpemVGcm9tUG9pbnRlcjogZnVuY3Rpb24oeCwgeSkge1xuICAgICAgICB2YXIgY2FudmFzID0gdGhpcy5jYW52YXMsXG4gICAgICAgICAgICBtYXhYID0gY2FudmFzLndpZHRoLFxuICAgICAgICAgICAgbWF4WSA9IGNhbnZhcy5oZWlnaHQsXG4gICAgICAgICAgICBsZWZ0ID0gdGhpcy5sZWZ0LFxuICAgICAgICAgICAgdG9wID0gdGhpcy50b3A7XG5cbiAgICAgICAgLy8gV2hlbiBzY2FsaW5nIFwiQm90dG9tLVJpZ2h0IGNvcm5lclwiOiBJdCBmaXhlcyBsZWZ0IGFuZCB0b3AgY29vcmRpbmF0ZXNcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHdpZHRoOiBjbGFtcCh4LCAobGVmdCArIDEpLCBtYXhYKSAtIGxlZnQsICAgIC8vICh3aWR0aCA9IHggLSBsZWZ0KSwgKGxlZnQgKyAxIDw9IHggPD0gbWF4WClcbiAgICAgICAgICAgIGhlaWdodDogY2xhbXAoeSwgKHRvcCArIDEpLCBtYXhZKSAtIHRvcCAgICAgIC8vIChoZWlnaHQgPSB5IC0gdG9wKSwgKHRvcCArIDEgPD0geSA8PSBtYXhZKVxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKmVzbGludC1kaXNhYmxlIGNvbXBsZXhpdHkqL1xuICAgIC8qKlxuICAgICAqIE1ha2Ugc2NhbGluZyBzZXR0aW5nc1xuICAgICAqIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyLCBsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfX0gdGwgLSBUb3AtTGVmdCBzZXR0aW5nXG4gICAgICogQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBiciAtIEJvdHRvbS1SaWdodCBzZXR0aW5nXG4gICAgICogQHJldHVybnMge3t3aWR0aDogP251bWJlciwgaGVpZ2h0OiA/bnVtYmVyLCBsZWZ0OiA/bnVtYmVyLCB0b3A6ID9udW1iZXJ9fSBQb3NpdGlvbiBzZXR0aW5nXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZVNjYWxpbmdTZXR0aW5nczogZnVuY3Rpb24odGwsIGJyKSB7XG4gICAgICAgIHZhciB0bFdpZHRoID0gdGwud2lkdGgsXG4gICAgICAgICAgICB0bEhlaWdodCA9IHRsLmhlaWdodCxcbiAgICAgICAgICAgIGJySGVpZ2h0ID0gYnIuaGVpZ2h0LFxuICAgICAgICAgICAgYnJXaWR0aCA9IGJyLndpZHRoLFxuICAgICAgICAgICAgdGxMZWZ0ID0gdGwubGVmdCxcbiAgICAgICAgICAgIHRsVG9wID0gdGwudG9wLFxuICAgICAgICAgICAgc2V0dGluZ3M7XG5cbiAgICAgICAgc3dpdGNoICh0aGlzLl9fY29ybmVyKSB7XG4gICAgICAgICAgICBjYXNlIENPUk5FUl9UWVBFX1RPUF9MRUZUOlxuICAgICAgICAgICAgICAgIHNldHRpbmdzID0gdGw7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIENPUk5FUl9UWVBFX1RPUF9SSUdIVDpcbiAgICAgICAgICAgICAgICBzZXR0aW5ncyA9IHtcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IGJyV2lkdGgsXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogdGxIZWlnaHQsXG4gICAgICAgICAgICAgICAgICAgIHRvcDogdGxUb3BcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBDT1JORVJfVFlQRV9CT1RUT01fTEVGVDpcbiAgICAgICAgICAgICAgICBzZXR0aW5ncyA9IHtcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IHRsV2lkdGgsXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogYnJIZWlnaHQsXG4gICAgICAgICAgICAgICAgICAgIGxlZnQ6IHRsTGVmdFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIENPUk5FUl9UWVBFX0JPVFRPTV9SSUdIVDpcbiAgICAgICAgICAgICAgICBzZXR0aW5ncyA9IGJyO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBDT1JORVJfVFlQRV9NSURETEVfTEVGVDpcbiAgICAgICAgICAgICAgICBzZXR0aW5ncyA9IHtcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IHRsV2lkdGgsXG4gICAgICAgICAgICAgICAgICAgIGxlZnQ6IHRsTGVmdFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIENPUk5FUl9UWVBFX01JRERMRV9UT1A6XG4gICAgICAgICAgICAgICAgc2V0dGluZ3MgPSB7XG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogdGxIZWlnaHQsXG4gICAgICAgICAgICAgICAgICAgIHRvcDogdGxUb3BcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBDT1JORVJfVFlQRV9NSURETEVfUklHSFQ6XG4gICAgICAgICAgICAgICAgc2V0dGluZ3MgPSB7XG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiBicldpZHRoXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgQ09STkVSX1RZUEVfTUlERExFX0JPVFRPTTpcbiAgICAgICAgICAgICAgICBzZXR0aW5ncyA9IHtcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiBickhlaWdodFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHNldHRpbmdzO1xuICAgIH0sIC8qZXNsaW50LWVuYWJsZSBjb21wbGV4aXR5Ki9cblxuICAgIC8qKlxuICAgICAqIFJldHVybiB0aGUgd2hldGhlciB0aGlzIGNyb3B6b25lIGlzIHZhbGlkXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICovXG4gICAgaXNWYWxpZDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICB0aGlzLmxlZnQgPj0gMCAmJlxuICAgICAgICAgICAgdGhpcy50b3AgPj0gMCAmJlxuICAgICAgICAgICAgdGhpcy53aWR0aCA+IDAgJiZcbiAgICAgICAgICAgIHRoaXMuaGVpZ2h0ID4gMFxuICAgICAgICApO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENyb3B6b25lO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ29tbWFuZCA9IHJlcXVpcmUoJy4uL2ludGVyZmFjZS9jb21tYW5kJyk7XG52YXIgY29tcG9uZW50TmFtZXMgPSByZXF1aXJlKCcuLi9jb25zdHMnKS5jb21wb25lbnROYW1lcztcblxudmFyIElNQUdFX0xPQURFUiA9IGNvbXBvbmVudE5hbWVzLklNQUdFX0xPQURFUjtcblxuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ30gaW1hZ2VOYW1lIC0gSW1hZ2UgbmFtZVxuICogQHBhcmFtIHtzdHJpbmd9IHVybCAtIEltYWdlIHVybFxuICogQHJldHVybnMge0NvbW1hbmR9XG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUxvYWRDb21tYW5kKGltYWdlTmFtZSwgdXJsKSB7XG4gICAgcmV0dXJuIG5ldyBDb21tYW5kKHtcbiAgICAgICAgZXhlY3V0ZTogZnVuY3Rpb24oY29tcE1hcCkge1xuICAgICAgICAgICAgdmFyIGxvYWRlciA9IGNvbXBNYXBbSU1BR0VfTE9BREVSXTtcblxuICAgICAgICAgICAgdGhpcy5zdG9yZSA9IHtcbiAgICAgICAgICAgICAgICBwcmV2TmFtZTogbG9hZGVyLmdldEltYWdlTmFtZSgpLFxuICAgICAgICAgICAgICAgIHByZXZJbWFnZTogbG9hZGVyLmdldENhbnZhc0ltYWdlKClcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiBsb2FkZXIubG9hZChpbWFnZU5hbWUsIHVybCk7XG4gICAgICAgIH0sXG4gICAgICAgIHVuZG86IGZ1bmN0aW9uKGNvbXBNYXApIHtcbiAgICAgICAgICAgIHZhciBsb2FkZXIgPSBjb21wTWFwW0lNQUdFX0xPQURFUl07XG4gICAgICAgICAgICB2YXIgc3RvcmUgPSB0aGlzLnN0b3JlO1xuXG4gICAgICAgICAgICByZXR1cm4gbG9hZGVyLmxvYWQoc3RvcmUucHJldk5hbWUsIHN0b3JlLnByZXZJbWFnZSk7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgY3JlYXRlTG9hZENvbW1hbmQ6IGNyZWF0ZUxvYWRDb21tYW5kXG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIga2V5TWlycm9yID0gcmVxdWlyZSgnLi4vdXRpbCcpLmtleU1pcnJvcjtcblxudmFyIHR5cGVzID0ga2V5TWlycm9yKFxuICAgICdVTl9JTVBMRU1FTlRBVElPTicsXG4gICAgJ05PX0NPTVBPTkVOVF9OQU1FJyxcbiAgICAnVU5LTk9XTidcbik7XG5cbnZhciBtZXNzYWdlcyA9IHtcbiAgICBVTl9JTVBMRU1FTlRBVElPTjogJ1Nob3VsZCBpbXBsZW1lbnQgYSBtZXRob2Q6ICcsXG4gICAgTk9fQ09NUE9ORU5UX05BTUU6ICdTaG91bGQgc2V0IGEgY29tcG9uZW50IG5hbWUnLFxuICAgIFVOS05PV046ICdVbmtub3duOiAnXG59O1xuXG5cbnZhciBtYXAgPSB7XG4gICAgVU5fSU1QTEVNRU5UQVRJT046IGZ1bmN0aW9uKG1ldGhvZE5hbWUpIHtcbiAgICAgICAgcmV0dXJuIG1lc3NhZ2VzLlVOX0lNUExFTUVOVEFUSU9OICsgbWV0aG9kTmFtZTtcbiAgICB9LFxuXG4gICAgTk9fQ09NUE9ORU5UX05BTUU6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gbWVzc2FnZXMuTk9fQ09NUE9ORU5UX05BTUU7XG4gICAgfSxcblxuICAgIFVOS05PV046IGZ1bmN0aW9uKG1zZykge1xuICAgICAgICByZXR1cm4gbWVzc2FnZXMuVU5LTk9XTiArIG1zZztcbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICB0eXBlczogdHVpLnV0aWwuZXh0ZW5kKHt9LCB0eXBlcyksXG5cbiAgICBjcmVhdGU6IGZ1bmN0aW9uKHR5cGUpIHtcbiAgICAgICAgdmFyIGZ1bmM7XG5cbiAgICAgICAgdHlwZSA9IHR5cGUudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgZnVuYyA9IG1hcFt0eXBlXSB8fCBtYXAudW5rbm93bjtcbiAgICAgICAgQXJyYXkucHJvdG90eXBlLnNoaWZ0LmFwcGx5KGFyZ3VtZW50cyk7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmMuYXBwbHkobnVsbCwgYXJndW1lbnRzKTtcbiAgICB9XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgSW52b2tlciA9IHJlcXVpcmUoJy4vaW52b2tlcicpO1xudmFyIGNvbW1hbmRGYWN0b3J5ID0gcmVxdWlyZSgnLi9mYWN0b3J5L2NvbW1hbmQnKTtcbnZhciBjb25zdHMgPSByZXF1aXJlKCcuL2NvbnN0cycpO1xuXG52YXIgZXZlbnROYW1lcyA9IGNvbnN0cy5ldmVudE5hbWVzO1xudmFyIGNvbXBOYW1lcyA9IGNvbnN0cy5jb21wb25lbnROYW1lcztcblxuLyoqXG4gKiBJbWFnZSBlZGl0b3JcbiAqIEBjbGFzc1xuICogQHBhcmFtIHtzdHJpbmd8alF1ZXJ5fEhUTUxFbGVtZW50fSBjYW52YXNFbGVtZW50IC0gQ2FudmFzIGVsZW1lbnQgb3Igc2VsZWN0b3JcbiAqL1xudmFyIEltYWdlRWRpdG9yID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoLyogQGxlbmRzIEltYWdlRWRpdG9yLnByb3RvdHlwZSAqL3tcbiAgICBzdGF0aWM6IHtcbiAgICAgICAgZXZlbnROYW1lczogdHVpLnV0aWwuZXh0ZW5kKHt9LCBldmVudE5hbWVzKVxuICAgIH0sXG5cbiAgICBpbml0OiBmdW5jdGlvbihjYW52YXNFbGVtZW50KSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBJbm92a2VyXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEB0eXBlIHtJbnZva2VyfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5faW52b2tlciA9IG5ldyBJbnZva2VyKCk7XG5cbiAgICAgICAgdGhpcy5fc2V0Q2FudmFzRWxlbWVudCgkKGNhbnZhc0VsZW1lbnQpWzBdKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IGNhbnZhcyBlbGVtZW50XG4gICAgICogQHBhcmFtIHtqUXVlcnl8RWxlbWVudHxzdHJpbmd9IGNhbnZhc0VsZW1lbnQgLSBDYW52YXMgZWxlbWVudCBvciBzZWxlY3RvclxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NldENhbnZhc0VsZW1lbnQ6IGZ1bmN0aW9uKGNhbnZhc0VsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5faW52b2tlci5nZXQoY29tcE5hbWVzLk1BSU4pLnNldENhbnZhc0VsZW1lbnQoY2FudmFzRWxlbWVudCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENsZWFyIGFsbCBhY3Rpb25zXG4gICAgICovXG4gICAgY2xlYXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmVuZENyb3BwaW5nKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEludm9rZSBjb21tYW5kXG4gICAgICogQHBhcmFtIHtDb21tYW5kfSBjb21tYW5kIC0gQ29tbWFuZFxuICAgICAqL1xuICAgIGV4ZWN1dGU6IGZ1bmN0aW9uKGNvbW1hbmQpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgIHRoaXMuY2xlYXIoKTtcbiAgICAgICAgdGhpcy5faW52b2tlci5pbnZva2UoY29tbWFuZCkuZG9uZShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHNlbGYuZmlyZShldmVudE5hbWVzLlBVU0hfVU5ET19TVEFDSyk7XG4gICAgICAgICAgICBzZWxmLmZpcmUoZXZlbnROYW1lcy5FTVBUWV9SRURPX1NUQUNLKTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFVuZG9cbiAgICAgKi9cbiAgICB1bmRvOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGludm9rZXIgPSB0aGlzLl9pbnZva2VyO1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgdGhpcy5jbGVhcigpO1xuICAgICAgICBpbnZva2VyLnVuZG8oKS5kb25lKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKGludm9rZXIuaXNFbXB0eVVuZG9TdGFjaygpKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5maXJlKGV2ZW50TmFtZXMuRU1QVFlfVU5ET19TVEFDSyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzZWxmLmZpcmUoZXZlbnROYW1lcy5QVVNIX1JFRE9fU1RBQ0spO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVkb1xuICAgICAqL1xuICAgIHJlZG86IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgaW52b2tlciA9IHRoaXMuX2ludm9rZXI7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICB0aGlzLmNsZWFyKCk7XG4gICAgICAgIGludm9rZXIucmVkbygpLmRvbmUoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAoaW52b2tlci5pc0VtcHR5UmVkb1N0YWNrKCkpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmZpcmUoZXZlbnROYW1lcy5FTVBUWV9SRURPX1NUQUNLKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNlbGYuZmlyZShldmVudE5hbWVzLlBVU0hfVU5ET19TVEFDSyk7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBMb2FkIGltYWdlIGZyb20gZmlsZVxuICAgICAqIEBwYXJhbSB7RmlsZX0gaW1nRmlsZSAtIEltYWdlIGZpbGVcbiAgICAgKi9cbiAgICBsb2FkSW1hZ2VGcm9tRmlsZTogZnVuY3Rpb24oaW1nRmlsZSkge1xuICAgICAgICBpZiAoIWltZ0ZpbGUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMubG9hZEltYWdlRnJvbVVSTChcbiAgICAgICAgICAgIGltZ0ZpbGUubmFtZSxcbiAgICAgICAgICAgIFVSTC5jcmVhdGVPYmplY3RVUkwoaW1nRmlsZSlcbiAgICAgICAgKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogTG9hZCBpbWFnZSBmcm9tIHVybFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBpbWFnZU5hbWUgLSBpbWFnZU5hbWVcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdXJsIC0gRmlsZSB1cmxcbiAgICAgKi9cbiAgICBsb2FkSW1hZ2VGcm9tVVJMOiBmdW5jdGlvbihpbWFnZU5hbWUsIHVybCkge1xuICAgICAgICB2YXIgY2FsbGJhY2ssIGNvbW1hbmQ7XG4gICAgICAgIGlmICghaW1hZ2VOYW1lIHx8ICF1cmwpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNhbGxiYWNrID0gJC5wcm94eSh0aGlzLl9jYWxsYmFja0FmdGVySW1hZ2VMb2FkaW5nLCB0aGlzKTtcbiAgICAgICAgY29tbWFuZCA9IGNvbW1hbmRGYWN0b3J5LmNyZWF0ZUxvYWRDb21tYW5kKGltYWdlTmFtZSwgdXJsKVxuICAgICAgICAgICAgLnNldEV4ZWN1dGlvbkNhbGxiYWNrKGNhbGxiYWNrKVxuICAgICAgICAgICAgLnNldFVuZG9lckNhbGxiYWNrKGNhbGxiYWNrKTtcblxuICAgICAgICB0aGlzLmV4ZWN1dGUoY29tbWFuZCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENhbGxiYWNrIGFmdGVyIGltYWdlIGxvYWRpbmdcbiAgICAgKiBAcGFyYW0gez9mYWJyaWMuSW1hZ2V9IG9JbWFnZSAtIEltYWdlIGluc3RhbmNlXG4gICAgICovXG4gICAgX2NhbGxiYWNrQWZ0ZXJJbWFnZUxvYWRpbmc6IGZ1bmN0aW9uKG9JbWFnZSkge1xuICAgICAgICB2YXIgbWFpbkNvbXBvbmVudCA9IHRoaXMuX2ludm9rZXIuZ2V0KGNvbXBOYW1lcy5NQUlOKTtcbiAgICAgICAgdmFyICRjYW52YXNFbGVtZW50ID0gJChtYWluQ29tcG9uZW50LmdldENhbnZhc0VsZW1lbnQoKSk7XG5cbiAgICAgICAgaWYgKG9JbWFnZSkge1xuICAgICAgICAgICAgdGhpcy5maXJlKGV2ZW50TmFtZXMuTE9BRF9JTUFHRSwge1xuICAgICAgICAgICAgICAgIG9yaWdpbmFsV2lkdGg6IG9JbWFnZS53aWR0aCxcbiAgICAgICAgICAgICAgICBvcmlnaW5hbEhlaWdodDogb0ltYWdlLmhlaWdodCxcbiAgICAgICAgICAgICAgICBjdXJyZW50V2lkdGg6ICRjYW52YXNFbGVtZW50LndpZHRoKCksXG4gICAgICAgICAgICAgICAgY3VycmVudEhlaWdodDogJGNhbnZhc0VsZW1lbnQuaGVpZ2h0KClcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5maXJlKGV2ZW50TmFtZXMuQ0xFQVJfSU1BR0UpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFN0YXJ0IGNyb3BwaW5nXG4gICAgICovXG4gICAgc3RhcnRDcm9wcGluZzogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjcm9wcGVyID0gdGhpcy5faW52b2tlci5nZXQoY29tcE5hbWVzLkNST1BQRVIpO1xuXG4gICAgICAgIGNyb3BwZXIuc3RhcnQoKTtcbiAgICAgICAgdGhpcy5maXJlKGV2ZW50TmFtZXMuU1RBUlRfQ1JPUFBJTkcpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBcHBseSBjcm9wcGluZ1xuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2lzQXBwbHlpbmddIC0gV2hldGhlciB0aGUgY3JvcHBpbmcgaXMgYXBwbGllZCBvciBjYW5jZWxlZFxuICAgICAqL1xuICAgIGVuZENyb3BwaW5nOiBmdW5jdGlvbihpc0FwcGx5aW5nKSB7XG4gICAgICAgIHZhciBjcm9wcGVyID0gdGhpcy5faW52b2tlci5nZXQoY29tcE5hbWVzLkNST1BQRVIpO1xuICAgICAgICB2YXIgZGF0YSA9IGNyb3BwZXIuZW5kKGlzQXBwbHlpbmcpO1xuXG4gICAgICAgIHRoaXMuZmlyZShldmVudE5hbWVzLkVORF9DUk9QUElORyk7XG4gICAgICAgIGlmIChkYXRhKSB7XG4gICAgICAgICAgICB0aGlzLmxvYWRJbWFnZUZyb21VUkwoZGF0YS5pbWFnZU5hbWUsIGRhdGEudXJsKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgZGF0YSB1cmxcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZSAtIEEgRE9NU3RyaW5nIGluZGljYXRpbmcgdGhlIGltYWdlIGZvcm1hdC4gVGhlIGRlZmF1bHQgdHlwZSBpcyBpbWFnZS9wbmcuXG4gICAgICogQHJldHVybnMge3N0cmluZ30gQSBET01TdHJpbmcgY29udGFpbmluZyB0aGUgcmVxdWVzdGVkIGRhdGEgVVJJLlxuICAgICAqL1xuICAgIHRvRGF0YVVSTDogZnVuY3Rpb24odHlwZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5faW52b2tlci5nZXQoY29tcE5hbWVzLk1BSU4pLnRvRGF0YVVSTCh0eXBlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGltYWdlIG5hbWVcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIGdldEltYWdlTmFtZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9pbnZva2VyLmdldChjb21wTmFtZXMuTUFJTikuZ2V0SW1hZ2VOYW1lKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENsZWFyIHVuZG9TdGFja1xuICAgICAqL1xuICAgIGNsZWFyVW5kb1N0YWNrOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5faW52b2tlci5jbGVhclVuZG9TdGFjaygpO1xuICAgICAgICB0aGlzLmZpcmUoZXZlbnROYW1lcy5FTVBUWV9VTkRPX1NUQUNLKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2xlYXIgcmVkb1N0YWNrXG4gICAgICovXG4gICAgY2xlYXJSZWRvU3RhY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl9pbnZva2VyLmNsZWFyUmVkb1N0YWNrKCk7XG4gICAgICAgIHRoaXMuZmlyZShldmVudE5hbWVzLkVNUFRZX1JFRE9fU1RBQ0spO1xuICAgIH1cbn0pO1xuXG50dWkudXRpbC5DdXN0b21FdmVudHMubWl4aW4oSW1hZ2VFZGl0b3IpO1xubW9kdWxlLmV4cG9ydHMgPSBJbWFnZUVkaXRvcjtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGVycm9yTWVzc2FnZSA9IHJlcXVpcmUoJy4uL2ZhY3RvcnkvZXJyb3JNZXNzYWdlJyk7XG5cbnZhciBjcmVhdGVNZXNzYWdlID0gZXJyb3JNZXNzYWdlLmNyZWF0ZSxcbiAgICBlcnJvclR5cGVzID0gZXJyb3JNZXNzYWdlLnR5cGVzO1xuXG4vKipcbiAqIENvbW1hbmQgY2xhc3NcbiAqIEBjbGFzc1xuICogQHBhcmFtIHt7ZXhlY3V0ZTogZnVuY3Rpb24sIHVuZG86IGZ1bmN0aW9ufX0gYWN0aW9ucyAtIENvbW1hbmQgYWN0aW9uc1xuICovXG52YXIgQ29tbWFuZCA9IHR1aS51dGlsLmRlZmluZUNsYXNzKHtcbiAgICBpbml0OiBmdW5jdGlvbihhY3Rpb25zKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBFeGVjdXRlIGZ1bmN0aW9uXG4gICAgICAgICAqIEB0eXBlIHtmdW5jdGlvbn1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZXhlY3V0ZSA9IGFjdGlvbnMuZXhlY3V0ZTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogVW5kbyBmdW5jdGlvblxuICAgICAgICAgKiBAdHlwZSB7ZnVuY3Rpb259XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnVuZG8gPSBhY3Rpb25zLnVuZG87XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEFmdGVyIGV4ZWN1dGlvbiBjYWxsYmFja1xuICAgICAgICAgKiBAdHlwZSB7bnVsbH1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZXhlY3V0aW9uQ2FsbGJhY2sgPSBudWxsO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBZnRlciB1bmRvIGNhbGxiYWNrXG4gICAgICAgICAqIEB0eXBlIHtudWxsfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy51bmRvZXJDYWxsYmFjayA9IG51bGw7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEV4ZWN1dGUgYWN0aW9uXG4gICAgICogQGFic3RyYWN0XG4gICAgICovXG4gICAgZXhlY3V0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihjcmVhdGVNZXNzYWdlKGVycm9yVHlwZXMuVU5fSU1QTEVNRU5UQVRJT04sICdleGVjdXRlJykpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBVbmRvIGFjdGlvblxuICAgICAqIEBhYnN0cmFjdFxuICAgICAqL1xuICAgIHVuZG86IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoY3JlYXRlTWVzc2FnZShlcnJvclR5cGVzLlVOX0lNUExFTUVOVEFUSU9OLCAndW5kbycpKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQXR0YWNoIGFmdGVyIGV4ZWN1dGUgY2FsbGJhY2tcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFjayAtIEV4ZWN1dGUgY2FsbGJhY2tcbiAgICAgKiBAcmV0dXJucyB7Q29tbWFuZH0gdGhpc1xuICAgICAqL1xuICAgIHNldEV4ZWN1dGlvbkNhbGxiYWNrOiBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICAgICB0aGlzLmV4ZWN1dGlvbkNhbGxiYWNrID0gY2FsbGJhY2s7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEF0dGFjaCBhZnRlciB1bmRvIGNhbGxiYWNrXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2sgLSBFeGVjdXRlIGNhbGxiYWNrXG4gICAgICogQHJldHVybnMge0NvbW1hbmR9IHRoaXNcbiAgICAgKi9cbiAgICBzZXRVbmRvZXJDYWxsYmFjazogZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICAgICAgdGhpcy51bmRvZXJDYWxsYmFjayA9IGNhbGxiYWNrO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENvbW1hbmQ7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogQ29tcG9uZW50IGludGVyZmFjZVxuICogQGNsYXNzXG4gKi9cbnZhciBDb21wb25lbnQgPSB0dWkudXRpbC5kZWZpbmVDbGFzcyh7XG4gICAgaW5pdDogZnVuY3Rpb24oKSB7fSxcblxuICAgIC8qKlxuICAgICAqIFNhdmUgaW1hZ2UoYmFja2dyb3VuZCkgb2YgY2FudmFzXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSBOYW1lIG9mIGltYWdlXG4gICAgICogQHBhcmFtIHtmYWJyaWMuSW1hZ2V9IG9JbWFnZSAtIEZhYnJpYyBpbWFnZSBpbnN0YW5jZVxuICAgICAqL1xuICAgIHNldENhbnZhc0ltYWdlOiBmdW5jdGlvbihuYW1lLCBvSW1hZ2UpIHtcbiAgICAgICAgdGhpcy5nZXRSb290KCkuc2V0Q2FudmFzSW1hZ2UobmFtZSwgb0ltYWdlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBjYW52YXMgZWxlbWVudCBvZiBmYWJyaWMuQ2FudmFzW1tsb3dlci1jYW52YXNdXVxuICAgICAqIEByZXR1cm5zIHtIVE1MQ2FudmFzRWxlbWVudH1cbiAgICAgKi9cbiAgICBnZXRDYW52YXNFbGVtZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Um9vdCgpLmdldENhbnZhc0VsZW1lbnQoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGZhYnJpYy5DYW52YXMgaW5zdGFuY2VcbiAgICAgKiBAcmV0dXJucyB7ZmFicmljLkNhbnZhc31cbiAgICAgKi9cbiAgICBnZXRDYW52YXM6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRSb290KCkuZ2V0Q2FudmFzKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBjYW52YXNJbWFnZSAoZmFicmljLkltYWdlIGluc3RhbmNlKVxuICAgICAqIEByZXR1cm5zIHtmYWJyaWMuSW1hZ2V9XG4gICAgICovXG4gICAgZ2V0Q2FudmFzSW1hZ2U6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRSb290KCkuZ2V0Q2FudmFzSW1hZ2UoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGltYWdlIG5hbWVcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIGdldEltYWdlTmFtZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFJvb3QoKS5nZXRJbWFnZU5hbWUoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGltYWdlIGVkaXRvclxuICAgICAqIEByZXR1cm5zIHtJbWFnZUVkaXRvcn1cbiAgICAgKi9cbiAgICBnZXRFZGl0b3I6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRSb290KCkuZ2V0RWRpdG9yKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybiBjb21wb25lbnQgbmFtZVxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgZ2V0TmFtZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm5hbWU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBwYXJlbnRcbiAgICAgKiBAcGFyYW0ge0NvbXBvbmVudHxudWxsfSBwYXJlbnQgLSBQYXJlbnRcbiAgICAgKi9cbiAgICBzZXRQYXJlbnQ6IGZ1bmN0aW9uKHBhcmVudCkge1xuICAgICAgICB0aGlzLl9wYXJlbnQgPSBwYXJlbnQgfHwgbnVsbDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHBhcmVudC5cbiAgICAgKiBJZiB0aGUgdmlldyBpcyByb290LCByZXR1cm4gbnVsbFxuICAgICAqIEByZXR1cm5zIHtDb21wb25lbnR8bnVsbH1cbiAgICAgKi9cbiAgICBnZXRQYXJlbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fcGFyZW50O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gcm9vdFxuICAgICAqIEByZXR1cm5zIHtDb21wb25lbnR9XG4gICAgICovXG4gICAgZ2V0Um9vdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBuZXh0ID0gdGhpcy5nZXRQYXJlbnQoKSxcbiAgICAgICAgLyogZXNsaW50LWRpc2FibGUgY29uc2lzdGVudC10aGlzICovXG4gICAgICAgICAgICBjdXJyZW50ID0gdGhpcztcbiAgICAgICAgLyogZXNsaW50LWVuYWJsZSBjb25zaXN0ZW50LXRoaXMgKi9cblxuICAgICAgICB3aGlsZSAobmV4dCkge1xuICAgICAgICAgICAgY3VycmVudCA9IG5leHQ7XG4gICAgICAgICAgICBuZXh0ID0gY3VycmVudC5nZXRQYXJlbnQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBjdXJyZW50O1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENvbXBvbmVudDtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIEltYWdlTG9hZGVyID0gcmVxdWlyZSgnLi9jb21wb25lbnQvaW1hZ2VMb2FkZXInKTtcbnZhciBDcm9wcGVyID0gcmVxdWlyZSgnLi9jb21wb25lbnQvY3JvcHBlcicpO1xudmFyIE1haW5Db21wb25lbnQgPSByZXF1aXJlKCcuL2NvbXBvbmVudC9tYWluJyk7XG5cbi8qKlxuICogSW52b2tlclxuICogQGNsYXNzXG4gKi9cbnZhciBJbnZva2VyID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoLyogQGxlbmRzIEludm9rZXIucHJvdG90eXBlICove1xuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAvKipcbiAgICAgICAgICogVW5kbyBzdGFja1xuICAgICAgICAgKiBAdHlwZSB7QXJyYXkuPENvbW1hbmQ+fVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy51bmRvU3RhY2sgPSBbXTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogUmVkbyBzdGFja1xuICAgICAgICAgKiBAdHlwZSB7QXJyYXkuPENvbW1hbmQ+fVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5yZWRvU3RhY2sgPSBbXTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQ29tcG9uZW50IG1hcFxuICAgICAgICAgKiBAdHlwZSB7T2JqZWN0LjxzdHJpbmcsIENvbXBvbmVudD59XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmNvbXBvbmVudE1hcCA9IHt9O1xuXG4gICAgICAgIHRoaXMuX2NyZWF0ZUNvbXBvbmVudHMoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGNvbXBvbmVudHNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jcmVhdGVDb21wb25lbnRzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG1haW4gPSBuZXcgTWFpbkNvbXBvbmVudCgpO1xuXG4gICAgICAgIHRoaXMuX3JlZ2lzdGVyKG1haW4pO1xuICAgICAgICB0aGlzLl9yZWdpc3RlcihuZXcgSW1hZ2VMb2FkZXIobWFpbikpO1xuICAgICAgICB0aGlzLl9yZWdpc3RlcihuZXcgQ3JvcHBlcihtYWluKSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlZ2lzdGVyIGNvbXBvbmVudFxuICAgICAqIEBwYXJhbSB7Q29tcG9uZW50fSBjb21wb25lbnQgLSBDb21wb25lbnQgaGFuZGxpbmcgdGhlIGNhbnZhc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JlZ2lzdGVyOiBmdW5jdGlvbihjb21wb25lbnQpIHtcbiAgICAgICAgdGhpcy5jb21wb25lbnRNYXBbY29tcG9uZW50LmdldE5hbWUoKV0gPSBjb21wb25lbnQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBjb21wb25lbnRcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIENvbXBvbmVudCBuYW1lXG4gICAgICogQHJldHVybnMge0NvbXBvbmVudH1cbiAgICAgKi9cbiAgICBnZXQ6IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29tcG9uZW50TWFwW25hbWVdO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBJbnZva2UgY29tbWFuZFxuICAgICAqIFN0b3JlIHRoZSBjb21tYW5kIHRvIHRoZSB1bmRvU3RhY2tcbiAgICAgKiBDbGVhciB0aGUgcmVkb1N0YWNrXG4gICAgICogQHBhcmFtIHtDb21tYW5kfSBjb21tYW5kIC0gQ29tbWFuZFxuICAgICAqIEByZXR1cm5zIHtqUXVlcnkuRGVmZXJyZWR9XG4gICAgICovXG4gICAgaW52b2tlOiBmdW5jdGlvbihjb21tYW5kKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICByZXR1cm4gJC53aGVuKGNvbW1hbmQuZXhlY3V0ZSh0aGlzLmNvbXBvbmVudE1hcCkpXG4gICAgICAgICAgICAuZG9uZShjb21tYW5kLmV4ZWN1dGlvbkNhbGxiYWNrKVxuICAgICAgICAgICAgLmRvbmUoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgc2VsZi51bmRvU3RhY2sucHVzaChjb21tYW5kKTtcbiAgICAgICAgICAgICAgICBzZWxmLmNsZWFyUmVkb1N0YWNrKCk7XG4gICAgICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVW5kbyBjb21tYW5kXG4gICAgICogQHJldHVybnMge2pRdWVyeS5EZWZlcnJlZH1cbiAgICAgKi9cbiAgICB1bmRvOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGNvbW1hbmQgPSB0aGlzLnVuZG9TdGFjay5wb3AoKTtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICB2YXIgZGZkO1xuXG4gICAgICAgIGlmIChjb21tYW5kKSB7XG4gICAgICAgICAgICBkZmQgPSAkLndoZW4oY29tbWFuZC51bmRvKHRoaXMuY29tcG9uZW50TWFwKSlcbiAgICAgICAgICAgICAgICAuZG9uZShjb21tYW5kLnVuZG9lckNhbGxiYWNrKVxuICAgICAgICAgICAgICAgIC5kb25lKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLnJlZG9TdGFjay5wdXNoKGNvbW1hbmQpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZGZkID0gJC5EZWZlcnJlZCgpLnJlamVjdCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGRmZDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVkbyBjb21tYW5kXG4gICAgICogQHJldHVybnMge2pRdWVyeS5EZWZlcnJlZH1cbiAgICAgKi9cbiAgICByZWRvOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGNvbW1hbmQgPSB0aGlzLnJlZG9TdGFjay5wb3AoKTtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICB2YXIgZGZkO1xuXG4gICAgICAgIGlmIChjb21tYW5kKSB7XG4gICAgICAgICAgICBkZmQgPSAkLndoZW4oY29tbWFuZC5leGVjdXRlKHRoaXMuY29tcG9uZW50TWFwKSlcbiAgICAgICAgICAgICAgICAuZG9uZShjb21tYW5kLmV4ZWN1dGlvbkNhbGxiYWNrKVxuICAgICAgICAgICAgICAgIC5kb25lKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLnVuZG9TdGFjay5wdXNoKGNvbW1hbmQpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZGZkID0gJC5EZWZlcnJlZCgpLnJlamVjdCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGRmZDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHdoZXRoZXIgdGhlIHJlZG9TdGFjayBpcyBlbXB0eVxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqL1xuICAgIGlzRW1wdHlSZWRvU3RhY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5yZWRvU3RhY2subGVuZ3RoID09PSAwO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gd2hldGhlciB0aGUgdW5kb1N0YWNrIGlzIGVtcHR5XG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICovXG4gICAgaXNFbXB0eVVuZG9TdGFjazogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnVuZG9TdGFjay5sZW5ndGggPT09IDA7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENsZWFyIHVuZG9TdGFja1xuICAgICAqL1xuICAgIGNsZWFyVW5kb1N0YWNrOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy51bmRvU3RhY2sgPSBbXTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2xlYXIgcmVkb1N0YWNrXG4gICAgICovXG4gICAgY2xlYXJSZWRvU3RhY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnJlZG9TdGFjayA9IFtdO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEludm9rZXI7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBtaW4gPSBNYXRoLm1pbixcbiAgICBtYXggPSBNYXRoLm1heDtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgLyoqXG4gICAgICogQ2xhbXAgdmFsdWVcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdmFsdWUgLSBWYWx1ZVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBtaW5WYWx1ZSAtIE1pbmltdW0gdmFsdWVcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbWF4VmFsdWUgLSBNYXhpbXVtIHZhbHVlXG4gICAgICogQHJldHVybnMge251bWJlcn0gY2xhbXBlZCB2YWx1ZVxuICAgICAqL1xuICAgIGNsYW1wOiBmdW5jdGlvbih2YWx1ZSwgbWluVmFsdWUsIG1heFZhbHVlKSB7XG4gICAgICAgIHZhciB0ZW1wO1xuICAgICAgICBpZiAobWluVmFsdWUgPiBtYXhWYWx1ZSkge1xuICAgICAgICAgICAgdGVtcCA9IG1pblZhbHVlO1xuICAgICAgICAgICAgbWluVmFsdWUgPSBtYXhWYWx1ZTtcbiAgICAgICAgICAgIG1heFZhbHVlID0gdGVtcDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBtYXgobWluVmFsdWUsIG1pbih2YWx1ZSwgbWF4VmFsdWUpKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogTWFrZSBrZXktdmFsdWUgb2JqZWN0IGZyb20gYXJndW1lbnRzXG4gICAgICogQHJldHVybnMge29iamVjdC48c3RyaW5nLCBzdHJpbmc+fVxuICAgICAqL1xuICAgIGtleU1pcnJvcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBvYmogPSB7fTtcblxuICAgICAgICB0dWkudXRpbC5mb3JFYWNoKGFyZ3VtZW50cywgZnVuY3Rpb24oa2V5KSB7XG4gICAgICAgICAgICBvYmpba2V5XSA9IGtleTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIG9iajtcbiAgICB9XG59O1xuIl19
