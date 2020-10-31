export default class AttackResult {
    constructor(attackRollResult, damageRollResult, item, target) {
        this.attackRoll = attackRollResult;
        this.damageRoll = damageRollResult;
        this.item = item;
        this.target = target;
        this.actor = item.actor;
    }
    attackResultHTML() {
        return renderTemplate('./modules/smooth-combat/templates/attackResult.hbs', this);
    }
}
