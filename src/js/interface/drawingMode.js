/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview DrawingMode interface
 */
import errorMessage from '../factory/errorMessage';

const createMessage = errorMessage.create;
const errorTypes = errorMessage.types;

/**
 * DrawingMode interface
 * @class
 * @param {string} name - drawing mode name
 * @ignore
 */
class DrawingMode {
    constructor(name) {
        /**
         * the name of drawing mode
         * @type {string}
         */
        this.name = name;
    }

    /**
     * Get this drawing mode name;
     * @returns {string} drawing mode name
     */
    getName() {
        return this.name;
    }

    /**
    * start this drawing mode
    * @param {Object} options - drawing mode options
    * @abstract
    */
    start() {
        throw new Error(createMessage(errorTypes.UN_IMPLEMENTATION, 'start'));
    }

    /**
     * stop this drawing mode
     * @abstract
     */
    stop() {
        throw new Error(createMessage(errorTypes.UN_IMPLEMENTATION, 'stop'));
    }
}

module.exports = DrawingMode;
