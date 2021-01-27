var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import ensureTargets from './helpers/targeting.js';
import { attackRoll } from './rolls/AttackRoll.js';
import { damageRoll } from './rolls/DamageRoll.js';
import { settings, moduleName } from './settings.js';
import { AttackResult } from './rolls/AttackResult.js';
import onItemHotbarDrop from './helpers/macro-generation.js';
import ActorHelper from './helpers/actor.js';
let itemRollOG;
let targetingActive = false;
function useItem(item, modifiers, target, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const { doAttack } = options;
        const attackRollResult = doAttack ? yield attackRoll(item, target, modifiers) : null;
        const damageRollResult = yield damageRoll(item.getRollData(), modifiers.versatile, attackRollResult === null || attackRollResult === void 0 ? void 0 : attackRollResult.critical, item.actor);
        return new AttackResult(attackRollResult, damageRollResult, item, target);
    });
}
function newItemRoll(options = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        if (targetingActive)
            return ui.notifications.warn('resolve queued targeting first');
        const modifiers = {
            // @ts-ignore
            advantage: event.altKey,
            // @ts-ignore
            disadvantage: event.ctrlKey,
            // @ts-ignore
            versatile: event.shiftKey,
        };
        yield itemRollOG.call(this, options);
        targetingActive = true;
        let targets = null;
        let canHandle = true;
        const rollOptions = {
            doAttack: ['mwak', 'rwak', 'msak', 'rsak'].includes(this.data.data.actionType),
            isSave: this.data.data.actionType === 'save',
            canHandle: ['mwak', 'rwak', 'msak', 'rsak', 'save', 'heal'].includes(this.data.data.actionType),
        };
        switch (this.data.data.actionType) {
            case 'mwak':
            case 'rwak':
                targets = yield ensureTargets(1);
                break;
            case 'heal':
            case 'utility':
                break;
            case 'save':
                break;
            case 'msak':
            case 'rsak':
                break;
            default:
                canHandle = false;
        }
        if (!targets) {
            switch (this.data.data.target.type) {
                case 'ally':
                case 'creature':
                    if (this.data.data.target.value)
                        targets = yield ensureTargets(this.data.data.target.value);
                    else if (this.data.data.target.units === 'touch')
                        targets = yield ensureTargets(1);
                    else
                        canHandle = false;
                    break;
                case 'self':
                    targets = [this.actor];
                    break;
                default:
                    canHandle = false;
            }
        }
        targetingActive = false;
        if (!canHandle)
            return false; // do nothing if aborted
        yield Promise.all(targets.map((target) => __awaiter(this, void 0, void 0, function* () {
            const attackResult = yield useItem(this, modifiers, target, rollOptions);
            const flags = {};
            flags[moduleName] = { attack: attackResult.flags, processed: false };
            ChatMessage.create({
                sound: 'sounds/dice.wav',
                content: (yield attackResult.query()).html(),
                flags,
            });
        })));
        return true;
    });
}
function processMessageFlags(message) {
    if (!game.user.isGM || message.getFlag(moduleName, 'processed'))
        return;
    const attackFlag = message.getFlag(moduleName, 'attack');
    if (attackFlag && settings.applyDamage) {
        ActorHelper.applyAttackFlag(attackFlag);
    }
    message.setFlag(moduleName, 'processed', true);
}
Hooks.on('renderChatMessage', processMessageFlags);
function init() {
    // the first thing called after system initialization
    settings.init();
    if (settings.alternativeMacro)
        Hooks.on('hotbarDrop', onItemHotbarDrop);
    itemRollOG = game.dnd5e.entities.Item5e.prototype.roll;
    game.dnd5e.entities.Item5e.prototype.roll = newItemRoll;
}
Hooks.once('init', init);
