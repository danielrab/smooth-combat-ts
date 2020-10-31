var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { DamageRollPart } from './DamageRollPart.js';
import settings from './settings.js';
export class DamageRollHandler {
    constructor(parts) {
        this.parts = parts;
    }
    apply(target) {
        const damage = this.parts.map((part) => part.getDamage(target)).reduce((a, b) => a + b);
        if (settings.applyDamage)
            target.actor.applyDamage(damage);
        return damage;
    }
}
export function damageRoll(rollData, versatile, critical) {
    return __awaiter(this, void 0, void 0, function* () {
        const damageParts = rollData.item.damage.parts;
        const rollParts = yield Promise.all(damageParts.map((part) => __awaiter(this, void 0, void 0, function* () { return DamageRollPart(rollData, part, critical); })));
        if (versatile && rollData.item.damage.versatile) {
            const part = [rollData.item.damage.versatile, damageParts[0][1]];
            const versatileRollPart = yield DamageRollPart(rollData, part, critical);
            rollParts[0] = versatileRollPart;
        }
        return new DamageRollHandler(rollParts);
    });
}
