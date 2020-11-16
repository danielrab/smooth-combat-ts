import ensureTargets from './targeting.js';
import { attackRoll } from './rolls/AttackRoll.js';
import { damageRoll } from './rolls/DamageRoll.js';
import { settings, moduleName } from './settings.js';
import { AttackResult, AttackFlag } from './rolls/AttackResult.js';

let itemRollOG;
let templateFromItemOG;
let targetingActive = false;

async function useItem(item: Item, modifiers, target: Actor, doAttack: boolean) {
  const attackRollResult = doAttack ? await attackRoll(item, target, modifiers) : null;

  const damageRollResult = await damageRoll(
    item.getRollData(), modifiers.versatile, attackRollResult?.critical, item.actor,
  );

  return new AttackResult(attackRollResult, damageRollResult, item, target);
}

async function newItemRoll(options = {}) {
  if (targetingActive) return ui.notifications.warn('resolve queued targeting first');

  const modifiers = {
    // @ts-ignore
    advantage: event.altKey,
    // @ts-ignore
    disadvantage: event.ctrlKey,
    // @ts-ignore
    versatile: event.shiftKey,
  };

  await itemRollOG.call(this, options);

  targetingActive = true;
  let targets: Actor[] = null;
  let doAttack = true;
  let canHandle = true;
  let isSave = false;

  switch (this.data.data.actionType) {
    case 'mwak':
    case 'rwak':
      targets = await ensureTargets(1);
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
        if (this.data.data.target.value) targets = await ensureTargets(this.data.data.target.value);
        else if (this.data.data.target.units === 'touch') targets = await ensureTargets(1);
        else canHandle = false;
        break;
      case 'self':
        targets = [this.actor];
        break;
      default:
        canHandle = false;
    }
  }
  targetingActive = false;

  if (isSave) canHandle = false;
  if (!canHandle) return false; // do nothing if aborted

  await Promise.all(targets.map(async (target) => {
    const attackResult = await useItem(this, modifiers, target, doAttack);
    const flags = {};
    flags[moduleName] = { attack: attackResult.flags, processed: false };
    ChatMessage.create({
      sound: 'sounds/dice.wav',
      content: (await attackResult.query()).html(),
      flags,
    });
  }));

  return true;
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
  if (item.type !== 'Item') return;
  if (!['weapon', 'spell'].includes(item.data.type)) return;
  Hooks.once('preCreateMacro', (script) => changeMacro(script, item));
}

Hooks.on('hotbarDrop', onItemHotbarDrop);

function processMessageFlags(message: ChatMessage) {
  if (!game.user.isGM || message.getFlag(moduleName, 'processed')) return;
  const attackFlag: AttackFlag = message.getFlag(moduleName, 'attack');
  if (attackFlag && settings.applyDamage) {
    const { damage, hits } = attackFlag;
    const target = game.actors.get(attackFlag.target);
    if (hits) {
      damage.forEach((value) => {
        if (value.type === 'temphp') target.update({ 'data.attributes.hp.temp': Math.max(value.total, target.data.data.attributes.hp.temp) });
        else target.applyDamage(value.total, target.damageMultiplier(value.type));
      });
    }
  }
  message.setFlag(moduleName, 'processed', true);
}

function processTemplateFlags(scene: Scene, template: MeasuredTemplate, options, userId: string) {
  if (userId !== game.user.id) return;
  const { item } = template.flags[moduleName];
}

Hooks.on('init', () => {
  settings.init();

  itemRollOG = game.dnd5e.entities.Item5e.prototype.roll;
  game.dnd5e.entities.Item5e.prototype.roll = newItemRoll;

  templateFromItemOG = game.dnd5e.canvas.AbilityTemplate.fromItem;
  function abilityTemplateReplacement(item) {
    const template = templateFromItemOG.call(this, item);
    if (!template.data.flags) template.data.flags = {};
    template.data.flags[moduleName] = { item };
    return template;
  }
  game.dnd5e.canvas.AbilityTemplate.fromItem = abilityTemplateReplacement;
});

Hooks.on('renderChatMessage', processMessageFlags);
Hooks.on('createMeasuredTemplate', processTemplateFlags);
