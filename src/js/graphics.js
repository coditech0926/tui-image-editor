/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Graphics module
 */
import snippet from 'tui-code-snippet';
import Promise from 'core-js/library/es6/promise';
import fabric from 'fabric/dist/fabric.require';
import ImageLoader from './component/imageLoader';
import Cropper from './component/cropper';
import Flip from './component/flip';
import Rotation from './component/rotation';
import FreeDrawing from './component/freeDrawing';
import Line from './component/line';
import Text from './component/text';
import Icon from './component/icon';
import Filter from './component/filter';
import Shape from './component/shape';
import CropperDrawingMode from './drawingMode/cropper';
import FreeDrawingMode from './drawingMode/freeDrawing';
import LineDrawingMode from './drawingMode/lineDrawing';
import ShapeDrawingMode from './drawingMode/shape';
import TextDrawingMode from './drawingMode/text';
import consts from './consts';
import util from './util';

const components = consts.componentNames;
const events = consts.eventNames;

const {drawingModes, fObjectOptions} = consts;
const {extend, stamp, isArray, isString, forEachArray, forEachOwnProperties, CustomEvents} = snippet;

const DEFAULT_CSS_MAX_WIDTH = 1000;
const DEFAULT_CSS_MAX_HEIGHT = 800;

const cssOnly = {
    cssOnly: true
};
const backstoreOnly = {
    backstoreOnly: true
};

/**
 * Graphics class
 * @class
 * @param {string|jQuery|HTMLElement} wrapper - Wrapper's element or selector
 * @param {Object} [option] - Canvas max width & height of css
 *  @param {number} option.cssMaxWidth - Canvas css-max-width
 *  @param {number} option.cssMaxHeight - Canvas css-max-height
 *  @param {boolean} option.useItext - Use IText in text mode
 *  @param {boolean} option.useDragAddIcon - Use dragable add in icon mode
 * @ignore
 */
class Graphics {
    constructor(element, {
        cssMaxWidth,
        cssMaxHeight,
        useItext = false,
        useDragAddIcon = false
    } = {}) {
        /**
         * Fabric image instance
         * @type {fabric.Image}
         */
        this.canvasImage = null;

        /**
         * Max width of canvas elements
         * @type {number}
         */
        this.cssMaxWidth = cssMaxWidth || DEFAULT_CSS_MAX_WIDTH;

        /**
         * Max height of canvas elements
         * @type {number}
         */
        this.cssMaxHeight = cssMaxHeight || DEFAULT_CSS_MAX_HEIGHT;

        /**
         * Use Itext mode for text component
         * @type {boolean}
         */
        this.useItext = useItext;

        /**
         * Use add drag icon mode for icon component
         * @type {boolean}
         */
        this.useDragAddIcon = useDragAddIcon;

        /**
         * cropper Selection Style
         * @type {Object}
         */
        this.cropSelectionStyle = {};

        /**
         * Image name
         * @type {string}
         */
        this.imageName = '';

        /**
         * Object Map
         * @type {Object}
         * @private
         */
        this._objects = {};

        /**
         * Fabric-Canvas instance
         * @type {fabric.Canvas}
         * @private
         */
        this._canvas = null;

        /**
         * Drawing mode
         * @type {string}
         * @private
         */
        this._drawingMode = drawingModes.NORMAL;

        /**
         * DrawingMode map
         * @type {Object.<string, DrawingMode>}
         * @private
         */
        this._drawingModeMap = {};

        /**
         * Component map
         * @type {Object.<string, Component>}
         * @private
         */
        this._componentMap = {};

        /**
         * fabric event handlers
         * @type {Object.<string, function>}
         * @private
         */
        this._handler = {
            onMouseDown: this._onMouseDown.bind(this),
            onObjectAdded: this._onObjectAdded.bind(this),
            onObjectRemoved: this._onObjectRemoved.bind(this),
            onObjectMoved: this._onObjectMoved.bind(this),
            onObjectScaled: this._onObjectScaled.bind(this),
            onObjectSelected: this._onObjectSelected.bind(this),
            onPathCreated: this._onPathCreated.bind(this),
            onSelectionCleared: this._onSelectionCleared.bind(this),
            onSelectionCreated: this._onSelectionCreated.bind(this)
        };

        this._setCanvasElement(element);
        this._createDrawingModeInstances();
        this._createComponents();
        this._attachCanvasEvents();
    }

