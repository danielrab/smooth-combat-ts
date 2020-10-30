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
import attackResultHTML from './html-generation.js';
import attackRoll from './AttackRoll.js';
import damageRoll from './DamageRoll.js';
import settings from './settings.js';
let itemRollOG;
let targetingActive = false;
function useItem(item, modifiers, target) {
    return __awaiter(this, void 0, void 0, function* () {
        const attackRollResult = yield attackRoll(item, target, modifiers);
        const damageRollResult = yield damageRoll(item, modifiers.versatile, attackRollResult.critical);
        if (attackRollResult.hits) {
            yield damageRollResult.apply(target);
        }
        return {
            attackRoll: attackRollResult,
            damageRoll: damageRollResult,
            target,
            item,
            actor: item.actor,
        };
    });
}
function safeUseWeapon(item) {
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
        yield itemRollOG.call(item);
        targetingActive = true;
        const targets = yield ensureTargets(1);
        targetingActive = false;
        if (targets === null)
            return false; // do nothing if aborted
        yield Promise.all(targets.map((target) => __awaiter(this, void 0, void 0, function* () {
            return ChatMessage.create({
                sound: 'sounds/dice.wav',
                content: yield attackResultHTML(yield useItem(item, modifiers, target)),
            });
        })));
        return true;
    });
}
function changeMacro(script, itemData) {
    script.command = `let actor = game.actors.tokens["${itemData.tokenId}"];
if (!actor) actor = game.actors.get("${itemData.actorId}");

let item;
if (actor) item = actor.items.get("${itemData.data._id}");
  
if (item) item.roll();
else game.dnd5e.rollItemMacro("${itemData.data.name}")`;
}
function onItemHotbarDrop(hotbar, data) {
    if (data.type !== 'Item')
        return;
    if (data.data.type !== 'weapon')
        return;
    Hooks.once('preCreateMacro', (script) => changeMacro(script, data));
}
Hooks.on('hotbarDrop', onItemHotbarDrop);
Hooks.on('init', () => {
    settings.init();
    itemRollOG = game.dnd5e.entities.Item5e.prototype.roll;
    function itemRollReplacement(options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.data.type === 'weapon')
                safeUseWeapon(this);
            else
                itemRollOG.call(this, options);
        });
    }
    game.dnd5e.entities.Item5e.prototype.roll = itemRollReplacement;
});
