/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Image loader
 */
import Component from '../interface/component';
import consts from '../consts';

const imageOption = {
    padding: 0,
    crossOrigin: 'anonymous'
};

/**
 * ImageLoader components
 * @extends {Component}
 * @class ImageLoader
 * @param {Component} parent - parent component
 * @ignore
 */
class ImageLoader extends Component {
    constructor(parent) {
        super();
        this.setParent(parent);

        /**
         * Component name
         * @type {string}
         */
        this.name = consts.componentNames.IMAGE_LOADER;
    }

    /**
     * Load image from url
     * @param {?string} imageName - File name
     * @param {?(fabric.Image|string)} img - fabric.Image instance or URL of an image
     * @returns {jQuery.Deferred} deferred
     */
    load(imageName, img) {
        let jqDefer;

        if (!imageName && !img) { // Back to the initial state, not error.
            const canvas = this.getCanvas();

            canvas.backgroundImage = null;
            canvas.renderAll();

            jqDefer = $.Deferred(() => {
                this.setCanvasImage('', null);
            }).resolve();
        } else {
            jqDefer = this._setBackgroundImage(img).done(oImage => {
                this.setCanvasImage(imageName, oImage);
                this.adjustCanvasDimension();
            });
        }

        return jqDefer;
    }

    /**
     * Set background image
     * @param {?(fabric.Image|String)} img fabric.Image instance or URL of an image to set background to
     * @returns {$.Deferred} deferred
     * @private
     */
    _setBackgroundImage(img) {
        const jqDefer = $.Deferred();

        if (!img) {
            return jqDefer.reject();
        }

        const canvas = this.getCanvas();

        canvas.setBackgroundImage(img, () => {
            const oImage = canvas.backgroundImage;

            if (oImage.getElement()) {
                jqDefer.resolve(oImage);
            } else {
                jqDefer.reject();
            }
        }, imageOption);

        return jqDefer;
    }
}

module.exports = ImageLoader;
