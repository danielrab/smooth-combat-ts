import RollHandler from './Roll.js';

export class DamageRollPartHandler extends RollHandler {
  roll: Roll;
  type: string;

  constructor(roll: Roll, type: string) {
    super(roll);
    this.type = type;
  }

  get totalString() {
    return `${this.total} ${this.type ? this.type : 'non-damage'}`;
  }
}

export async function DamageRollPart(
  rollData: ItemRollData,
  { damage, type, primary }: { damage: string, type: string, primary: boolean },
  critical: boolean,
  actor: Actor,
) {
  const actorBonus = getProperty(actor.data.data, `bonuses.${rollData.item.actionType}`) || {};
  if (primary && actorBonus.damage && (Math.floor(actorBonus.damage) !== 0)) {
    damage += actorBonus.damage;
  }
  const roll = await game.dnd5e.dice.damageRoll({
    parts: [damage],
    data: rollData,
    critical,
    fastForward: true,
    chatMessage: false,
    criticalBonusDice: rollData.item.actionType === 'mwak' ? actor.getFlag('dnd5e', 'meleeCriticalDamageDice') : 0,
  });
  return new DamageRollPartHandler(roll, type);
}