    /**
     * Destroy canvas element
     */
    destroy() {
        const {wrapperEl} = this._canvas;

        this._canvas.clear();

        wrapperEl.parentNode.removeChild(wrapperEl);
    }

    /**
     * Deactivates all objects on canvas
     * @returns {Graphics} this
     */
    deactivateAll() {
        this._canvas.deactivateAll();

        return this;
    }

    /**
     * Renders all objects on canvas
     * @returns {Graphics} this
     */
    renderAll() {
        this._canvas.renderAll();

        return this;
    }

    /**
     * Adds objects on canvas
     * @param {Object|Array} objects - objects
     */
    add(objects) {
        let theArgs = [];
        if (isArray(objects)) {
            theArgs = objects;
        } else {
            theArgs.push(objects);
        }

        this._canvas.add(...theArgs);
    }

    /**
     * Removes the object or group
     * @param {Object} target - graphics object or group
     * @returns {boolean} true if contains or false
     */
    contains(target) {
        return this._canvas.contains(target);
    }

    /**
     * Gets all objects or group
     * @returns {Array} all objects, shallow copy
     */
    getObjects() {
        return this._canvas.getObjects().slice();
    }

    /**
     * Get an object by id
     * @param {number} id - object id
     * @returns {fabric.Object} object corresponding id
     */
    getObject(id) {
        return this._objects[id];
    }

    /**
     * Removes the object or group
     * @param {Object} target - graphics object or group
     */
    remove(target) {
        this._canvas.remove(target);
    }

    /**
     * Removes all object or group
     * @param {boolean} includesBackground - remove the background image or not
     * @returns {Array} all objects array which is removed
     */
    removeAll(includesBackground) {
        const canvas = this._canvas;
        const objects = canvas.getObjects().slice();
        canvas.remove(...this._canvas.getObjects());

        if (includesBackground) {
            canvas.clear();
        }

        return objects;
    }

    /**
     * Removes an object or group by id
     * @param {number} id - object id
     * @returns {Array} removed objects
     */
    removeObjectById(id) {
        const objects = [];
        const canvas = this._canvas;
        const target = this.getObject(id);
        const isValidGroup = target && target.isType('group') && !target.isEmpty();

        if (isValidGroup) {
            canvas.discardActiveGroup(); // restore states for each objects
            target.forEachObject(obj => {
                objects.push(obj);
                obj.remove();
            });
        } else if (canvas.contains(target)) {
            objects.push(target);
            target.remove();
        }

        return objects;
    }

    /**
     * Get an id by object instance
     * @param {fabric.Object} object object
     * @returns {number} object id if it exists or null
     */
    getObjectId(object) {
        let key = null;
        for (key in this._objects) {
            if (this._objects.hasOwnProperty(key)) {
                if (object === this._objects[key]) {
                    return key;
                }
            }
        }

        return null;
    }

    /**
     * Gets an active object or group
     * @returns {Object} active object or group instance
     */
    getActiveObject() {
        return this._canvas.getActiveObject();
    }

    /**
     * Gets an active group object
     * @returns {Object} active group object instance
     */
    getActiveGroupObject() {
        return this._canvas.getActiveGroup();
    }

    /**
     * Activates an object or group
     * @param {Object} target - target object or group
     */
    setActiveObject(target) {
        this._canvas.setActiveObject(target);
    }

    /**
     * Set Crop selection style
     * @param {Object} style - Selection styles
     */
    setCropSelectionStyle(style) {
        this.cropSelectionStyle = style;
    }

    /**
     * Get component
     * @param {string} name - Component name
     * @returns {Component}
     */
    getComponent(name) {
        return this._componentMap[name];
    }

    /**
     * Get current drawing mode
     * @returns {string}
     */
    getDrawingMode() {
        return this._drawingMode;
    }

