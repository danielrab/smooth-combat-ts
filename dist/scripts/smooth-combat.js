var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import ensureTargets from './targeting.js';
import { attackRoll } from './rolls/AttackRoll.js';
import { damageRoll } from './rolls/DamageRoll.js';
import { settings, moduleName } from './settings.js';
import { AttackResult } from './rolls/AttackResult.js';
let itemRollOG;
let templateFromItemOG;
let targetingActive = false;
function useItem(item, modifiers, target, doAttack) {
    return __awaiter(this, void 0, void 0, function* () {
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
        let doAttack = true;
        let canHandle = true;
        let isSave = false;
        switch (this.data.data.actionType) {
            case 'mwak':
            case 'rwak':
                targets = yield ensureTargets(1);
                break;
            case 'heal':
            case 'utility':
                doAttack = false;
                break;
            case 'save':
                doAttack = false;
                isSave = true;
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
        if (isSave)
            canHandle = false;
        if (!canHandle)
            return false; // do nothing if aborted
        yield Promise.all(targets.map((target) => __awaiter(this, void 0, void 0, function* () {
            const attackResult = yield useItem(this, modifiers, target, doAttack);
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
function changeMacro(script, itemData) {
    const defineActor = itemData.tokenId ? `let the_actor = game.actors.tokens["${itemData.tokenId}"];
if (!the_actor) the_actor = game.actors.get("${itemData.actorId}");` : `let the_actor = game.actors.get("${itemData.actorId}");`;
    script.command = `${defineActor}

let item;
if (the_actor) item = the_actor.items.get("${itemData.data._id}");

if (item) {
  if ( item.data.type === "spell" ) the_actor.useSpell(item);
  else item.roll();
}
else game.dnd5e.rollItemMacro("${itemData.data.name}")`;
}
function onItemHotbarDrop(hotbar, item) {
    if (item.type !== 'Item')
        return;
    if (!['weapon', 'spell'].includes(item.data.type))
        return;
    Hooks.once('preCreateMacro', (script) => changeMacro(script, item));
}
Hooks.on('hotbarDrop', onItemHotbarDrop);
function processMessageFlags(message) {
    if (!game.user.isGM || message.getFlag(moduleName, 'processed'))
        return;
    const attackFlag = message.getFlag(moduleName, 'attack');
    if (attackFlag && settings.applyDamage) {
        const { damage, hits } = attackFlag;
        const target = game.actors.get(attackFlag.target);
        if (hits) {
            damage.forEach((value) => {
                if (value.type === 'temphp')
                    target.update({ 'data.attributes.hp.temp': Math.max(value.total, target.data.data.attributes.hp.temp) });
                else
                    target.applyDamage(value.total, target.damageMultiplier(value.type));
            });
        }
    }
    message.setFlag(moduleName, 'processed', true);
}
function processTemplateFlags(scene, template, options, userId) {
    if (userId !== game.user.id)
        return;
    const { item } = template.flags[moduleName];
}
Hooks.on('init', () => {
    settings.init();
    itemRollOG = game.dnd5e.entities.Item5e.prototype.roll;
    game.dnd5e.entities.Item5e.prototype.roll = newItemRoll;
    templateFromItemOG = game.dnd5e.canvas.AbilityTemplate.fromItem;
    function abilityTemplateReplacement(item) {
        const template = templateFromItemOG.call(this, item);
        if (!template.data.flags)
            template.data.flags = {};
        template.data.flags[moduleName] = { item };
        return template;
    }
    game.dnd5e.canvas.AbilityTemplate.fromItem = abilityTemplateReplacement;
});
Hooks.on('renderChatMessage', processMessageFlags);
Hooks.on('createMeasuredTemplate', processTemplateFlags);
