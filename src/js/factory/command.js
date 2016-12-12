/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Command factory
 */
import Promise from 'core-js/library/es6/promise';
import Command from '../interface/command';
import consts from '../consts';

const {componentNames, commandNames} = consts;
const {MAIN, IMAGE_LOADER, FLIP, ROTATION, FILTER} = componentNames;
const creators = {};

creators[commandNames.LOAD_IMAGE] = createLoadImageCommand;
creators[commandNames.FLIP_IMAGE] = createFlipImageCommand;
creators[commandNames.ROTATE_IMAGE] = createRotationImageCommand;
creators[commandNames.CLEAR_OBJECTS] = createClearCommand;
creators[commandNames.ADD_OBJECT] = createAddObjectCommand;
creators[commandNames.REMOVE_OBJECT] = createRemoveCommand;
creators[commandNames.APPLY_FILTER] = createFilterCommand;

/**
 * @param {fabric.Object} object - Fabric object
 * @returns {Command}
 * @ignore
 */
function createAddObjectCommand(object) {
    tui.util.stamp(object);

    return new Command({
        /**
         * @param {object.<string, Component>} compMap - Components injection
         * @returns {Promise}
         * @ignore
         */
        execute(compMap) {
            return new Promise((resolve, reject) => {
                const canvas = compMap[MAIN].getCanvas();

                if (!canvas.contains(object)) {
                    canvas.add(object);
                    resolve(object);
                } else {
                    reject();
                }
            });
        },
        /**
         * @param {object.<string, Component>} compMap - Components injection
         * @returns {Promise}
         * @ignore
         */
        undo(compMap) {
            return new Promise((resolve, reject) => {
                const canvas = compMap[MAIN].getCanvas();

                if (canvas.contains(object)) {
                    canvas.remove(object);
                    resolve(object);
                } else {
                    reject();
                }
            });
        }
    });
}

/**
 * @param {string} imageName - Image name
 * @param {string|fabric.Image} img - Image(or url)
 * @returns {Command}
 * @ignore
 */
function createLoadImageCommand(imageName, img) {
    return new Command({
        /**
         * @param {object.<string, Component>} compMap - Components injection
         * @returns {Promise}
         * @ignore
         */
        execute(compMap) {
            const loader = compMap[IMAGE_LOADER];
            const canvas = loader.getCanvas();

            this.store = {
                prevName: loader.getImageName(),
                prevImage: loader.getCanvasImage(),
                // Slice: "canvas.clear()" clears the objects array, So shallow copy the array
                objects: canvas.getObjects().slice()
            };
            canvas.clear();

            return loader.load(imageName, img);
        },
        /**
         * @param {object.<string, Component>} compMap - Components injection
         * @returns {Promise}
         * @ignore
         */
        undo(compMap) {
            const loader = compMap[IMAGE_LOADER];
            const canvas = loader.getCanvas();
            const store = this.store;
            const canvasContext = canvas;

            canvas.clear();
            canvas.add.apply(canvasContext, store.objects);

            return loader.load(store.prevName, store.prevImage);
        }
    });
}

/**
 * @param {string} type - 'flipX' or 'flipY' or 'reset'
 * @returns {$.Deferred}
 * @ignore
 */
function createFlipImageCommand(type) {
    return new Command({
        /**
         * @param {object.<string, Component>} compMap - Components injection
         * @returns {Promise}
         * @ignore
         */
        execute(compMap) {
            const flipComp = compMap[FLIP];

            this.store = flipComp.getCurrentSetting();

            return flipComp[type]();
        },
        /**
         * @param {object.<string, Component>} compMap - Components injection
         * @returns {Promise}
         * @ignore
         */
        undo(compMap) {
            const flipComp = compMap[FLIP];

            return flipComp.set(this.store);
        }
    });
}

/**
 * @param {string} type - 'rotate' or 'setAngle'
 * @param {number} angle - angle value (degree)
 * @returns {$.Deferred}
 * @ignore
 */
