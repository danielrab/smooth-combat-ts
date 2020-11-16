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
export class DamageRollHandler {
    constructor(parts) {
        this.parts = parts;
    }
    query() {
        return $('<div>')
            .append(this.parts.map((part) => part.query()));
    }
}
export function damageRoll(rollData, versatile, critical, actor) {
    return __awaiter(this, void 0, void 0, function* () {
        const damageParts = rollData.item.damage.parts.map(([damage, type]) => ({ damage, type, primary: false }));
        damageParts[0].primary = true;
        const rollParts = yield Promise.all(damageParts.map((part) => __awaiter(this, void 0, void 0, function* () { return DamageRollPart(rollData, part, critical, actor); })));
        if (versatile && rollData.item.damage.versatile) {
            const part = {
                damage: rollData.item.damage.versatile,
                type: damageParts[0].type,
                primary: true,
            };
            const versatileRollPart = yield DamageRollPart(rollData, part, critical, actor);
            rollParts[0] = versatileRollPart;
        }
        return new DamageRollHandler(rollParts);
    });
}
