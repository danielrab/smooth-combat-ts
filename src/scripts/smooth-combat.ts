import ensureTargets from './targeting.js';
import { attackRoll } from './AttackRoll.js';
import { damageRoll } from './DamageRoll.js';
import settings from './settings.js';
import AttackResult from './AttackResult.js';

let itemRollOG;
let targetingActive = false;

async function useItem(item: Item, modifiers, target: Token) {
  const attackRollResult = await attackRoll(item, target, modifiers);

  const damageRollResult = await damageRoll(
    item.getRollData(), modifiers.versatile, attackRollResult.critical,
  );

  if (attackRollResult.hits) {
    await damageRollResult.apply(target);
  }
  return new AttackResult(attackRollResult, damageRollResult, item, target);
}

async function safeUseWeapon(item: Item) {
  if (targetingActive) return ui.notifications.warn('resolve queued targeting first');

  const modifiers = {
    // @ts-ignore
    advantage: event.altKey,
    // @ts-ignore
    disadvantage: event.ctrlKey,
    // @ts-ignore
    versatile: event.shiftKey,
  };

  await itemRollOG.call(item);

  targetingActive = true;
  const targets = await ensureTargets(1);
  targetingActive = false;

  if (targets === null) return false; // do nothing if aborted

  await Promise.all(targets.map(
    async (target) => ChatMessage.create({
      sound: 'sounds/dice.wav',
      content: await (await useItem(item, modifiers, target)).attackResultHTML(),
    }),
  ));

  return true;
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
  if (data.type !== 'Item') return;
  if (data.data.type !== 'weapon') return;
  Hooks.once('preCreateMacro', (script) => changeMacro(script, data));
}

Hooks.on('hotbarDrop', onItemHotbarDrop);

Hooks.on('init', () => {
  settings.init();

  itemRollOG = game.dnd5e.entities.Item5e.prototype.roll;
  async function itemRollReplacement(options = {}) {
    if (this.data.type === 'weapon') safeUseWeapon(this);
    else itemRollOG.call(this, options);
  }

  game.dnd5e.entities.Item5e.prototype.roll = itemRollReplacement;
});
