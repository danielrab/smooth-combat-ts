// handling of settings and potentially other things to be initialized.
import { defaultSettings, moduleName } from './constants.js';
let settings;
function init() {
    settings = {};
    for (const [key, value] of Object.entries(defaultSettings)) {
        game.settings.register(moduleName, key, Object.assign({ name: "Unnamed setting. it's a bug, contact danielrab on discord or GitHub", scope: 'world', config: true, type: value.default.constructor }, value));
        Object.defineProperty(settings, key, {
            get() {
                return game.settings.get(moduleName, key);
            },
            set(val) {
                game.settings.set(moduleName, key, val);
            },
        });
    }
}
export default function getSettings() {
    if (!settings)
        init();
    return settings;
}
