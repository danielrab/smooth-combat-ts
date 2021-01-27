// #region imports
import getSettings from './settingsHandler.js';
import getDebugger from './debug.js';
import * as GMrequests from './GM requests.js';
// #endregion

Hooks.once('init', async () => {
  const settings = getSettings(); // a dictionary-like object allowing for easy access to settings
  const debug = getDebugger(); // handler of debug outputs
  debug.log('initializing in debug mode'); // the line will be outputed in debug mode only
});

Hooks.once('ready', async () => {
  GMrequests.init();
  const test = GMrequests.makeRequestable((x: number) => {
    console.log(x);
    return x + 1;
  }, 'test');
  console.log(await test(1));
});

// #region apply patches

// #endregion

// #region hook to events

// #endregion
