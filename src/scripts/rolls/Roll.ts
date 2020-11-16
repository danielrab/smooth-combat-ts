export default abstract class RollHandler {
  roll: Roll

  constructor(roll: Roll) {
    this.roll = roll;
  }

  get total() {
    return this.roll.total;
  }

  get formula() {
    return this.roll._formula;
  }

  abstract get totalString(): string

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
    return $('<div>').addClass('smooth-combat-roll').prop('title', this.formula)
      .append(this.rollDetailsRender())
      .append($('<h4>').addClass('smooth-combat-total')
        .append(this.totalString));
  }
}