    /**
     * Start a drawing mode. If the current mode is not 'NORMAL', 'stopDrawingMode()' will be called first.
     * @param {String} mode Can be one of <I>'CROPPER', 'FREE_DRAWING', 'LINE', 'TEXT', 'SHAPE'</I>
     * @param {Object} [option] parameters of drawing mode, it's available with 'FREE_DRAWING', 'LINE_DRAWING'
     *  @param {Number} [option.width] brush width
     *  @param {String} [option.color] brush color
     * @returns {boolean} true if success or false
     */
    startDrawingMode(mode, option) {
        if (this._isSameDrawingMode(mode)) {
            return true;
        }

        // If the current mode is not 'NORMAL', 'stopDrawingMode()' will be called first.
        this.stopDrawingMode();

        const drawingModeInstance = this._getDrawingModeInstance(mode);
        if (drawingModeInstance && drawingModeInstance.start) {
            drawingModeInstance.start(this, option);

            this._drawingMode = mode;
        }

        return !!drawingModeInstance;
    }

    /**
     * Stop the current drawing mode and back to the 'NORMAL' mode
     */
    stopDrawingMode() {
        if (this._isSameDrawingMode(drawingModes.NORMAL)) {
            return;
        }

        const drawingModeInstance = this._getDrawingModeInstance(this.getDrawingMode());
        if (drawingModeInstance && drawingModeInstance.end) {
            drawingModeInstance.end(this);
        }
        this._drawingMode = drawingModes.NORMAL;
    }

    /**
     * To data url from canvas
     * @param {Object} options - options for toDataURL
     *   @param {String} [options.format=png] The format of the output image. Either "jpeg" or "png"
     *   @param {Number} [options.quality=1] Quality level (0..1). Only used for jpeg.
     *   @param {Number} [options.multiplier=1] Multiplier to scale by
     *   @param {Number} [options.left] Cropping left offset. Introduced in fabric v1.2.14
     *   @param {Number} [options.top] Cropping top offset. Introduced in fabric v1.2.14
     *   @param {Number} [options.width] Cropping width. Introduced in fabric v1.2.14
     *   @param {Number} [options.height] Cropping height. Introduced in fabric v1.2.14
     * @returns {string} A DOMString containing the requested data URI.
     */
    toDataURL(options) {
        return this._canvas && this._canvas.toDataURL(options);
    }

    /**
     * Save image(background) of canvas
     * @param {string} name - Name of image
     * @param {?fabric.Image} canvasImage - Fabric image instance
     */
    setCanvasImage(name, canvasImage) {
        if (canvasImage) {
            stamp(canvasImage);
        }
        this.imageName = name;
        this.canvasImage = canvasImage;
    }

    /**
     * Set css max dimension
     * @param {{width: number, height: number}} maxDimension - Max width & Max height
     */
    setCssMaxDimension(maxDimension) {
        this.cssMaxWidth = maxDimension.width || this.cssMaxWidth;
        this.cssMaxHeight = maxDimension.height || this.cssMaxHeight;
    }

    /**
     * Adjust canvas dimension with scaling image
     */
    adjustCanvasDimension() {
        const canvasImage = this.canvasImage.scale(1);
        const {width, height} = canvasImage.getBoundingRect();
        const maxDimension = this._calcMaxDimension(width, height);

        this.setCanvasCssDimension({
            width: '100%',
            height: '100%', // Set height '' for IE9
            'max-width': `${maxDimension.width}px`,
            'max-height': `${maxDimension.height}px`
        });

        this.setCanvasBackstoreDimension({
            width,
            height
        });
        this._canvas.centerObject(canvasImage);
    }

    /**
     * Set canvas dimension - css only
     *  {@link http://fabricjs.com/docs/fabric.Canvas.html#setDimensions}
     * @param {Object} dimension - Canvas css dimension
     */
    setCanvasCssDimension(dimension) {
        this._canvas.setDimensions(dimension, cssOnly);
    }

    /**
     * Set canvas dimension - backstore only
     *  {@link http://fabricjs.com/docs/fabric.Canvas.html#setDimensions}
     * @param {Object} dimension - Canvas backstore dimension
     */
    setCanvasBackstoreDimension(dimension) {
        this._canvas.setDimensions(dimension, backstoreOnly);
    }

    /**
     * Set image properties
     * {@link http://fabricjs.com/docs/fabric.Image.html#set}
     * @param {Object} setting - Image properties
     * @param {boolean} [withRendering] - If true, The changed image will be reflected in the canvas
     */
    setImageProperties(setting, withRendering) {
        const {canvasImage} = this;

        if (!canvasImage) {
            return;
        }

        canvasImage.set(setting).setCoords();
        if (withRendering) {
            this._canvas.renderAll();
        }
    }

