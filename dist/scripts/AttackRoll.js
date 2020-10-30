var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class AttackRollHandler {
    constructor(roll, target) {
        this.roll = roll;
        this.target = target;
    }
    get hits() {
        return this.total >= this.target.actor.ac && !this.fumble;
    }
    get die() {
        return this.roll.terms[0];
    }
    get total() {
        return this.roll.total;
    }
    get formula() {
        return this.roll._formula;
    }
    get critical() {
        return this.die.results[0].result >= this.die.options.critical;
    }
    get fumble() {
        return this.die.results[0].result <= this.die.options.fumble;
    }
}
export default function attackRoll(item, target, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const roll = yield item.rollAttack(Object.assign(Object.assign({}, options), { fastForward: true, chatMessage: false }));
        return new AttackRollHandler(roll, target);
    });
}
