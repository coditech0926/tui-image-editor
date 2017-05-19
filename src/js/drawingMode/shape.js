/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview ShapeDrawingMode class
 */
import DrawingMode from '../interface/drawingMode';
import consts from '../consts';

const {drawingModes} = consts;
const components = consts.componentNames;

/**
 * ShapeDrawingMode class
 * @class
 * @ignore
 */
class ShapeDrawingMode extends DrawingMode {
    constructor() {
        super(drawingModes.SHAPE);
    }

    /**
    * start this drawing mode
    * @param {Graphics} graphics - Graphics instance
    * @override
    */
    start(graphics) {
        const shape = graphics.getComponent(components.SHAPE);
        shape.start();
    }

    /**
     * stop this drawing mode
     * @param {Graphics} graphics - Graphics instance
     * @override
     */
    end(graphics) {
        const shape = graphics.getComponent(components.SHAPE);
        shape.end();
    }
}

module.exports = ShapeDrawingMode;
