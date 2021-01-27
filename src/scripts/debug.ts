/* eslint-disable no-console */
import getSettings from './settingsHandler.js';
import { moduleName } from './constants.js';
import type { Settings } from './constants.js';

class Debugger {
  settings: Settings
  constructor() {
    this.settings = getSettings();
  }

  get debugMode() {
    return this.settings.debug;
  }

  log(value: any, force = false) {
    if (this.debugMode || force) console.log(`${moduleName} | ${value}`);
  }
}

let debug: Debugger;

export default function getDebugger() {
  if (!debug) debug = new Debugger();
  return debug;
}