    /**
     * Returns canvas element of fabric.Canvas[[lower-canvas]]
     * @returns {HTMLCanvasElement}
     */
    getCanvasElement() {
        return this._canvas.getElement();
    }

    /**
     * Get fabric.Canvas instance
     * @returns {fabric.Canvas}
     * @private
     */
    getCanvas() {
        return this._canvas;
    }

    /**
     * Get canvasImage (fabric.Image instance)
     * @returns {fabric.Image}
     */
    getCanvasImage() {
        return this.canvasImage;
    }

    /**
     * Get image name
     * @returns {string}
     */
    getImageName() {
        return this.imageName;
    }

    /**
     * Add image object on canvas
     * @param {string} imgUrl - Image url to make object
     * @returns {Promise}
     */
    addImageObject(imgUrl) {
        const callback = this._callbackAfterLoadingImageObject.bind(this);

        return new Promise(resolve => {
            fabric.Image.fromURL(imgUrl, image => {
                callback(image);
                resolve(this.createObjectProperties(image));
            }, {
                crossOrigin: 'Anonymous'
            }
            );
        });
    }

    /**
     * Get center position of canvas
     * @returns {Object} {left, top}
     */
    getCenter() {
        return this._canvas.getCenter();
    }

    /**
     * Get cropped rect
     * @returns {Object} rect
     */
    getCropzoneRect() {
        return this.getComponent(components.CROPPER).getCropzoneRect();
    }

    /**
     * Get cropped rect
     * @param {Object} mode cropzone rect mode
     * @returns {Object} rect
     */
    setCropzoneRect(mode) {
        return this.getComponent(components.CROPPER).setCropzoneRect(mode);
    }

    /**
     * Get cropped image data
     * @param {Object} cropRect cropzone rect
     *  @param {Number} cropRect.left left position
     *  @param {Number} cropRect.top top position
     *  @param {Number} cropRect.width width
     *  @param {Number} cropRect.height height
     * @returns {?{imageName: string, url: string}} cropped Image data
     */
    getCroppedImageData(cropRect) {
        return this.getComponent(components.CROPPER).getCroppedImageData(cropRect);
    }

    /**
     * Set brush option
     * @param {Object} option brush option
     *  @param {Number} option.width width
     *  @param {String} option.color color like 'FFFFFF', 'rgba(0, 0, 0, 0.5)'
     */
    setBrush(option) {
        const drawingMode = this._drawingMode;
        let compName = components.FREE_DRAWING;

        if (drawingMode === drawingModes.LINE) {
            compName = drawingModes.LINE;
        }

        this.getComponent(compName).setBrush(option);
    }

    /**
     * Set states of current drawing shape
     * @param {string} type - Shape type (ex: 'rect', 'circle', 'triangle')
     * @param {Object} [options] - Shape options
     *      @param {string} [options.fill] - Shape foreground color (ex: '#fff', 'transparent')
     *      @param {string} [options.stoke] - Shape outline color
     *      @param {number} [options.strokeWidth] - Shape outline width
     *      @param {number} [options.width] - Width value (When type option is 'rect', this options can use)
     *      @param {number} [options.height] - Height value (When type option is 'rect', this options can use)
     *      @param {number} [options.rx] - Radius x value (When type option is 'circle', this options can use)
     *      @param {number} [options.ry] - Radius y value (When type option is 'circle', this options can use)
     *      @param {number} [options.isRegular] - Whether resizing shape has 1:1 ratio or not
     */
    setDrawingShape(type, options) {
        this.getComponent(components.SHAPE).setStates(type, options);
    }

    /**
     * Register icon paths
     * @param {Object} pathInfos - Path infos
     *  @param {string} pathInfos.key - key
     *  @param {string} pathInfos.value - value
     */
    registerPaths(pathInfos) {
        this.getComponent(components.ICON).registerPaths(pathInfos);
    }

    /**
     * Change cursor style
     * @param {string} cursorType - cursor type
     */
    changeCursor(cursorType) {
        const canvas = this.getCanvas();
        canvas.defaultCursor = cursorType;
        canvas.renderAll();
    }

