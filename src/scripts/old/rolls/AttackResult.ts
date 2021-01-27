import { AttackRollHandler } from './AttackRoll.js';
import { DamageRollHandler } from './DamageRoll.js';

export type AttackFlag = {
  actor: string
  attack: number
  crit: boolean
  damage: {total: number, type: string}[]
  fumble: boolean
  hits: boolean
  item: string
  target: string
}

export class AttackResult {
  attackRoll: AttackRollHandler;
  damageRoll: DamageRollHandler;
  item: Item<any>;
  target: Actor;
  actor: Actor<any>;

  constructor(
    attackRollResult: AttackRollHandler,
    damageRollResult: DamageRollHandler,
    item: Item,
    target: Actor,
  ) {
    this.attackRoll = attackRollResult;
    this.damageRoll = damageRollResult;
    this.item = item;
    this.target = target;
    this.actor = item.actor;
  }

  async query() {
    const res = $('<div>');

    if (this.attackRoll) res.append(await this.attackRoll.query());
    res.append(`${this.actor.name} `);

    if (!this.attackRoll) res.append(`uses ${this.item.name} on ${this.target.name}`);
    else res.append(`${this.attackRoll.hits ? 'hits' : 'misses'} ${this.target.name} with ${this.item.name}`);

    if (!this.attackRoll || this.attackRoll.hits) {
      res.append('<br>dealing');
      res.append(this.damageRoll.query());
    }

    return res;
  }

  render() {
    return renderTemplate('./modules/smooth-combat/templates/attackResult.hbs', this);
  }

  get flags(): AttackFlag {
    return {
      actor: this.actor.id,
      attack: this.attackRoll?.total,
      crit: this.attackRoll ? this.attackRoll.critical : false,
      damage: this.damageRoll.parts.map((part) => ({ total: part.total, type: part.type })),
      fumble: this.attackRoll ? this.attackRoll.fumble : false,
      hits: this.attackRoll ? this.attackRoll.hits : true,
      item: this.item.id,
      target: this.target.id,
    };
  }
}
