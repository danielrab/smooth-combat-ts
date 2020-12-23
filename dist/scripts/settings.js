export const moduleName = 'smooth-combat';
class Settings {
    init() {
        this.registerSetting('alternativeMacro', {
            name: 'Alternative item macros',
            default: true,
            desc: 'Change new item macros to make them work when no token is selected',
        });
        this.registerSetting('applyDamage', { name: 'Apply damage automatically', default: true });
        this.registerSetting('removeTargetsPre', { name: 'Remove targets before an attack', default: true });
        this.registerSetting('removeRargetsPost', { name: 'Remove targets after an attack', default: true });
    }
    // register setting and add it as a property of the settings object
    registerSetting(internalName, options) {
        game.settings.register(moduleName, internalName, Object.assign({ name: 'Unnamed setting, contact danielrab on discord or GitHub', scope: 'world', config: true, type: options.default.constructor, default: true }, options));
        Object.defineProperty(this, internalName, {
            get() {
                return game.settings.get(moduleName, internalName);
            },
            set(value) {
                game.settings.set(moduleName, internalName, value);
            },
        });
    }
}
export const settings = new Settings();