    /**
     * Whether it has the filter or not
     * @param {string} type - Filter type
     * @returns {boolean} true if it has the filter
     */
    hasFilter(type) {
        return this.getComponent(components.FILTER).hasFilter(type);
    }

    /**
     * Set selection style of fabric object by init option
     * @param {Object} styles - Selection styles
     */
    setSelectionStyle(styles) {
        extend(fObjectOptions.SELECTION_STYLE, styles);
    }

    /**
     * Set object properties
     * @param {number} id - object id
     * @param {Object} props - props
     *     @param {string} [props.fill] Color
     *     @param {string} [props.fontFamily] Font type for text
     *     @param {number} [props.fontSize] Size
     *     @param {string} [props.fontStyle] Type of inclination (normal / italic)
     *     @param {string} [props.fontWeight] Type of thicker or thinner looking (normal / bold)
     *     @param {string} [props.textAlign] Type of text align (left / center / right)
     *     @param {string} [props.textDecoraiton] Type of line (underline / line-throgh / overline)
     * @returns {Object} applied properties
     */
    setObjectProperties(id, props) {
        const object = this.getObject(id);
        const clone = extend({}, props);

        object.set(clone);

        object.setCoords();

        this.getCanvas().renderAll();

        return clone;
    }

    /**
     * Get object properties corresponding key
     * @param {number} id - object id
     * @param {Array<string>|ObjectProps|string} keys - property's key
     * @returns {Object} properties
     */
    getObjectProperties(id, keys) {
        const object = this.getObject(id);
        const props = {};

        if (isString(keys)) {
            props[keys] = object[keys];
        } else if (isArray(keys)) {
            forEachArray(keys, value => {
                props[value] = object[value];
            });
        } else {
            forEachOwnProperties(keys, (value, key) => {
                props[key] = object[key];
            });
        }

        return props;
    }

    /**
     * Get object position by originX, originY
     * @param {number} id - object id
     * @param {string} originX - can be 'left', 'center', 'right'
     * @param {string} originY - can be 'top', 'center', 'bottom'
     * @returns {Object} {{x:number, y: number}} position by origin if id is valid, or null
     */
    getObjectPosition(id, originX, originY) {
        const targetObj = this.getObject(id);
        if (!targetObj) {
            return null;
        }

        return targetObj.getPointByOrigin(originX, originY);
    }

    /**
     * Set object position  by originX, originY
     * @param {number} id - object id
     * @param {Object} posInfo - position object
     *  @param {number} posInfo.x - x position
     *  @param {number} posInfo.y - y position
     *  @param {string} posInfo.originX - can be 'left', 'center', 'right'
     *  @param {string} posInfo.originY - can be 'top', 'center', 'bottom'
     * @returns {boolean} true if target id is valid or false
     */
    setObjectPosition(id, posInfo) {
        const targetObj = this.getObject(id);
        const {x, y, originX, originY} = posInfo;
        if (!targetObj) {
            return false;
        }

        const targetOrigin = targetObj.getPointByOrigin(originX, originY);
        const centerOrigin = targetObj.getPointByOrigin('center', 'center');
        const diffX = centerOrigin.x - targetOrigin.x;
        const diffY = centerOrigin.y - targetOrigin.y;

        targetObj.set({
            left: x + diffX,
            top: y + diffY
        });

        targetObj.setCoords();

        return true;
    }

    /**
     * Get the canvas size
     * @returns {Object} {{width: number, height: number}} image size
     */
    getCanvasSize() {
        const image = this.getCanvasImage();

        return {
            width: image ? image.width : 0,
            height: image ? image.height : 0
        };
    }

    /**
     * Get a DrawingMode instance
     * @param {string} modeName - DrawingMode Class Name
     * @returns {DrawingMode} DrawingMode instance
     * @private
     */
    _getDrawingModeInstance(modeName) {
        return this._drawingModeMap[modeName];
    }

