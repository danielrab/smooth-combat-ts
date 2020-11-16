var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export default class RollHandler {
    constructor(roll) {
        this.roll = roll;
    }
    get total() {
        return this.roll.total;
    }
    get formula() {
        return this.roll._formula;
    }
    rollDetailsRender() {
        return $('<div>').addClass('smooth-combat-roll-details')
            .append(this.roll.terms.map((term) => {
            if (typeof term === 'object') {
                return $('<div>')
                    .append(term.results.length > 1 ? '(' : '')
                    .append(term.results.map((result) => $('<div>')
                    .addClass(`smooth-combat-die d${term.faces} ${result.discarded ? 'discarded' : ''}`)
                    .prop('title', `d${term.faces}`)
                    .append(result.result)))
                    .append(term.results.length > 1 ? '(' : '');
            }
            return term;
        }));
    }
    query() {
        return __awaiter(this, void 0, void 0, function* () {
            return $('<div>').addClass('smooth-combat-roll').prop('title', this.formula)
                .append(this.rollDetailsRender())
                .append($('<h4>').addClass('smooth-combat-total')
                .append(this.totalString));
        });
    }
}
