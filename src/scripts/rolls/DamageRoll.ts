import { DamageRollPart, DamageRollPartHandler } from './DamageRollPart.js';

export class DamageRollHandler {
  parts: DamageRollPartHandler[]

  constructor(parts: DamageRollPartHandler[]) {
    this.parts = parts;
  }

  query() {
    return $('<div>')
      .append(this.parts.map((part) => part.query()));
  }
}

export async function damageRoll(
  rollData: ItemRollData, versatile: boolean, critical: boolean, actor: Actor,
) {
  const damageParts = rollData.item.damage.parts.map(
    ([damage, type]) => ({ damage, type, primary: false }),
  );
  damageParts[0].primary = true;
  const rollParts = await Promise.all(damageParts.map(
    async (part) => DamageRollPart(rollData, part, critical, actor),
  ));
  if (versatile && rollData.item.damage.versatile) {
    const part = {
      damage: rollData.item.damage.versatile,
      type: damageParts[0].type,
      primary: true,
    };
    const versatileRollPart = await DamageRollPart(rollData, part, critical, actor);
    rollParts[0] = versatileRollPart;
  }
  return new DamageRollHandler(rollParts);
}
