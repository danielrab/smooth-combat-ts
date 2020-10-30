import { DamageRollPart, DamageRollPartHandler } from './DamageRollPart.js';
import settings from './settings.js';

class DamageRollHandler {
  parts: Array<DamageRollPartHandler>
  constructor(parts) {
    this.parts = parts;
  }

  apply(target) {
    const damage = this.parts.map((part) => part.getDamage(target)).reduce((a, b) => a + b);
    if (settings.applyDamage) target.actor.applyDamage(damage);
    return damage;
  }
}

export default async function damageRoll(item, versatile, critical) {
  const damageParts = item.data.data.damage.parts;
  const rollParts = await Promise.all(damageParts.map(
    async (part) => DamageRollPart(item, part, critical),
  ));
  if (versatile && item.data.data.damage.versatile) {
    const versatileRollPart = await DamageRollPart(item, [item.data.data.damage.versatile, damageParts[0][1]], critical);
    rollParts[0] = versatileRollPart;
  }
  return new DamageRollHandler(rollParts);
}
