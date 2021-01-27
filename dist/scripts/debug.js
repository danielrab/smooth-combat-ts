/* eslint-disable no-console */
import getSettings from './settingsHandler.js';
import { moduleName } from './constants.js';
class Debugger {
    constructor() {
        this.settings = getSettings();
    }
    get debugMode() {
        return this.settings.debug;
    }
    log(value, force = false) {
        if (this.debugMode || force)
            console.log(`${moduleName} | ${value}`);
    }
}
let debug;
export default function getDebugger() {
    if (!debug)
        debug = new Debugger();
    return debug;
}
