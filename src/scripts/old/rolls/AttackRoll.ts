import RollHandler from './Roll.js';
import ActorHelper from '../helpers/actor.js';

export class AttackRollHandler extends RollHandler {
  roll: Roll;
  target: Actor;

  constructor(roll: Roll, target: Actor) {
    super(roll);
    this.target = target;
  }

  get hits() {
    return this.total >= new ActorHelper(this.target).ac && !this.fumble;
  }

  get die() {
    return this.roll.terms[0];
  }

  get critical() {
    return this.die.results[0].result >= this.die.options.critical;
  }

  get fumble() {
    return this.die.results[0].result <= this.die.options.fumble;
  }

  get totalString() {
    return String(this.total);
  }
}

export async function attackRoll(item, target: Actor, options) {
  const roll = await item.rollAttack({
    ...options,
    fastForward: true,
    chatMessage: false,
  });

  return new AttackRollHandler(roll, target);
}
