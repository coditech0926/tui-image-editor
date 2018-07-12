import Submenu from './submenuBase';
import util from '../util';
import templateHtml from './template/submenu/mask';

/**
 * Mask ui class
 * @class
 * @ignore
 */
class Mask extends Submenu {
    constructor(subMenuElement, {iconStyle, menuBarPosition}) {
        super(subMenuElement, {
            name: 'mask',
            iconStyle,
            menuBarPosition,
            templateHtml
        });

        this._els = {
            applyButton: this.selector('#tie-mask-apply'),
            maskImageButton: this.selector('#tie-mask-image-file')
        };
    }

    /**
     * Add event for mask
     * @param {Object} actions - actions for crop
     *   @param {Function} actions.loadImageFromURL - load image action
     *   @param {Function} actions.applyFilter - apply filter action
     */
    addEvent(actions) {
        this.actions = actions;
        this._els.maskImageButton.addEventListener('change', this._loadMaskFile.bind(this));
        this._els.applyButton.addEventListener('click', this._applyMask.bind(this));
    }

    /**
     * Apply mask
     * @private
     */
    _applyMask() {
        this.actions.applyFilter();
        this._els.applyButton.classList.remove('active');
    }

    /**
     * Load mask file
     * @param {object} event - File change event object
     * @private
     */
    _loadMaskFile(event) {
        let imgUrl;

        if (!util.isSupportFileApi()) {
            alert('This browser does not support file-api');
        }

        const [file] = event.target.files;

        if (file) {
            imgUrl = URL.createObjectURL(file);
            this.actions.loadImageFromURL(imgUrl, file);
            this._els.applyButton.classList.add('active');
        }
    }
}

export default Mask;
