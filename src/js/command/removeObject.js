/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Remove an object
 */
import commandFactory from '../factory/command';
import Promise from 'core-js/library/es6/promise';
import consts from '../consts';

const {commandNames, rejectMessages} = consts;

const command = {
    name: commandNames.REMOVE_OBJECT,

    /**
     * Remove an object
     * @param {Graphics} graphics - Graphics instance
     * @param {number} id - object id
     * @returns {Promise}
     */
    execute(graphics, id) {
        return new Promise((resolve, reject) => {
            this.undoData.objects = graphics.removeObjectById(id);
            if (this.undoData.objects.length) {
                resolve();
            } else {
                reject(rejectMessages.noObject);
            }
        });
    },
    /**
     * @param {Graphics} graphics - Graphics instance
     * @returns {Promise}
     */
    undo(graphics) {
        graphics.add(this.undoData.objects);

        return Promise.resolve();
    }
};

commandFactory.register(command);

module.exports = command;
