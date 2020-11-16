export const moduleName = 'smooth-combat';

interface SettingsOptions{
  name: string,
  default: any,
}

class Settings {
  applyDamage: boolean;
  removeTargetsPre: boolean;
  removeRargetsPost: boolean;

  init() {
    this.registerSetting('applyDamage', { name: 'Apply damage automatically', default: true });
    this.registerSetting('removeTargetsPre', { name: 'Remove targets before an attack', default: true });
    this.registerSetting('removeRargetsPost', { name: 'Remove targets after an attack', default: true });
  }

  registerSetting(internalName: string, options: SettingsOptions) {
    game.settings.register(moduleName, internalName, {
      name: 'Unnamed setting, contact danielrab on discord or GitHub',
      scope: 'world',
      config: true,
      type: options.default.constructor,
      default: true, // The default value for the setting
      ...options,
    });
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
