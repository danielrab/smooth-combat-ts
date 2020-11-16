var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export class AttackResult {
    constructor(attackRollResult, damageRollResult, item, target) {
        this.attackRoll = attackRollResult;
        this.damageRoll = damageRollResult;
        this.item = item;
        this.target = target;
        this.actor = item.actor;
    }
    query() {
        return __awaiter(this, void 0, void 0, function* () {
            const res = $('<div>');
            if (this.attackRoll)
                res.append(yield this.attackRoll.query());
            res.append(`${this.actor.name} `);
            if (!this.attackRoll)
                res.append(`uses ${this.item.name} on ${this.target.name}`);
            else
                res.append(`${this.attackRoll.hits ? 'hits' : 'misses'} ${this.target.name} with ${this.item.name}`);
            if (!this.attackRoll || this.attackRoll.hits) {
                res.append('<br>dealing');
                res.append(this.damageRoll.query());
            }
            return res;
        });
    }
    render() {
        return renderTemplate('./modules/smooth-combat/templates/attackResult.hbs', this);
    }
    get flags() {
        var _a;
        return {
            actor: this.actor.id,
            attack: (_a = this.attackRoll) === null || _a === void 0 ? void 0 : _a.total,
            crit: this.attackRoll ? this.attackRoll.critical : false,
            damage: this.damageRoll.parts.map((part) => ({ total: part.total, type: part.type })),
            fumble: this.attackRoll ? this.attackRoll.fumble : false,
            hits: this.attackRoll ? this.attackRoll.hits : true,
            item: this.item.id,
            target: this.target.id,
        };
    }
}
