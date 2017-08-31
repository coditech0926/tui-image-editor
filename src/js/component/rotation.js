/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Image rotation module
 */
import fabric from 'fabric/dist/fabric.require';
import Promise from 'core-js/library/es6/promise';
import Component from '../interface/component';
import consts from '../consts';

const {componentNames} = consts;

/**
 * Image Rotation component
 * @class Rotation
 * @extends {Component}
 * @param {Graphics} graphics - Graphics instance
 * @ignore
 */
class Rotation extends Component {
    constructor(graphics) {
        super(componentNames.ROTATION, graphics);
    }

    /**
     * Get current angle
     * @returns {Number}
     */
    getCurrentAngle() {
        return this.getCanvasImage().angle;
    }

    /**
     * Set angle of the image
     *
     *  Do not call "this.setImageProperties" for setting angle directly.
     *  Before setting angle, The originX,Y of image should be set to center.
     *      See "http://fabricjs.com/docs/fabric.Object.html#setAngle"
     *
     * @param {number} angle - Angle value
     * @returns {jQuery.Deferred}
     */
    setAngle(angle) {
        const oldAngle = this.getCurrentAngle() % 360; // The angle is lower than 2*PI(===360 degrees)

        angle %= 360;

        const canvasImage = this.getCanvasImage();
        const oldImageCenter = canvasImage.getCenterPoint();
        canvasImage.setAngle(angle).setCoords();
        this.adjustCanvasDimension();
        const newImageCenter = canvasImage.getCenterPoint();
        this._rotateForEachObject(oldImageCenter, newImageCenter, angle - oldAngle);

        return Promise.resolve(angle);
    }

    /**
     * Rotate for each object
     * @param {fabric.Point} oldImageCenter - Image center point before rotation
     * @param {fabric.Point} newImageCenter - Image center point after rotation
     * @param {number} angleDiff - Image angle difference after rotation
     * @private
     */
    _rotateForEachObject(oldImageCenter, newImageCenter, angleDiff) {
        const canvas = this.getCanvas();
        const centerDiff = {
            x: oldImageCenter.x - newImageCenter.x,
            y: oldImageCenter.y - newImageCenter.y
        };

        canvas.forEachObject(obj => {
            const objCenter = obj.getCenterPoint();
            const radian = fabric.util.degreesToRadians(angleDiff);
            const newObjCenter = fabric.util.rotatePoint(objCenter, oldImageCenter, radian);

            obj.set({
                left: newObjCenter.x - centerDiff.x,
                top: newObjCenter.y - centerDiff.y,
                angle: (obj.angle + angleDiff) % 360
            });
            obj.setCoords();
        });
        canvas.renderAll();
    }

    /**
     * Rotate the image
     * @param {number} additionalAngle - Additional angle
     * @returns {jQuery.Deferred}
     */
    rotate(additionalAngle) {
        const current = this.getCurrentAngle();

        return this.setAngle(current + additionalAngle);
    }
}

module.exports = Rotation;
