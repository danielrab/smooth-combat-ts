import { applyProcessors, deduplicate, ProcessedValue } from './misc.js';
import type { Processor } from './misc.js';
import type { AttackFlag } from '../rolls/AttackResult.js';

export default class ActorHelper {
  readonly actor: Actor
  resistancesProcessors: Processor<string[], {magical: boolean}>[]
  DAMAGE_MULTIPLIERS: {[key: string]: {value: number, array: ProcessedValue<string[], {magical: boolean}>}}
  readonly ['constructor']: typeof ActorHelper

  constructor(actor: string|Actor) {
    this.actor = typeof actor === 'string' ? game.actors.get(actor) : actor;
    this.DAMAGE_MULTIPLIERS = {
      resistances: {
        value: 0.5,
        array: new ProcessedValue(this.resistances, ActorHelper.damageTypeProcessors),
      },
      immunities: {
        value: 0,
        array: new ProcessedValue(this.immunities, ActorHelper.damageTypeProcessors),
      },
      vulnurabilities: {
        value: 2,
        array: new ProcessedValue(this.vulnurabilities, ActorHelper.damageTypeProcessors),
      },
      healing: {
        value: -1,
        array: new ProcessedValue(ActorHelper.HEALING, []),
      },
    };
  }

  static PHYSICAL = ['bludgeoning', 'piercing', 'slashing'];
  static HEALING = ['healing'];
  static DEFAULT_MULTIPLIER = 1;
  static damageTypeProcessors = [ActorHelper.addPhysicalIfNeeded, deduplicate];

  static multiplierProcessors: Processor<number, {type: string, actorHelper: ActorHelper, magical: boolean}>[] = [
    (multiplier, options) => {
      for (const damageMultiplier of Object.values(options.actorHelper.DAMAGE_MULTIPLIERS)) {
        if (damageMultiplier.array.value(options).includes(options.type)) multiplier *= damageMultiplier.value;
      }
      return multiplier;
    },
  ]

  static addPhysicalIfNeeded(list: string[], options: {magical: boolean}) {
    if (!options.magical && list.includes('physical')) return list.concat(this.PHYSICAL);
    return list;
  }

  get data() { return this.actor.data; }
  get deepData() { return this.data.data; }

  get traits() { return this.deepData.traits; }
  get resistances(): string[] { return this.traits.dr.value; }
  get immunities(): string[] { return this.traits.di.value; }
  get vulnurabilities(): string[] { return this.traits.dv.value; }

  damageMultiplier(options: { magical: boolean, type: string, actorHelper?: ActorHelper }) {
    if (!options.actorHelper) options.actorHelper = this;
    return applyProcessors(options.actorHelper.constructor.DEFAULT_MULTIPLIER, options.actorHelper.constructor.multiplierProcessors, options);
  }

  get attributes() { return this.deepData.attributes; }
  get ac(): number { return this.attributes.ac.value; }
  get tempHP(): number { return this.attributes.hp.temp; }

  giveTempHP(value: number) {
    this.actor.update({ 'data.attributes.hp.temp': Math.max(value, this.tempHP) });
  }

  applyDamage(type: string, value: number, magical: boolean) {
    if (type === 'temphp') this.giveTempHP(value);
    else this.actor.applyDamage(value, this.damageMultiplier({ type, magical }));
  }

  static applyAttackFlag(attackFlag: AttackFlag) {
    const { damage, hits } = attackFlag;
    const target = game.actors.get(attackFlag.target);
    const actor = game.actors.get(attackFlag.actor);
    const item = actor.items.get(attackFlag.item);
    if (hits) {
      for (const value of damage) {
        const targetHelper = new ActorHelper(target);
        const magical = item.data.type === 'spell';
        targetHelper.applyDamage(value.type, value.total, magical);
      }
    }
  }
}
