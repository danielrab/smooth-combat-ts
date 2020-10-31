import { DamageRollPart, DamageRollPartHandler } from './DamageRollPart.js';
import settings from './settings.js';

export class DamageRollHandler {
  parts: DamageRollPartHandler[]

  constructor(parts: DamageRollPartHandler[]) {
    this.parts = parts;
  }

  apply(target: Token) {
    const damage = this.parts.map((part) => part.getDamage(target)).reduce((a, b) => a + b);
    if (settings.applyDamage) target.actor.applyDamage(damage);
    return damage;
  }
}

export async function damageRoll(rollData: ItemRollData, versatile: boolean, critical: boolean) {
  const damageParts = rollData.item.damage.parts;
  const rollParts = await Promise.all(damageParts.map(
    async (part) => DamageRollPart(rollData, part, critical),
  ));
  if (versatile && rollData.item.damage.versatile) {
    const part: [string, string] = [rollData.item.damage.versatile, damageParts[0][1]];
    const versatileRollPart = await DamageRollPart(rollData, part, critical);
    rollParts[0] = versatileRollPart;
  }
  return new DamageRollHandler(rollParts);
}
