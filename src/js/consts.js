/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Constants
 */
import util from './util';

module.exports = {
    /**
     * Component names
     * @type {Object.<string, string>}
     */
    componentNames: util.keyMirror(
        'IMAGE_LOADER',
        'CROPPER',
        'FLIP',
        'ROTATION',
        'FREE_DRAWING',
        'LINE',
        'TEXT',
        'ICON',
        'FILTER',
        'SHAPE'
    ),

    /**
     * Command names
     * @type {Object.<string, string>}
     */
    commandNames: {
        'CLEAR_OBJECTS': 'clearObjects',
        'LOAD_IMAGE': 'loadImage',
        'FLIP_IMAGE': 'flip',
        'ROTATE_IMAGE': 'rotate',
        'ADD_OBJECT': 'addObject',
        'REMOVE_OBJECT': 'removeObject',
        'APPLY_FILTER': 'applyFilter',
        'REMOVE_FILTER': 'removeFilter',
        'ADD_ICON': 'addIcon',
        'CHANGE_ICON_COLOR': 'changeIconColor',
        'ADD_SHAPE': 'addShape',
        'CHANGE_SHAPE': 'changeShape',
        'ADD_TEXT': 'addText',
        'CHANGE_TEXT': 'changeText',
        'CHANGE_TEXT_STYLE': 'changeTextStyle',
        'ADD_IMAGE_OBJECT': 'addImageObject',
        'RESIZE_CANVAS_DIMENSION': 'resizeCanvasDimension',
        'SET_OBJECT_PROPERTIES': 'setObjectProperties',
        'SET_OBJECT_POSITION': 'setObjectPosition'
    },

    /**
     * Event names
     * @type {Object.<string, string>}
     */
    eventNames: {
        OBJECT_ACTIVATED: 'objectActivated',
        OBJECT_MOVED: 'objectMoved',
        OBJECT_SCALED: 'objectScaled',
        OBJECT_CREATED: 'objectCreated',
        TEXT_EDITING: 'textEditing',
        TEXT_CHANGED: 'textChanged',
        ICON_CREATE_RESIZE: 'iconCreateResize',
        ICON_CREATE_END: 'iconCreateEnd',
        ADD_TEXT: 'addText',
        ADD_OBJECT: 'addObject',
        ADD_OBJECT_AFTER: 'addObjectAfter',
        MOUSE_DOWN: 'mousedown',
        MOUSE_UP: 'mouseup',
        MOUSE_MOVE: 'mousemove',
        // UNDO/REDO Events
        REDO_STACK_CHANGED: 'redoStackChanged',
        UNDO_STACK_CHANGED: 'undoStackChanged',
        SELECTION_CLEARED: 'selectionCleared',
        SELECTION_CREATED: 'selectionCreated'
    },

    /**
     * Editor states
     * @type {Object.<string, string>}
     */
    drawingModes: util.keyMirror(
        'NORMAL',
        'CROPPER',
        'FREE_DRAWING',
        'LINE_DRAWING',
        'TEXT',
        'SHAPE'
    ),

    /**
     * Shortcut key values
     * @type {Object.<string, number>}
     */
    keyCodes: {
        Z: 90,
        Y: 89,
        SHIFT: 16,
        BACKSPACE: 8,
        DEL: 46
    },

    /**
     * Fabric object options
     * @type {Object.<string, Object>}
     */
    fObjectOptions: {
        SELECTION_STYLE: {
            borderColor: 'red',
            cornerColor: 'green',
            cornerSize: 10,
            originX: 'center',
            originY: 'center',
            transparentCorners: false
        }
    },

    /**
     * Promise reject messages
     * @type {Object.<string, string>}
     */
    rejectMessages: {
        flip: 'The flipX and flipY setting values are not changed.',
        rotation: 'The current angle is same the old angle.',
        loadImage: 'The background image is empty.',
        isLock: 'The executing command state is locked.',
        undo: 'The promise of undo command is reject.',
        redo: 'The promise of redo command is reject.',
        invalidDrawingMode: 'This operation is not supported in the drawing mode',
        invalidParameters: 'Invalid parameters',
        noActiveObject: 'There is no active object.',
        unsupportedType: 'Unsupported object type',
        noObject: 'The object is not in canvas.',
        addedObject: 'The object is already added.'
    },

    /**
     * Default icon menu svg path
     * @type {Object.<string, string>}
     */
    defaultIconPath: {
        'icon-arrow': 'M40 12V0l24 24-24 24V36H0V12h40z',
        'icon-arrow-2': 'M49,32 H3 V22 h46 l-18,-18 h12 l23,23 L43,50 h-12 l18,-18  z ',
        'icon-arrow-3': 'M43.349998,27 L17.354,53 H1.949999 l25.996,-26 L1.949999,1 h15.404 L43.349998,27  z ',
        'icon-star': 'M35,54.557999 l-19.912001,10.468 l3.804,-22.172001 l-16.108,-15.7 l22.26,-3.236 L35,3.746 l9.956,20.172001 l22.26,3.236 l-16.108,15.7 l3.804,22.172001  z ',
        'icon-star-2': 'M17,31.212 l-7.194,4.08 l-4.728,-6.83 l-8.234,0.524 l-1.328,-8.226 l-7.644,-3.14 l2.338,-7.992 l-5.54,-6.18 l5.54,-6.176 l-2.338,-7.994 l7.644,-3.138 l1.328,-8.226 l8.234,0.522 l4.728,-6.83 L17,-24.312 l7.194,-4.08 l4.728,6.83 l8.234,-0.522 l1.328,8.226 l7.644,3.14 l-2.338,7.992 l5.54,6.178 l-5.54,6.178 l2.338,7.992 l-7.644,3.14 l-1.328,8.226 l-8.234,-0.524 l-4.728,6.83  z ',
        'icon-polygon': 'M3,31 L19,3 h32 l16,28 l-16,28 H19  z ',
        'icon-location': 'M24 62C8 45.503 0 32.837 0 24 0 10.745 10.745 0 24 0s24 10.745 24 24c0 8.837-8 21.503-24 38zm0-28c5.523 0 10-4.477 10-10s-4.477-10-10-10-10 4.477-10 10 4.477 10 10 10z',
        'icon-heart': 'M49.994999,91.349998 l-6.96,-6.333 C18.324001,62.606995 2.01,47.829002 2.01,29.690998 C2.01,14.912998 13.619999,3.299999 28.401001,3.299999 c8.349,0 16.362,5.859 21.594,12 c5.229,-6.141 13.242001,-12 21.591,-12 c14.778,0 26.390999,11.61 26.390999,26.390999 c0,18.138 -16.314001,32.916 -41.025002,55.374001 l-6.96,6.285  z ',
        'icon-bubble': 'M44 48L34 58V48H12C5.373 48 0 42.627 0 36V12C0 5.373 5.373 0 12 0h40c6.627 0 12 5.373 12 12v24c0 6.627-5.373 12-12 12h-8z'
    },

    defaultRotateRangeValus: {
        realTimeEvent: true,
        min: -360,
        max: 360,
        value: 0
    },

    defaultDrawRangeValus: {
        min: 5,
        max: 30,
        value: 12
    },

    defaultShapeStrokeValus: {
        realTimeEvent: false,
        min: 2,
        max: 300,
        value: 3
    },

    defaultTextRangeValus: {
        realTimeEvent: true,
        min: 10,
        max: 100,
        value: 50
    },

    defaultFilterRangeValus: {
        tintOpacityRange: {
            min: 0,
            max: 1,
            value: 0.7
        },
        removewhiteThresholdRange: {
            min: 0,
            max: 255,
            value: 60
        },
        removewhiteDistanceRange: {
            min: 0,
            max: 255,
            value: 10
        },
        gradientTransparencyRange: {
            min: 0,
            max: 255,
            value: 100
        },
        brightnessRange: {
            min: -255,
            max: 255,
            value: 100
        },
        noiseRange: {
            min: 0,
            max: 1000,
            value: 100
        },
        pixelateRange: {
            min: 2,
            max: 20,
            value: 4
        },
        colorfilterThresholeRange: {
            min: 0,
            max: 255,
            value: 45
        }
    }
};
