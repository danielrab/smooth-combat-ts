import { AttackRollHandler } from './AttackRoll.js';
import { DamageRollHandler } from './DamageRoll.js';

export default class AttackResult {
  attackRoll: AttackRollHandler;
  damageRoll: DamageRollHandler;
  item: Item<any>;
  target: Token;
  actor: Actor<any>;

  constructor(
    attackRollResult: AttackRollHandler,
    damageRollResult: DamageRollHandler,
    item: Item,
    target: Token,
  ) {
    this.attackRoll = attackRollResult;
    this.damageRoll = damageRollResult;
    this.item = item;
    this.target = target;
    this.actor = item.actor;
  }

  attackResultHTML() {
    return renderTemplate('./modules/smooth-combat/templates/attackResult.hbs', this);
  }
}
