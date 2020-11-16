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
export class AttackRollHandler extends RollHandler {
    constructor(roll, target) {
        super(roll);
        this.target = target;
    }
    get hits() {
        return this.total >= this.target.ac && !this.fumble;
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
export function attackRoll(item, target, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const roll = yield item.rollAttack(Object.assign(Object.assign({}, options), { fastForward: true, chatMessage: false }));
        return new AttackRollHandler(roll, target);
    });
}