    /**
     * Set canvas element to fabric.Canvas
     * @param {jQuery|Element|string} element - Wrapper or canvas element or selector
     * @private
     */
    _setCanvasElement(element) {
        let selectedElement;
        let canvasElement;

        if (element.jquery) {
            [selectedElement] = element;
        } else if (element.nodeType) {
            selectedElement = element;
        } else {
            selectedElement = document.querySelector(element);
        }

        if (selectedElement.nodeName.toUpperCase() !== 'CANVAS') {
            canvasElement = document.createElement('canvas');
            selectedElement.appendChild(canvasElement);
        }

        this._canvas = new fabric.Canvas(canvasElement, {
            containerClass: 'tui-image-editor-canvas-container',
            enableRetinaScaling: false
        });
    }

    /**
     * Creates DrawingMode instances
     * @private
     */
    _createDrawingModeInstances() {
        this._register(this._drawingModeMap, new CropperDrawingMode());
        this._register(this._drawingModeMap, new FreeDrawingMode());
        this._register(this._drawingModeMap, new LineDrawingMode());
        this._register(this._drawingModeMap, new ShapeDrawingMode());
        this._register(this._drawingModeMap, new TextDrawingMode());
    }

    /**
     * Create components
     * @private
     */
    _createComponents() {
        this._register(this._componentMap, new ImageLoader(this));
        this._register(this._componentMap, new Cropper(this));
        this._register(this._componentMap, new Flip(this));
        this._register(this._componentMap, new Rotation(this));
        this._register(this._componentMap, new FreeDrawing(this));
        this._register(this._componentMap, new Line(this));
        this._register(this._componentMap, new Text(this));
        this._register(this._componentMap, new Icon(this));
        this._register(this._componentMap, new Filter(this));
        this._register(this._componentMap, new Shape(this));
    }

    /**
     * Register component
     * @param {Object} map - map object
     * @param {Object} module - module which has getName method
     * @private
     */
    _register(map, module) {
        map[module.getName()] = module;
    }

    /**
     * Get the current drawing mode is same with given mode
     * @param {string} mode drawing mode
     * @returns {boolean} true if same or false
     */
    _isSameDrawingMode(mode) {
        return this.getDrawingMode() === mode;
    }

    /**
     * Calculate max dimension of canvas
     * The css-max dimension is dynamically decided with maintaining image ratio
     * The css-max dimension is lower than canvas dimension (attribute of canvas, not css)
     * @param {number} width - Canvas width
     * @param {number} height - Canvas height
     * @returns {{width: number, height: number}} - Max width & Max height
     * @private
     */
    _calcMaxDimension(width, height) {
        const wScaleFactor = this.cssMaxWidth / width;
        const hScaleFactor = this.cssMaxHeight / height;
        let cssMaxWidth = Math.min(width, this.cssMaxWidth);
        let cssMaxHeight = Math.min(height, this.cssMaxHeight);

        if (wScaleFactor < 1 && wScaleFactor < hScaleFactor) {
            cssMaxWidth = width * wScaleFactor;
            cssMaxHeight = height * wScaleFactor;
        } else if (hScaleFactor < 1 && hScaleFactor < wScaleFactor) {
            cssMaxWidth = width * hScaleFactor;
            cssMaxHeight = height * hScaleFactor;
        }

        return {
            width: Math.floor(cssMaxWidth),
            height: Math.floor(cssMaxHeight)
        };
    }

    /**
     * Callback function after loading image
     * @param {fabric.Image} obj - Fabric image object
     * @private
     */
    _callbackAfterLoadingImageObject(obj) {
        const centerPos = this.getCanvasImage().getCenterPoint();

        obj.set(consts.fObjectOptions.SELECTION_STYLE);
        obj.set({
            left: centerPos.x,
            top: centerPos.y,
            crossOrigin: 'Anonymous'
        });

        this.getCanvas().add(obj).setActiveObject(obj);
    }

    /**
     * Attach canvas's events
     */
    _attachCanvasEvents() {
        const canvas = this._canvas;
        const handler = this._handler;
        canvas.on({
            'mouse:down': handler.onMouseDown,
            'object:added': handler.onObjectAdded,
            'object:removed': handler.onObjectRemoved,
            'object:moving': handler.onObjectMoved,
            'object:scaling': handler.onObjectScaled,
            'object:selected': handler.onObjectSelected,
            'path:created': handler.onPathCreated,
            'selection:cleared': handler.onSelectionCleared,
            'selection:created': handler.onSelectionCreated
        });
    }

