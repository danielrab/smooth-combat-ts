var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export class DamageRollPartHandler {
    constructor(roll, type) {
        this.roll = roll;
        this.type = type;
    }
    get total() {
        return this.roll.total;
    }
    get formula() {
        return this.roll._formula;
    }
    getDamage(target) {
        return Math.floor(target.actor.damageMultiplier(this.type) * this.total);
    }
}
export function DamageRollPart(rollData, [formula, type], critical) {
    return __awaiter(this, void 0, void 0, function* () {
        const roll = yield game.dnd5e.dice.damageRoll({
            parts: [formula],
            data: rollData,
            critical,
            fastForward: true,
            chatMessage: false,
        });
        return new DamageRollPartHandler(roll, type);
    });
}
