/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Sharpen extending fabric.Image.filters.Convolute
 */
import fabric from 'fabric/dist/fabric.require';

/**
 * Sharpen object
 * @class Sharpen
 * @extends {fabric.Image.filters.Convolute}
 * @ignore
 */
const Sharpen = fabric.util.createClass(fabric.Image.filters.Convolute, /** @lends Convolute.prototype */{
    /**
     * Filter type
     * @param {String} type
     * @default
     */
    type: 'Sharpen',

    /**
     * constructor
     * @override
     */
    initialize() {
        const matrix = [
            0, -1, 0,
            -1, 5, -1,
            0, -1, 0
        ];
        this.matrix = matrix;
    }
});

module.exports = Sharpen;