    /**
     * "mouse:down" canvas event handler
     * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event
     * @private
     */
    _onMouseDown(fEvent) {
        const originPointer = this._canvas.getPointer(fEvent.e);
        this.fire(events.MOUSE_DOWN, fEvent.e, originPointer);
    }

    /**
     * "object:added" canvas event handler
     * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event
     * @private
     */
    _onObjectAdded(fEvent) {
        const obj = fEvent.target;
        if (obj.isType('cropzone')) {
            return;
        }

        this._addFabricObject(obj);
    }

    /**
     * "object:removed" canvas event handler
     * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event
     * @private
     */
    _onObjectRemoved(fEvent) {
        const obj = fEvent.target;

        this._removeFabricObject(stamp(obj));
    }

    /**
     * "object:moving" canvas event handler
     * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event
     * @private
     */
    _onObjectMoved(fEvent) {
        const {target} = fEvent;
        const params = this.createObjectProperties(target);

        this.fire(events.OBJECT_MOVED, params);
    }

    /**
     * "object:scaling" canvas event handler
     * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event
     * @private
     */
    _onObjectScaled(fEvent) {
        const {target} = fEvent;
        const params = this.createObjectProperties(target);

        this.fire(events.OBJECT_SCALED, params);
    }

    /**
     * "object:selected" canvas event handler
     * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event
     * @private
     */
    _onObjectSelected(fEvent) {
        const {target} = fEvent;
        const params = this.createObjectProperties(target);

        this.fire(events.OBJECT_ACTIVATED, params);
    }

    /**
     * "path:created" canvas event handler
     * @param {{path: fabric.Path}} obj - Path object
     * @private
     */
    _onPathCreated(obj) {
        obj.path.set(consts.fObjectOptions.SELECTION_STYLE);

        const params = this.createObjectProperties(obj.path);

        this.fire(events.ADD_OBJECT, params);
    }

    /**
     * "selction:cleared" canvas event handler
     * @private
     */
    _onSelectionCleared() {
        this.fire(events.SELECTION_CLEARED);
    }

    /**
     * "selction:created" canvas event handler
     * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event
     * @private
     */
    _onSelectionCreated(fEvent) {
        this.fire(events.SELECTION_CREATED, fEvent.target);
    }

    /**
     * Canvas discard selection all
     */
    discardSelection() {
        this._canvas.discardActiveGroup();
        this._canvas.discardActiveObject();
        this._canvas.renderAll();
    }

    /**
     * Canvas Selectable status change
     * @param {boolean} selectable - expect status
     */
    changeSelectableAll(selectable) {
        this._canvas.forEachObject(obj => {
            obj.selectable = selectable;
            obj.hoverCursor = selectable ? 'move' : 'crosshair';
        });
    }

    /**
     * Return object's properties
     * @param {fabric.Object} obj - fabric object
     * @returns {Object} properties object
     */
    createObjectProperties(obj) {
        const predefinedKeys = [
            'left',
            'top',
            'width',
            'height',
            'fill',
            'stroke',
            'strokeWidth',
            'opacity'
        ];
        const props = {
            id: stamp(obj),
            type: obj.type
        };

        extend(props, util.getProperties(obj, predefinedKeys));

        if (['i-text', 'text'].indexOf(obj.type) > -1) {
            extend(props, this._createTextProperties(obj, props));
        }

        return props;
    }

    /**
     * Get text object's properties
     * @param {fabric.Object} obj - fabric text object
     * @param {Object} props - properties
     * @returns {Object} properties object
     */
    _createTextProperties(obj) {
        const predefinedKeys = [
            'text',
            'fontFamily',
            'fontSize',
            'fontStyle',
            'textAlign',
            'textDecoration'
        ];
        const props = {};
        extend(props, util.getProperties(obj, predefinedKeys));

        return props;
    }

    /**
     * Add object array by id
     * @param {fabric.Object} obj - fabric object
     * @returns {number} object id
     */
    _addFabricObject(obj) {
        const id = stamp(obj);
        this._objects[id] = obj;

        return id;
    }

    /**
     * Remove an object in array yb id
     * @param {number} id - object id
     */
    _removeFabricObject(id) {
        delete this._objects[id];
    }
}

CustomEvents.mixin(Graphics);
module.exports = Graphics;
