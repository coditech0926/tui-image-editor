/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview TextDrawingMode class
 */
import DrawingMode from '../interface/drawingMode';
import consts from '../consts';

const {drawingModes} = consts;
const components = consts.componentNames;

/**
 * TextDrawingMode class
 * @class
 * @ignore
 */
class TextDrawingMode extends DrawingMode {
    constructor() {
        super(drawingModes.TEXT);
    }

    /**
    * start this drawing mode
    * @param {Graphics} graphics - Graphics instance
    * @override
    */
    start(graphics) {
        const text = graphics.getComponent(components.TEXT);
        text.start();
    }

    /**
     * stop this drawing mode
     * @param {Graphics} graphics - Graphics instance
     * @override
     */
    end(graphics) {
        const text = graphics.getComponent(components.TEXT);
        text.end();
    }
}

module.exports = TextDrawingMode;
