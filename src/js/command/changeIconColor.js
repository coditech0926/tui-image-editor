/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Change icon color
 */
import commandFactory from '../factory/command';
import Promise from 'core-js/library/es6/promise';
import consts from '../consts';

const {componentNames, rejectMessages, commandNames} = consts;
const {ICON} = componentNames;

const command = {
    name: commandNames.CHANGE_ICON_COLOR,

    /**
     * Change icon color
     * @param {Graphics} graphics - Graphics instance
     * @param {number} id - object id
     * @param {string} color - Color for icon
     * @returns {Promise}
     */
    execute(graphics, id, color) {
        return new Promise((resolve, reject) => {
            const iconComp = graphics.getComponent(ICON);
            const targetObj = graphics.getObject(id);

            if (!targetObj) {
                reject(rejectMessages.noObject);
            }

            this.undoData.object = targetObj;
            this.undoData.color = iconComp.getColor(targetObj);
            iconComp.setColor(color, targetObj);
            resolve();
        });
    },
    /**
     * @param {Graphics} graphics - Graphics instance
     * @returns {Promise}
     */
    undo(graphics) {
        const iconComp = graphics.getComponent(ICON);
        const {object: icon, color} = this.undoData.object;

        iconComp.setColor(color, icon);

        return Promise.resolve();
    }
};

commandFactory.register(command);

module.exports = command;
