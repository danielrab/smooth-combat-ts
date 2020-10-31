export class DamageRollPartHandler {
  roll: Roll;
  type: string;

  constructor(roll: Roll, type: string) {
    this.roll = roll;
    this.type = type;
  }

  get total() {
    return this.roll.total;
  }

  get formula() {
    return this.roll._formula;
  }

  getDamage(target: Token) {
    return Math.floor(target.actor.damageMultiplier(this.type) * this.total);
  }
}

export async function DamageRollPart(
  rollData: ItemRollData,
  [formula, type]: [string, string],
  critical: boolean,
) {
  const roll = await game.dnd5e.dice.damageRoll({
    parts: [formula],
    data: rollData,
    critical,
    fastForward: true,
    chatMessage: false,
  });
  return new DamageRollPartHandler(roll, type);
}
