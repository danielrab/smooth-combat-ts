import ensureTargets from './helpers/targeting.js';
import { attackRoll } from './rolls/AttackRoll.js';
import { damageRoll } from './rolls/DamageRoll.js';
import { settings, moduleName } from './settings.js';
import { AttackResult, AttackFlag } from './rolls/AttackResult.js';
import onItemHotbarDrop from './helpers/macro-generation.js';
import ActorHelper from './helpers/actor.js';

let itemRollOG;
let targetingActive = false;

async function useItem(item: Item, modifiers, target: Actor, options: {doAttack: boolean, isSave: boolean, canHandle: boolean}) {
  const { doAttack } = options;
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
  let canHandle = true;
  const rollOptions = {
    doAttack: ['mwak', 'rwak', 'msak', 'rsak'].includes(this.data.data.actionType),
    isSave: this.data.data.actionType === 'save',
    canHandle: ['mwak', 'rwak', 'msak', 'rsak', 'save', 'heal'].includes(this.data.data.actionType),
  };

  switch (this.data.data.actionType) {
    case 'mwak':
    case 'rwak':
      targets = await ensureTargets(1);
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
  if (!canHandle) return false; // do nothing if aborted

  await Promise.all(targets.map(async (target) => {
    const attackResult = await useItem(this, modifiers, target, rollOptions);
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

function processMessageFlags(message: ChatMessage) {
  if (!game.user.isGM || message.getFlag(moduleName, 'processed')) return;
  const attackFlag: AttackFlag = message.getFlag(moduleName, 'attack');
  if (attackFlag && settings.applyDamage) {
    ActorHelper.applyAttackFlag(attackFlag);
  }
  message.setFlag(moduleName, 'processed', true);
}

Hooks.on('renderChatMessage', processMessageFlags);

function init() {
  // the first thing called after system initialization
  settings.init();
  if (settings.alternativeMacro) Hooks.on('hotbarDrop', onItemHotbarDrop);

  itemRollOG = game.dnd5e.entities.Item5e.prototype.roll;
  game.dnd5e.entities.Item5e.prototype.roll = newItemRoll;
}

Hooks.once('init', init);
