var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import RollHandler from './Roll.js';
export class DamageRollPartHandler extends RollHandler {
    constructor(roll, type) {
        super(roll);
        this.type = type;
    }
    get totalString() {
        return `${this.total} ${this.type ? this.type : 'non-damage'}`;
    }
}
export function DamageRollPart(rollData, { damage, type, primary }, critical, actor) {
    return __awaiter(this, void 0, void 0, function* () {
        const actorBonus = getProperty(actor.data.data, `bonuses.${rollData.item.actionType}`) || {};
        if (primary && actorBonus.damage && (Math.floor(actorBonus.damage) !== 0)) {
            damage += actorBonus.damage;
        }
        const roll = yield game.dnd5e.dice.damageRoll({
            parts: [damage],
            data: rollData,
            critical,
            fastForward: true,
            chatMessage: false,
            criticalBonusDice: rollData.item.actionType === 'mwak' ? actor.getFlag('dnd5e', 'meleeCriticalDamageDice') : 0,
        });
        return new DamageRollPartHandler(roll, type);
    });
}
