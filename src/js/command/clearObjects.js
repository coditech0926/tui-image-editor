/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Clear all objects
 */
import commandFactory from '../factory/command';
import Promise from 'core-js/library/es6/promise';
import consts from '../consts';

const {commandNames} = consts;

const command = {
    name: commandNames.CLEAR_OBJECTS,

    /**
     * Clear all objects without background (main) image
     * @param {Graphics} graphics - Graphics instance
     * @returns {Promise}
     */
    execute(graphics) {
        return new Promise(resolve => {
            this.undoData.objects = graphics.removeAll();
            resolve();
        });
    },
    /**
     * @param {Graphics} graphics - Graphics instance
     * @returns {Promise}
     * @ignore
     */
    undo(graphics) {
        graphics.add(this.undoData.objects);

        return Promise.resolve();
    }
};

commandFactory.register(command);

module.exports = command;