function createRotationImageCommand(type, angle) {
    return new Command({
        /**
         * @param {object.<string, Component>} compMap - Components injection
         * @returns {Promise}
         * @ignore
         */
        execute(compMap) {
            const rotationComp = compMap[ROTATION];

            this.store = rotationComp.getCurrentAngle();

            return rotationComp[type](angle);
        },
        /**
         * @param {object.<string, Component>} compMap - Components injection
         * @returns {Promise}
         * @ignore
         */
        undo(compMap) {
            const rotationComp = compMap[ROTATION];

            return rotationComp.setAngle(this.store);
        }
    });
}

/**
 * Clear command
 * @returns {Command}
 * @ignore
 */
function createClearCommand() {
    return new Command({
        /**
         * @param {object.<string, Component>} compMap - Components injection
         * @returns {Promise}
         * @ignore
         */
        execute(compMap) {
            return new Promise((resolve, reject) => {
                const canvas = compMap[MAIN].getCanvas();
                const objs = canvas.getObjects();

                // Slice: "canvas.clear()" clears the objects array, So shallow copy the array
                this.store = objs.slice();
                if (this.store.length) {
                    tui.util.forEach(objs.slice(), obj => {
                        obj.remove();
                    });
                    resolve();
                } else {
                    reject();
                }
            });
        },
        /**
         * @param {object.<string, Component>} compMap - Components injection
         * @returns {Promise}
         * @ignore
         */
        undo(compMap) {
            const canvas = compMap[MAIN].getCanvas();
            const canvasContext = canvas;

            canvas.add.apply(canvasContext, this.store);

            return Promise.resolve();
        }
    });
}

/**
 * Remove command
 * @param {fabric.Object|fabric.Group} target - Object(s) to remove
 * @returns {Command}
 * @ignore
 */
function createRemoveCommand(target) {
    return new Command({
        /**
         * @param {object.<string, Component>} compMap - Components injection
         * @returns {Promise}
         * @ignore
         */
        execute(compMap) {
            return new Promise((resolve, reject) => {
                const canvas = compMap[MAIN].getCanvas();
                const isValidGroup = target && target.isType('group') && !target.isEmpty();

                if (isValidGroup) {
                    canvas.discardActiveGroup(); // restore states for each objects
                    this.store = target.getObjects();
                    target.forEachObject(obj => {
                        obj.remove();
                    });
                    resolve();
                } else if (canvas.contains(target)) {
                    this.store = [target];
                    target.remove();
                    resolve();
                } else {
                    reject();
                }
            });
        },
        /**
         * @param {object.<string, Component>} compMap - Components injection
         * @returns {Promise}
         * @ignore
         */
        undo(compMap) {
            const canvas = compMap[MAIN].getCanvas();
            const canvasContext = canvas;

            canvas.add.apply(canvasContext, this.store);

            return Promise.resolve();
        }
    });
}

/**
 * Filter command
 * @param {string} type - Filter type
 * @param {object} options - Filter options
 * @returns {Command}
 * @ignore
 */
function createFilterCommand(type, options) {
    return new Command({
        /**
         * @param {object.<string, Component>} compMap - Components injection
         * @returns {Promise}
         * @ignore
         */
        execute(compMap) {
            const filterComp = compMap[FILTER];

            if (type === 'mask') {
                this.store = options.mask;
                options.mask.remove();
            }

            return filterComp.add(type, options);
        },
        /**
         * @param {object.<string, Component>} compMap - Components injection
         * @returns {Promise}
         * @ignore
         */
        undo(compMap) {
            const filterComp = compMap[FILTER];

            if (type === 'mask') {
                filterComp.getCanvas().add(this.store);
            }

            return filterComp.remove(type);
        }
    });
}

/**
 * Create command
 * @param {string} name - Command name
 * @param {...*} args - Arguments for creating command
 * @returns {Command}
 * @ignore
 */
function create(name, ...args) {
    return creators[name].apply(null, args);
}


module.exports = {
    create
};
