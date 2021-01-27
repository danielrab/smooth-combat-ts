var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// #region imports
import getSettings from './settingsHandler.js';
import getDebugger from './debug.js';
import * as GMrequests from './GM requests.js';
// #endregion
Hooks.once('init', () => __awaiter(void 0, void 0, void 0, function* () {
    const settings = getSettings(); // a dictionary-like object allowing for easy access to settings
    const debug = getDebugger(); // handler of debug outputs
    debug.log('initializing in debug mode'); // the line will be outputed in debug mode only
}));
Hooks.once('ready', () => __awaiter(void 0, void 0, void 0, function* () {
    GMrequests.init();
    const test = GMrequests.makeRequestable((x) => {
        console.log(x);
        return x + 1;
    }, 'test');
    console.log(yield test(1));
}));
// #region apply patches
// #endregion
// #region hook to events
// #endregion
